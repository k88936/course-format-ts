import { unzipSync } from "fflate"
import { ZipData, TEST_AES_KEY, decryptAesCbc, bufferToBase64 } from "./zip-utils"
import type { Vendor } from "./models"
import { Vendor as VendorClass } from "./courseFormat/Vendor"
import { Course } from "./courseFormat/Course"
import { EduCourse } from "./courseFormat/EduCourse"
import { CourseraCourse } from "./courseFormat/CourseraCourse"
import { HyperskillCourse } from "./courseFormat/hyperskill/HyperskillCourse"
import { StepikCourse } from "./courseFormat/stepik/StepikCourse"
import { Section } from "./courseFormat/Section"
import { Lesson } from "./courseFormat/Lesson"
import { LessonContainer } from "./courseFormat/LessonContainer"
import { Task } from "./courseFormat/tasks/Task"
import { EduTask } from "./courseFormat/tasks/EduTask"
import { CodeTask } from "./courseFormat/tasks/CodeTask"
import { NumberTask } from "./courseFormat/tasks/NumberTask"
import { StringTask } from "./courseFormat/tasks/StringTask"
import { OutputTask } from "./courseFormat/tasks/OutputTask"
import { DataTask } from "./courseFormat/tasks/DataTask"
import { TableTask } from "./courseFormat/tasks/TableTask"
import { TheoryTask } from "./courseFormat/tasks/TheoryTask"
import { IdeTask } from "./courseFormat/tasks/IdeTask"
import { UnsupportedTask } from "./courseFormat/tasks/UnsupportedTask"
import { RemoteEduTask } from "./courseFormat/tasks/RemoteEduTask"
import { ChoiceTask } from "./courseFormat/tasks/choice/ChoiceTask"
import { ChoiceOption } from "./courseFormat/tasks/choice/ChoiceOption"
import { ChoiceOptionStatus } from "./courseFormat/tasks/choice/ChoiceOptionStatus"
import { MatchingTask } from "./courseFormat/tasks/matching/MatchingTask"
import { SortingTask } from "./courseFormat/tasks/matching/SortingTask"
import { TaskFile } from "./courseFormat/TaskFile"
import { AnswerPlaceholder } from "./courseFormat/AnswerPlaceholder"
import { CheckStatus } from "./courseFormat/CheckStatus"
import { CourseMode } from "./courseFormat/CourseMode"
import { DescriptionFormat } from "./courseFormat/DescriptionFormat"
import { EduFile } from "./courseFormat/EduFile"

// ── Types ────────────────────────────────────────────

type CourseJson = {
  title?: string
  summary?: string
  language?: string
  programming_language_id?: string
  environment?: string
  course_type?: string
  vendor?: { name?: string; url?: string; email?: string }
  items?: ItemJson[]
  additional_files?: AdditionalFileJson[]
  version?: number
  course_version?: number
  id?: number
  generated_edu_id?: number
  edu_plugin_version?: string
}

type ItemJson = {
  type?: string
  id?: number
  title?: string
  custom_name?: string
  items?: ItemJson[]
  task_list?: TaskJson[]
}

type TaskJson = {
  id?: number
  name?: string
  custom_name?: string
  task_type?: string
  description_text?: string
  description_format?: string
  feedback_link?: string
  solution_hidden?: boolean
  status?: string
  record?: number
  tags?: string[]
  files?: Record<string, FileConfigJson>
  // Choice-specific
  choiceOptions?: ChoiceOptionJson[]
  isMultipleChoice?: boolean
  messageIncorrect?: string
  // Matching-specific
  captions?: CaptionJson[]
  options?: string[]
  // Table-specific
  rows?: string[]
  columns?: string[]
  selected?: number[][]
}

type FileConfigJson = {
  name?: string
  placeholders?: PlaceholderJson[]
  is_visible?: boolean
  is_binary?: boolean
}

type PlaceholderJson = {
  offset?: number
  length?: number
  possible_answer?: string
  placeholder_text?: string
}

type ChoiceOptionJson = {
  text?: string
  status?: string
}

