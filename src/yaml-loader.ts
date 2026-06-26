import { unzipSync } from "fflate"
import { Course } from "./courseFormat/Course"
import { CourseMode } from "./courseFormat/CourseMode"
import { Section } from "./courseFormat/Section"
import { Lesson } from "./courseFormat/Lesson"
import { FrameworkLesson } from "./courseFormat/FrameworkLesson"
import { Task } from "./courseFormat/tasks/Task"
import { EduTask } from "./courseFormat/tasks/EduTask"
import { OutputTask } from "./courseFormat/tasks/OutputTask"
import { TheoryTask } from "./courseFormat/tasks/TheoryTask"
import { IdeTask } from "./courseFormat/tasks/IdeTask"
import { ChoiceTask } from "./courseFormat/tasks/choice/ChoiceTask"
import { UnsupportedTask } from "./courseFormat/tasks/UnsupportedTask"
import { TaskFile } from "./courseFormat/TaskFile"
import { StudyItem } from "./courseFormat/StudyItem"
import { ItemContainer } from "./courseFormat/ItemContainer"
import { parseYaml } from "./yaml/YamlMapper"
import { buildCourse } from "./yaml/format/CourseYamlUtil"
import { buildSection } from "./yaml/format/SectionYamlUtil"
import { buildLesson } from "./yaml/format/LessonYamlUtil"
import { buildFrameworkLesson } from "./yaml/format/FrameworkLessonYamlMixin"
import { buildRemoteCourse } from "./yaml/format/remote/RemoteCourseYamlMixin"
import { RemoteStudyItem } from "./yaml/RemoteStudyItem"
import { YamlMixinNames } from "./yaml/YamlMixinNames"
import { formatError } from "./yaml/errorHandling/InvalidYamlFormatException"
import { unsupportedItemTypeMessage } from "./yaml/errorHandling/InvalidYamlFormatException"
import { LESSON, TASK } from "./courseFormat/EduFormatNames"

/**
 * Normalize a file path by resolving '..' and '.' segments.
 */
function normalizePath(path: string): string {
  const parts = path.replace(/\\/g, "/").split("/")
  const result: string[] = []
  for (const part of parts) {
    if (part === "." || part === "") continue
    if (part === "..") {
      if (result.length > 0) result.pop()
    } else {
      result.push(part)
    }
  }
  return result.join("/")
}

export function loadFromYamlZip(zipBuffer: ArrayBuffer | Uint8Array): Course {
  // Convert to Uint8Array if needed
  const buffer: Uint8Array = zipBuffer instanceof ArrayBuffer
    ? new Uint8Array(zipBuffer)
    : zipBuffer

  // Unzip the archive into a map of file path → Uint8Array
  const zipEntries: Record<string, Uint8Array> = unzipSync(buffer)

  // Locate course-info.yaml at the root of the archive
  const courseConfigKey = findEntry(zipEntries, "course-info.yaml")
  if (!courseConfigKey) {
    throw new Error("course-info.yaml not found in the zip archive")
  }

  // Read and parse the course config
  const courseConfigText = new TextDecoder().decode(zipEntries[courseConfigKey])
  const yaml: any = parseYaml(courseConfigText) ?? {}

  // Build the Course object
  const course = buildCourse(yaml)

  // Set courseMode based on the mode field
  const courseMode = yaml.mode as string | undefined
  course.courseMode = courseMode != null
    ? CourseMode.STUDENT
    : CourseMode.EDUCATOR

  // Set isMarketplace based on the type field
  course.isMarketplace = (yaml.type as string | undefined) === YamlMixinNames.MARKETPLACE_YAML_TYPE

  // Determine the course config directory (empty for root-level config)
  const courseDir = getDirPath(courseConfigKey)

  // Load additional files content from the zip
  for (const additionalFile of course.additionalFiles) {
    const filePath = normalizePath(`${courseDir}/${additionalFile.name}`)
    for (const key of Object.keys(zipEntries)) {
      const normalizedKey = normalizePath(key)
      if (normalizedKey === filePath) {
        additionalFile.text = new TextDecoder().decode(zipEntries[key])
        break
      }
    }
  }

  // Load top-level child items (lessons / sections) from the zip
  loadItems(course, courseDir, zipEntries)

  // Load remote info for course
  loadRemoteInfo(course, courseDir, zipEntries)

  // Initialize the full hierarchy with proper indices and parent references
  course.init(course, true)

  return course
}

