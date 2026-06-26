// TODO: mirror of edu-format/src/com/jetbrains/edu/learning/yaml/YamlDeserializer.kt

import { parseYaml } from "./YamlMapper"
import { Course } from "../courseFormat/Course"
import { Section } from "../courseFormat/Section"
import { Lesson } from "../courseFormat/Lesson"
import { FrameworkLesson } from "../courseFormat/FrameworkLesson"
import { Task } from "../courseFormat/tasks/Task"
import { EduTask } from "../courseFormat/tasks/EduTask"
import { OutputTask } from "../courseFormat/tasks/OutputTask"
import { TheoryTask } from "../courseFormat/tasks/TheoryTask"
import { IdeTask } from "../courseFormat/tasks/IdeTask"
import { UnsupportedTask } from "../courseFormat/tasks/UnsupportedTask"
import { ChoiceTask } from "../courseFormat/tasks/choice/ChoiceTask"
import { StudyItem } from "../courseFormat/StudyItem"
import { CourseMode } from "../courseFormat/CourseMode"
import { COURSE_CONFIG, SECTION_CONFIG, LESSON_CONFIG, TASK_CONFIG, REMOTE_COURSE_CONFIG, REMOTE_SECTION_CONFIG, REMOTE_LESSON_CONFIG, REMOTE_TASK_CONFIG } from "./YamlConfigSettings"
import { YamlMixinNames } from "./YamlMixinNames"
import { buildCourse } from "./format/CourseYamlUtil"
import { buildSection } from "./format/SectionYamlUtil"
import { buildLesson } from "./format/LessonYamlUtil"
import { buildFrameworkLesson } from "./format/FrameworkLessonYamlMixin"
import { buildRemoteCourse } from "./format/remote/RemoteCourseYamlMixin"
import { RemoteStudyItem } from "./RemoteStudyItem"
import { loadingError } from "./errorHandling/YamlLoadingException"
import { unknownConfigMessage } from "./errorHandling/YamlLoadingException"
import { formatError } from "./errorHandling/InvalidYamlFormatException"
import { unsupportedItemTypeMessage } from "./errorHandling/InvalidYamlFormatException"
import { LESSON, TASK } from "../courseFormat/EduFormatNames"
import { message } from "../courseFormat/uiMessages"

export function deserializeItem(configName: string, configFileText: string, parentItem?: StudyItem, itemFolder?: string): StudyItem | null {
  switch (configName) {
    case COURSE_CONFIG:
      return deserializeCourse(configFileText)
    case SECTION_CONFIG:
      return deserializeSection(configFileText, parentItem as Course | undefined, itemFolder)
    case LESSON_CONFIG:
      return deserializeLesson(configFileText, parentItem, itemFolder)
    case TASK_CONFIG:
      return deserializeTask(configFileText, parentItem as Lesson | undefined, itemFolder)
    default:
      return loadingError(unknownConfigMessage(configName))
  }
}

/**
 * Deserialize course from YAML config.
 * Returns `null` for legacy `hyperskill`/`stepik` course types.
 */
export function deserializeCourse(configFileText: string): Course | null {
  const yaml: any = parseYaml(configFileText) ?? {}

  const type = yaml[YamlMixinNames.TYPE]
  if (type === YamlMixinNames.HYPERSKILL_TYPE_YAML || type === YamlMixinNames.STEPIK_TYPE_YAML) {
    return null
  }

  const course = buildCourse(yaml)
  const courseMode = yaml.mode as string | undefined
  course.courseMode = courseMode != null ? CourseMode.STUDENT : CourseMode.EDUCATOR
  course.isMarketplace = (yaml.type as string | undefined) === YamlMixinNames.MARKETPLACE_YAML_TYPE
  return course
}

export function deserializeSection(configFileText: string, parentCourse?: Course, sectionFolder?: string): Section {
  const yaml: any = parseYaml(configFileText) ?? {}
  return buildSection(yaml)
}

export function deserializeLesson(configFileText: string, parentItem?: StudyItem, lessonFolder?: string): Lesson {
  const yaml: any = parseYaml(configFileText) ?? {}

  const type = yaml[YamlMixinNames.TYPE] as string | undefined
  if (type != null && type !== new Lesson().itemType) {
    switch (type) {
      case new FrameworkLesson().itemType:
        return buildFrameworkLesson(yaml)
      default:
        return formatError(unsupportedItemTypeMessage(type, LESSON))
    }
  }

  return buildLesson(yaml)
}