type CaptionJson = {
  first?: string
  second?: string
}

type AdditionalFileJson = {
  name?: string
  is_binary?: boolean
}

// ── Main exported function ──────────────────────────

export async function loadCourseJsonFromZip(
  data: Uint8Array,
  options?: { aesKey?: string }
): Promise<Course> {
  const zip = unzipSync(data) as ZipData
  const aesKey = options?.aesKey ?? TEST_AES_KEY

  const courseJsonRaw = zip["course.json"]
  if (!courseJsonRaw) {
    throw new Error("Missing course.json in zip archive")
  }
  const courseJson: CourseJson = JSON.parse(new TextDecoder().decode(courseJsonRaw))

  if (!courseJson.title) {
    throw new Error("Missing 'title' in course.json")
  }
  if (!courseJson.language) {
    throw new Error("Missing 'language' in course.json")
  }
  if (!courseJson.programming_language_id) {
    throw new Error("Missing 'programming_language_id' in course.json")
  }

  const course = createZipCourse(courseJson.course_type)
  hydrateZipCourse(course, courseJson)

  if (courseJson.items) {
    for (const item of courseJson.items) {
      if (item.type === "section" && item.items) {
        await loadZipSection(course, item, zip, aesKey)
      } else if (item.task_list) {
        // Direct lesson at top level (uncommon for this zip but handle it)
        await loadZipLesson(course, item, "", zip, aesKey)
      }
    }
  }

  if (courseJson.additional_files) {
    loadZipAdditionalFiles(course, courseJson.additional_files, zip)
  }

  return course
}

// ── Course creation and hydration ────────────────────

function createZipCourse(type: string | undefined): Course {
  switch (type) {
    case "hyperskill":
      return new HyperskillCourse()
    case "coursera":
      return new CourseraCourse()
    case "stepik":
      return new StepikCourse()
    default:
      return new EduCourse()
  }
}

function hydrateZipCourse(course: Course, json: CourseJson): void {
  course.name = json.title ?? ""
  course.description = json.summary ?? ""
  course.programmingLanguage = json.programming_language_id ?? ""
  course.environment = json.environment ?? course.environment
  course.languageCode = json.language ?? "en"

  if (json.vendor) {
    course.vendor = new VendorClass(json.vendor.name, json.vendor.email, json.vendor.url)
  }

  if (json.course_type === "Marketplace") {
    course.courseMode = CourseMode.STUDENT
  } else {
    course.courseMode = CourseMode.EDUCATOR
  }
}

// ── Section loading ──────────────────────────────────

async function loadZipSection(
  course: Course,
  sectionJson: ItemJson,
  zip: ZipData,
  aesKey: string
): Promise<void> {
  const section = new Section()
  section.name = sectionJson.title ?? ""
  if (sectionJson.custom_name) {
    section.customPresentableName = sectionJson.custom_name
  }

  const sectionTitle = sectionJson.title ?? ""
  const nestedItems = sectionJson.items ?? []
  for (const item of nestedItems) {
    if (item.type === "lesson" && item.task_list) {
      await loadZipLesson(section, item, sectionTitle, zip, aesKey)
    } else if (item.task_list) {
      // Also treat items with task_list as lessons even without explicit type
      await loadZipLesson(section, item, sectionTitle, zip, aesKey)
    }
  }

  course.addSection(section)
}

// ── Lesson loading ───────────────────────────────────

async function loadZipLesson(
  parent: LessonContainer,
  lessonJson: ItemJson,
  sectionTitle: string,
  zip: ZipData,
  aesKey: string
): Promise<void> {
  const lesson = new Lesson()
  lesson.name = lessonJson.title ?? ""
  if (lessonJson.custom_name) {
    lesson.customPresentableName = lessonJson.custom_name
  }

  const taskList = lessonJson.task_list ?? []
  for (const taskJson of taskList) {
    const task = await loadZipTask(taskJson, lessonJson, sectionTitle, zip, aesKey)
    if (task) {
      lesson.addTask(task)
    }
  }

  parent.addItem(lesson)
}