/**
 * Recursively load child items for a given container.
 * Replaces TitledStudyItem / TaskWithType placeholders with actual items.
 */
function loadItems(
  parent: ItemContainer,
  parentDir: string,
  entries: Record<string, Uint8Array>,
): void {
  if (parent.items.length === 0) return

  const newItems: StudyItem[] = []
  let hasPlaceholders = false

  for (const placeholder of parent.items) {
    const childDir = parentDir
      ? `${parentDir}/${placeholder.name}`
      : placeholder.name

    // For course / section containers, try lesson or section config
    if (placeholder instanceof StudyItem && !(placeholder instanceof Task)) {
      // Try section config first
      const sectionConfigKey = findConfigKey(entries, childDir, "section-info.yaml")
      if (sectionConfigKey) {
        hasPlaceholders = true
        const configText = new TextDecoder().decode(entries[sectionConfigKey])
        const configYaml: any = parseYaml(configText) ?? {}
        const section = buildSection(configYaml)
        section.name = placeholder.name
        section.index = placeholder.index
        section.parent = parent
        loadItems(section, childDir, entries)
        loadRemoteInfo(section, childDir, entries)
        newItems.push(section)
        continue
      }

      // Try lesson config
      const lessonConfigKey = findConfigKey(entries, childDir, "lesson-info.yaml")
      if (lessonConfigKey) {
        hasPlaceholders = true
        const configText = new TextDecoder().decode(entries[lessonConfigKey])
        const configYaml: any = parseYaml(configText) ?? {}
        const lesson = buildLessonFromYaml(configYaml)
        lesson.name = placeholder.name
        lesson.index = placeholder.index
        lesson.parent = parent
        loadItems(lesson, childDir, entries)
        loadRemoteInfo(lesson, childDir, entries)
        newItems.push(lesson)
        continue
      }
    }

    // For lesson containers, try task config
    const taskConfigKey = findConfigKey(entries, childDir, "task-info.yaml")
    if (taskConfigKey) {
      hasPlaceholders = true
      const configText = new TextDecoder().decode(entries[taskConfigKey])
      const configYaml: any = parseYaml(configText) ?? {}
      const task = buildDeserializedTask(configYaml)
      task.name = placeholder.name
      task.index = placeholder.index
      task.parent = parent
      // Populate task files from the zip
      loadTaskFiles(task, childDir, configYaml, entries)
      loadRemoteInfo(task, childDir, entries)
      newItems.push(task)
      continue
    }

    // No config found — keep the placeholder as-is
    newItems.push(placeholder)
  }

  if (hasPlaceholders) {
    parent.items = newItems
  }
}

/**
 * Build a Lesson (or FrameworkLesson) from parsed YAML.
 */
function buildLessonFromYaml(yaml: any): Lesson {
  const type = yaml[YamlMixinNames.TYPE] as string | undefined
  if (type != null && type !== new Lesson().itemType) {
    if (type === new FrameworkLesson().itemType) {
      return buildFrameworkLesson(yaml)
    }
    return formatError(unsupportedItemTypeMessage(type, LESSON))
  }
  return buildLesson(yaml)
}

/**
 * Build a Task from parsed YAML based on its type field.
 * Mirrors the logic in YamlDeserializer.deserializeTask.
 */
function buildDeserializedTask(yaml: any): Task {
  const type = yaml[YamlMixinNames.TYPE] as string
  if (!type) {
    return formatError("Task type not specified")
  }

  let task: Task
  switch (type) {
    case EduTask.EDU_TASK_TYPE:
      task = new EduTask()
      break
    case OutputTask.OUTPUT_TASK_TYPE:
      task = new OutputTask()
      break
    case TheoryTask.THEORY_TASK_TYPE:
      task = new TheoryTask()
      break
    case ChoiceTask.CHOICE_TASK_TYPE:
      task = new ChoiceTask()
      break
    case IdeTask.IDE_TASK_TYPE:
      task = new IdeTask()
      break
    case UnsupportedTask.UNSUPPORTED_TASK_TYPE:
      task = new UnsupportedTask()
      break
    default:
      return formatError(unsupportedItemTypeMessage(type, TASK))
  }

  task.name = yaml.custom_name ?? task.name
  if (yaml.feedback_link != null) task.feedbackLink = yaml.feedback_link
  if (yaml.solution_hidden != null) task.solutionHidden = yaml.solution_hidden
  if (yaml.tags != null) task.contentTags = yaml.tags

  return task
}