export function deserializeTask(configFileText: string, parentLesson?: Lesson, taskFolder?: string): Task {
  const yaml: any = parseYaml(configFileText) ?? {}

  const type = yaml[YamlMixinNames.TYPE] as string
  if (!type) {
    return formatError(message("yaml.editor.invalid.task.type.not.specified"))
  }

  switch (type) {
    case EduTask.EDU_TASK_TYPE:
      return buildDeserializedTask(yaml, () => new EduTask())
    case OutputTask.OUTPUT_TASK_TYPE:
      return buildDeserializedTask(yaml, () => new OutputTask())
    case TheoryTask.THEORY_TASK_TYPE:
      return buildDeserializedTask(yaml, () => new TheoryTask())
    case ChoiceTask.CHOICE_TASK_TYPE:
      return buildDeserializedTask(yaml, () => new ChoiceTask())
    case IdeTask.IDE_TASK_TYPE:
      return buildDeserializedTask(yaml, () => new IdeTask())
    case UnsupportedTask.UNSUPPORTED_TASK_TYPE:
      return buildDeserializedTask(yaml, () => new UnsupportedTask())
    default:
      return formatError(unsupportedItemTypeMessage(type, TASK))
  }
}

function buildDeserializedTask<T extends Task>(yaml: any, createTask: () => T): T {
  // TODO: use TaskFileYamlUtil to deserialize files and other task properties
  const task = createTask()
  task.name = yaml.custom_name ?? task.name
  if (yaml.feedback_link != null) task.feedbackLink = yaml.feedback_link
  if (yaml.solution_hidden != null) task.solutionHidden = yaml.solution_hidden
  if (yaml.tags != null) task.contentTags = yaml.tags
  return task
}

export function deserializeRemoteItem(configName: string, configFileText: string): StudyItem {
  switch (configName) {
    case REMOTE_COURSE_CONFIG:
      return deserializeCourseRemoteInfo(configFileText)
    case REMOTE_LESSON_CONFIG:
      return deserializeLessonRemoteInfo(configFileText)
    case REMOTE_SECTION_CONFIG:
      return deserializeSectionRemoteInfo(configFileText)
    case REMOTE_TASK_CONFIG:
      return deserializeTaskRemoteInfo(configFileText)
    default:
      return loadingError(unknownConfigMessage(configName))
  }
}

function deserializeCourseRemoteInfo(configFileText: string): Course {
  const yaml: any = parseYaml(configFileText) ?? {}
  const course = buildRemoteCourse(yaml)
  return course
}

function deserializeLessonRemoteInfo(configFileText: string): StudyItem {
  const yaml: any = parseYaml(configFileText) ?? {}
  const item = new RemoteStudyItem()
  item.id = yaml.id ?? 0
  item.updateDate = yaml.update_date ? new Date(yaml.update_date) : new Date(0)
  return item
}

function deserializeSectionRemoteInfo(configFileText: string): StudyItem {
  const yaml: any = parseYaml(configFileText) ?? {}
  const item = new RemoteStudyItem()
  item.id = yaml.id ?? 0
  item.updateDate = yaml.update_date ? new Date(yaml.update_date) : new Date(0)
  return item
}

function deserializeTaskRemoteInfo(configFileText: string): StudyItem {
  const yaml: any = parseYaml(configFileText) ?? {}
  const item = new RemoteStudyItem()
  item.id = yaml.id ?? 0
  item.updateDate = yaml.update_date ? new Date(yaml.update_date) : new Date(0)
  return item
}

/**
 * Get the list of children config file names for a given StudyItem
 */
export function getChildrenConfigFileNames(item: StudyItem): string[] {
  if (item instanceof Course) return [SECTION_CONFIG, LESSON_CONFIG]
  if (item instanceof Section) return [LESSON_CONFIG]
  if (item instanceof Lesson) return [TASK_CONFIG]
  throw new Error("Unexpected StudyItem type")
}

/**
 * Get CourseMode from course config text
 */
export function getCourseMode(courseConfigText: string): CourseMode | undefined {
  const yaml: any = parseYaml(courseConfigText)
  const courseModeText = yaml?.[YamlMixinNames.MODE] as string | undefined
  if (courseModeText == null) return undefined
  return courseModeText === CourseMode.STUDENT ? CourseMode.STUDENT : CourseMode.EDUCATOR
}