// ── Task loading ─────────────────────────────────────

async function loadZipTask(
  taskJson: TaskJson,
  lessonJson: ItemJson,
  sectionTitle: string,
  zip: ZipData,
  aesKey: string
): Promise<Task | null> {
  if (!taskJson.task_type) {
    return null
  }

  const task = createZipTask(taskJson.task_type)
  if (!task) {
    return null
  }

  // Basic fields
  task.name = taskJson.name ?? ""
  task.id = taskJson.id ?? 0
  if (taskJson.custom_name) {
    task.customPresentableName = taskJson.custom_name
  }
  task.descriptionText = taskJson.description_text ?? ""
  if (taskJson.description_format) {
    task.descriptionFormat = taskJson.description_format as DescriptionFormat
  }
  if (taskJson.feedback_link !== undefined) {
    task.feedbackLink = taskJson.feedback_link
  }
  if (taskJson.solution_hidden !== undefined) {
    task.solutionHidden = taskJson.solution_hidden
  }
  if (taskJson.status !== undefined && taskJson.status !== null) {
    const statusMap: Record<string, CheckStatus> = {
      Unchecked: CheckStatus.Unchecked,
      Solved: CheckStatus.Solved,
      Failed: CheckStatus.Failed,
    }
    task.status = statusMap[taskJson.status] ?? CheckStatus.Unchecked
  }
  if (typeof taskJson.record === "number") {
    task.record = taskJson.record
  }
  if (Array.isArray(taskJson.tags)) {
    task.contentTags = taskJson.tags.map(String)
  }

  // Load task files
  const lessonTitle = lessonJson.title ?? ""
  const files = taskJson.files ?? {}
  for (const filename of Object.keys(files)) {
    const fileConfig = files[filename]
    const taskFile = await loadZipTaskFile(filename, fileConfig, task.name, sectionTitle, lessonTitle, zip, aesKey)
    if (taskFile) {
      task.addTaskFileInstance(taskFile)
    }
  }

  // Hydrate type-specific fields
  if (task instanceof ChoiceTask) {
    hydrateZipChoiceTask(task, taskJson)
  } else if (task instanceof MatchingTask) {
    hydrateZipMatchingTask(task, taskJson)
  } else if (task instanceof SortingTask) {
    hydrateZipSortingTask(task, taskJson)
  } else if (task instanceof TableTask) {
    hydrateZipTableTask(task, taskJson)
  }

  return task
}

function createZipTask(taskType: string): Task | null {
  switch (taskType) {
    case "edu":
    case "pycharm":
      return new EduTask()
    case "code":
      return new CodeTask()
    case "number":
      return new NumberTask()
    case "string":
      return new StringTask()
    case "output":
      return new OutputTask()
    case "dataset":
      return new DataTask()
    case "table":
      return new TableTask()
    case "theory":
      return new TheoryTask()
    case "ide":
      return new IdeTask()
    case "unsupported":
      return new UnsupportedTask()
    case "remote_edu":
      return new RemoteEduTask()
    case "choice":
      return new ChoiceTask()
    case "matching":
      return new MatchingTask()
    case "sorting":
      return new SortingTask()
    default:
      return null
  }
}

// ── Task file loading ────────────────────────────────