/**
 * Populate task files from the zip archive.
 * For each entry in the YAML `files` array, find the corresponding file content in the zip.
 */
function loadTaskFiles(
  task: Task,
  taskDir: string,
  taskYaml: any,
  entries: Record<string, Uint8Array>,
): void {
  const files: any[] = taskYaml.files ?? []
  for (const fileEntry of files) {
    const fileName: string = fileEntry.name
    const isVisible: boolean = fileEntry.visible ?? true
    const filePath = normalizePath(`${taskDir}/${fileName}`)
    // Try exact match first, then search by normalized path suffix
    let fileContent = entries[filePath]
    if (!fileContent) {
      for (const key of Object.keys(entries)) {
        const normalizedKey = normalizePath(key)
        if (normalizedKey === filePath) {
          fileContent = entries[key]
          break
        }
      }
    }

    const taskFile = new TaskFile()
    taskFile.name = fileName
    taskFile.isVisible = isVisible
    taskFile.task = task
    if (fileContent) {
      taskFile.text = new TextDecoder().decode(fileContent)
    }
    task.addTaskFileInstance(taskFile)
  }
}

/**
 * Load remote info for a study item.
 * Looks for a `*-remote-info.yaml` file in the item's zip directory.
 */
function loadRemoteInfo(
  item: StudyItem,
  itemDir: string,
  entries: Record<string, Uint8Array>,
): void {
  let remoteConfigKey: string | undefined

  if (item instanceof Course) {
    remoteConfigKey = findConfigKey(entries, itemDir, "course-remote-info.yaml")
  } else if (item instanceof Section) {
    remoteConfigKey = findConfigKey(entries, itemDir, "section-remote-info.yaml")
  } else if (item instanceof Lesson) {
    remoteConfigKey = findConfigKey(entries, itemDir, "lesson-remote-info.yaml")
  } else if (item instanceof Task) {
    remoteConfigKey = findConfigKey(entries, itemDir, "task-remote-info.yaml")
  }

  if (!remoteConfigKey) return

  const configText = new TextDecoder().decode(entries[remoteConfigKey])
  const yaml: any = parseYaml(configText) ?? {}

  if (item instanceof Course) {
    const remoteCourse = buildRemoteCourse(yaml)
    item.id = remoteCourse.id
    item.updateDate = remoteCourse.updateDate
  } else {
    item.id = yaml.id ?? 0
    item.updateDate = yaml.update_date ? new Date(yaml.update_date) : new Date(0)
  }
}

/**
 * Find a zip entry by file name (at any depth).
 * Returns the full key (path) if found, or undefined.
 */
function findEntry(
  entries: Record<string, Uint8Array>,
  fileName: string,
): string | undefined {
  for (const key of Object.keys(entries)) {
    const parts = key.replace(/\\/g, "/").split("/")
    if (parts[parts.length - 1] === fileName) {
      return key
    }
  }
  return undefined
}

/**
 * Find a config file key by its parent directory and config filename.
 * Returns the full zip key if found, or undefined.
 */
function findConfigKey(
  entries: Record<string, Uint8Array>,
  dir: string,
  configFileName: string,
): string | undefined {
  const expectedPath = `${dir}/${configFileName}`
  for (const key of Object.keys(entries)) {
    const normalizedKey = key.replace(/\\/g, "/")
    if (normalizedKey === expectedPath || normalizedKey.endsWith(`/${expectedPath}`)) {
      return key
    }
  }
  return undefined
}

/**
 * Get the directory path from a zip entry key.
 * Returns empty string for root-level entries.
 */
function getDirPath(key: string): string {
  const normalized = key.replace(/\\/g, "/")
  const lastSlash = normalized.lastIndexOf("/")
  return lastSlash >= 0 ? normalized.substring(0, lastSlash) : ""
}