async function loadZipTaskFile(
  filename: string,
  config: FileConfigJson,
  taskName: string,
  sectionTitle: string,
  lessonTitle: string,
  zip: ZipData,
  aesKey: string
): Promise<TaskFile | null> {
  if (!config.name) {
    return null
  }

  const taskFile = new TaskFile()
  taskFile.name = config.name ?? filename
  taskFile.isVisible = config.is_visible ?? true

  const isBinary = config.is_binary ?? false

  // Read file content from contents/ path
  // Path: contents/{sectionTitle}/{lessonTitle}/{taskName}/{filename}
  const contentPath = buildContentPath(sectionTitle, lessonTitle, taskName, config.name ?? filename)
  let fileContent: string | undefined

  if (isBinary) {
    const rawData = zip[contentPath]
    if (rawData) {
      fileContent = bufferToBase64(rawData)
    }
  } else {
    const rawData = zip[contentPath]
    if (rawData) {
      fileContent = new TextDecoder().decode(rawData)
    }
  }

  if (fileContent !== undefined) {
    taskFile.text = fileContent
  }

  // Handle placeholders
  const placeholders = config.placeholders ?? []
  for (const ph of placeholders) {
    if (ph.offset !== undefined && ph.placeholder_text !== undefined) {
      const placeholder = new AnswerPlaceholder(ph.offset, ph.placeholder_text)
      placeholder.length = ph.length ?? ph.placeholder_text.length

      // Decrypt possible_answer if present
      if (ph.possible_answer) {
        const decrypted = await decryptAesCbc(ph.possible_answer, aesKey)
        if (decrypted !== undefined && decrypted.length > 0) {
          placeholder.possibleAnswer = decrypted
        } else {
          placeholder.possibleAnswer = ph.possible_answer
        }
      }

      taskFile.addAnswerPlaceholder(placeholder)
    }
  }

  return taskFile
}

function buildContentPath(
  sectionTitle: string,
  lessonTitle: string,
  taskName: string,
  filename: string
): string {
  const parts = ["contents"]
  if (sectionTitle) {
    parts.push(sectionTitle)
  }
  parts.push(lessonTitle)
  parts.push(taskName)
  parts.push(filename)
  return parts.join("/")
}

// ── Type-specific hydration ──────────────────────────

function hydrateZipChoiceTask(task: ChoiceTask, json: TaskJson): void {
  if (json.isMultipleChoice !== undefined) {
    task.isMultipleChoice = json.isMultipleChoice
  }
  if (json.messageIncorrect !== undefined) {
    task.messageIncorrect = json.messageIncorrect
  }
  if (Array.isArray(json.choiceOptions)) {
    task.choiceOptions = json.choiceOptions.map((opt: ChoiceOptionJson) => {
      const option = new ChoiceOption()
      option.text = opt.text ?? ""
      if (opt.status === "CORRECT") {
        option.status = ChoiceOptionStatus.CORRECT
      } else if (opt.status === "INCORRECT") {
        option.status = ChoiceOptionStatus.INCORRECT
      }
      return option
    })
  }
}

function hydrateZipMatchingTask(task: MatchingTask, json: TaskJson): void {
  if (Array.isArray(json.captions)) {
    task.captions = json.captions.map((c: CaptionJson) => {
      const first = String(c.first ?? "")
      const second = String(c.second ?? "")
      return `${first} : ${second}`
    })
  }
  if (Array.isArray(json.options)) {
    task.options = json.options.map(String)
  }
}

function hydrateZipSortingTask(task: SortingTask, json: TaskJson): void {
  if (Array.isArray(json.options)) {
    task.options = json.options.map(String)
  }
}

function hydrateZipTableTask(task: TableTask, json: TaskJson): void {
  if (json.isMultipleChoice !== undefined) {
    task.isMultipleChoice = json.isMultipleChoice
  }
  if (Array.isArray(json.rows)) {
    task.rows = json.rows.map(String)
  }
  if (Array.isArray(json.columns)) {
    task.columns = json.columns.map(String)
  }
  if (Array.isArray(json.selected)) {
    task.selected = json.selected.map((row) => row.map(Boolean))
  }
}

// ── Additional files ─────────────────────────────────

function loadZipAdditionalFiles(
  course: Course,
  additionalFiles: AdditionalFileJson[],
  zip: ZipData
): void {
  for (const af of additionalFiles) {
    if (!af.name) continue

    const contentPath = `contents/${af.name}`
    const rawData = zip[contentPath]
    if (!rawData) continue

    const eduFile = new EduFile()
    eduFile.name = af.name

    if (af.is_binary) {
      eduFile.text = bufferToBase64(rawData)
    } else {
      eduFile.text = new TextDecoder().decode(rawData)
    }

    course.additionalFiles.push(eduFile)
  }
}

