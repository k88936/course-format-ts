import {unzipSync} from "fflate"
import {parse} from "yaml"
import type {Vendor} from "./models"
import {ZipData, TEST_AES_KEY, decryptAesCbc, bufferToBase64} from "./zip-utils"
import {CheckStatus} from "./courseFormat/CheckStatus"
import {CourseMode} from "./courseFormat/CourseMode"
import {Lesson} from "./courseFormat/Lesson"
import {FrameworkLesson} from "./courseFormat/FrameworkLesson"
import {Section} from "./courseFormat/Section"
import {Course} from "./courseFormat/Course"
import {EduCourse} from "./courseFormat/EduCourse"
import {CourseraCourse} from "./courseFormat/CourseraCourse"
import {HyperskillCourse} from "./courseFormat/hyperskill/HyperskillCourse"
import {StepikCourse} from "./courseFormat/stepik/StepikCourse"
import {StepikLesson} from "./courseFormat/stepik/StepikLesson"
import {Task} from "./courseFormat/tasks/Task"
import {EduTask} from "./courseFormat/tasks/EduTask"
import {CodeTask} from "./courseFormat/tasks/CodeTask"
import {NumberTask} from "./courseFormat/tasks/NumberTask"
import {StringTask} from "./courseFormat/tasks/StringTask"
import {OutputTask} from "./courseFormat/tasks/OutputTask"
import {DataTask} from "./courseFormat/tasks/DataTask"
import {TableTask} from "./courseFormat/tasks/TableTask"
import {TheoryTask} from "./courseFormat/tasks/TheoryTask"
import {IdeTask} from "./courseFormat/tasks/IdeTask"
import {UnsupportedTask} from "./courseFormat/tasks/UnsupportedTask"
import {RemoteEduTask} from "./courseFormat/tasks/RemoteEduTask"
import {ChoiceTask} from "./courseFormat/tasks/choice/ChoiceTask"
import {ChoiceOption} from "./courseFormat/tasks/choice/ChoiceOption"
import {ChoiceOptionStatus} from "./courseFormat/tasks/choice/ChoiceOptionStatus"
import {MatchingTask} from "./courseFormat/tasks/matching/MatchingTask"
import {SortingTask} from "./courseFormat/tasks/matching/SortingTask"
import {TaskFile} from "./courseFormat/TaskFile"

const COURSE_CONFIG = "course-info.yaml"
const LESSON_CONFIG = "lesson-info.yaml"
const TASK_CONFIG = "task-info.yaml"

type RawYaml = Record<string, unknown>

type CourseYaml = {
    type?: string
    title?: string
    summary?: string
    language?: string
    programming_language?: string
    programming_language_version?: string
    environment?: string
    solutions_hidden?: boolean
    environment_settings?: Record<string, string>
    additional_files?: TaskFileYaml[]
    custom_content_path?: string
    disabled_features?: string[]
    vendor?: Vendor
    is_private?: boolean
    mode?: string
    content?: Array<string | null>
}

type LessonYaml = {
    custom_name?: string
    tags?: string[]
    content?: Array<string | null>
}

type TaskFileYaml = {
    name?: string
    text?: string
    encrypted_text?: string
    visible?: boolean
    editable?: boolean
    propagatable?: boolean
    is_binary?: boolean
    learner_created?: boolean
}

function createCourse(type: string | undefined): Course {
    switch (type) {
        case "hyperskill":
            return new HyperskillCourse()
        case "coursera":
            return new CourseraCourse()
        case "stepik":
            return new StepikCourse()
        default:
            const course = new EduCourse()
            return course
    }
}

function hydrateCourse(course: Course, yaml: CourseYaml): void {
    course.name = yaml.title ?? ""
    course.description = yaml.summary ?? ""
    course.programmingLanguage = yaml.programming_language ?? ""
    course.languageVersion = yaml.programming_language_version
    course.environment = yaml.environment ?? course.environment
    course.solutionsHidden = yaml.solutions_hidden ?? course.solutionsHidden
    course.environmentSettings = (yaml.environment_settings as Record<string, string>) ?? course.environmentSettings
    course.customContentPath = yaml.custom_content_path ?? course.customContentPath
    course.disabledFeatures = (yaml.disabled_features as string[]) ?? course.disabledFeatures
    course.vendor = (yaml.vendor as Vendor) ?? course.vendor
    if (yaml.is_private !== undefined) course.isMarketplacePrivate = yaml.is_private
    if (yaml.mode) {
        course.courseMode = CourseMode.STUDENT
    } else {
        course.courseMode = CourseMode.EDUCATOR
    }
}

export async function loadCourseYamlFromZip(
    data: Uint8Array,
    options?: { aesKey?: string }
): Promise<Course> {
    const zip = unzipSync(data) as ZipData
    const aesKey = options?.aesKey ?? TEST_AES_KEY

    const courseYaml = readRawYamlFileFromZip<CourseYaml>(zip, COURSE_CONFIG)

    if (!courseYaml.title) {
        throw new Error(`Missing 'title' in ${COURSE_CONFIG}`)
    }
    if (!courseYaml.language) {
        throw new Error(`Missing 'language' in ${COURSE_CONFIG}`)
    }
    if (!courseYaml.programming_language) {
        throw new Error(`Missing 'programming_language' in ${COURSE_CONFIG}`)
    }

    const contentNames = ensureNamedContent(courseYaml.content, COURSE_CONFIG)

    const course = createCourse(courseYaml.type)
    hydrateCourse(course, courseYaml)
    course.languageCode = courseYaml.language

    const lessons = await Promise.all(
        contentNames.map((lessonName) => loadLesson(zip, lessonName, aesKey, courseYaml.type))
    )

    for (const lesson of lessons) {
        course.addLesson(lesson)
    }

    return course
}

function createLesson(courseType: string | undefined): Lesson {
    if (courseType === "stepik") {
        return new StepikLesson()
    }
    return new Lesson()
}

function hydrateLesson(lesson: Lesson, lessonName: string, yaml: LessonYaml): void {
    lesson.name = lessonName
    if (yaml.custom_name) {
        lesson.customPresentableName = yaml.custom_name
    }
    if (yaml.tags) {
        lesson.contentTags = yaml.tags
    }
}

async function loadLesson(zip: ZipData, lessonName: string, aesKey: string, courseType?: string): Promise<Lesson> {
    const lessonConfigPath = `${lessonName}/${LESSON_CONFIG}`
    const lessonYaml = readRawYamlFileFromZip<LessonYaml>(zip, lessonConfigPath)

    const taskNames = ensureNamedContent(lessonYaml.content, lessonConfigPath)
    const tasks = await Promise.all(
        taskNames.map((taskName) => loadTask(zip, lessonName, taskName, aesKey))
    )

    const lesson = createLesson(courseType)
    hydrateLesson(lesson, lessonName, lessonYaml)

    for (const task of tasks) {
        lesson.addTask(task)
    }

    return lesson
}

function createTask(taskType: string): Task | null {
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

type TaskYaml = {
    type?: string
    [key: string]: unknown
}

function hydrateTask(task: Task, taskName: string, yaml: TaskYaml): void {
    task.name = taskName
    if (yaml.status !== undefined && yaml.status !== null) {
        const statusStr = String(yaml.status)
        const statusMap: Record<string, CheckStatus> = {
            Unchecked: CheckStatus.Unchecked,
            Solved: CheckStatus.Solved,
            Failed: CheckStatus.Failed,
        }
        task.status = statusMap[statusStr] ?? CheckStatus.Unchecked
    }
    if (typeof yaml.record === "number") {
        task.record = yaml.record
    }
    if (yaml.feedback_link !== undefined) {
        task.feedbackLink = String(yaml.feedback_link)
    }
    if (yaml.solution_hidden !== undefined) {
        task.solutionHidden = Boolean(yaml.solution_hidden)
    }
    if (Array.isArray(yaml.tags)) {
        task.contentTags = yaml.tags.map(String)
    }
}

function hydrateChoiceTask(task: ChoiceTask, yaml: TaskYaml): void {
    if (yaml.is_multiple_choice !== undefined) {
        task.isMultipleChoice = Boolean(yaml.is_multiple_choice)
    }
    if (Array.isArray(yaml.options)) {
        task.choiceOptions = yaml.options.map((opt: Record<string, unknown>) => {
            const option = new ChoiceOption()
            option.text = String(opt.text ?? "")
            if (opt.is_correct === true) {
                option.status = ChoiceOptionStatus.CORRECT
            } else if (opt.is_correct === false) {
                option.status = ChoiceOptionStatus.INCORRECT
            }
            return option
        })
    }
}

function hydrateMatchingTask(task: MatchingTask, yaml: TaskYaml): void {
    if (Array.isArray(yaml.captions)) {
        const captions = yaml.captions as Array<Record<string, string>>
        task.captions = captions.map((c) => {
            const first = String(c.first ?? "")
            const second = String(c.second ?? "")
            return `${first} : ${second}`
        })
    }
    if (Array.isArray(yaml.options)) {
        const opts = yaml.options as string[]
        task.options = opts.map(String)
    }
}

function hydrateSortingTask(task: SortingTask, yaml: TaskYaml): void {
    if (Array.isArray(yaml.options)) {
        const opts = yaml.options as string[]
        task.options = opts.map(String)
    }
}

function hydrateTableTask(task: TableTask, yaml: TaskYaml): void {
    if (yaml.is_multiple_choice !== undefined) {
        task.isMultipleChoice = Boolean(yaml.is_multiple_choice)
    }
    if (Array.isArray(yaml.rows)) {
        task.rows = yaml.rows.map(String)
    }
    if (Array.isArray(yaml.columns)) {
        task.columns = yaml.columns.map(String)
    }
    if (Array.isArray(yaml.selected)) {
        const sel = yaml.selected as number[][]
        task.selected = sel.map((row) => row.map(Boolean))
    }
}

async function loadTask(zip: ZipData, lessonName: string, taskName: string, aesKey: string): Promise<Task> {
    const taskPath = `${lessonName}/${taskName}`
    const taskConfigPath = `${taskPath}/${TASK_CONFIG}`
    const taskYaml = readRawYamlFileFromZip<TaskYaml>(zip, taskConfigPath)

    if (!taskYaml.type) {
        throw new Error(`Missing 'type' in ${taskConfigPath}`)
    }

    const task = createTask(taskYaml.type)
    if (!task) {
        throw new Error(`Unknown task type '${taskYaml.type}' in ${taskConfigPath}`)
    }

    hydrateTask(task, taskName, taskYaml)

    const files = taskYaml.files
        ? await Promise.all((taskYaml.files as TaskFileYaml[]).map((file) => loadTaskFile(zip, taskPath, file, aesKey)))
        : []

    for (const taskFile of files) {
        task.addTaskFileInstance(taskFile)
    }

    // Hydrate task-specific fields
    if (task instanceof ChoiceTask) {
        hydrateChoiceTask(task, taskYaml)
    } else if (task instanceof MatchingTask) {
        hydrateMatchingTask(task, taskYaml)
    } else if (task instanceof SortingTask) {
        hydrateSortingTask(task, taskYaml)
    } else if (task instanceof TableTask) {
        hydrateTableTask(task, taskYaml)
    }

    return task
}

async function loadTaskFile(
    zip: ZipData,
    ownerPath: string,
    fileYaml: TaskFileYaml,
    aesKey: string
): Promise<TaskFile> {
    if (!fileYaml.name) {
        throw new Error(`Task file without name in ${ownerPath}`)
    }

    const isBinary = fileYaml.is_binary ?? false
    const text = await resolveTaskFileText(zip, ownerPath, fileYaml, aesKey, isBinary)

    const taskFile = new TaskFile()
    taskFile.name = fileYaml.name
    taskFile.text = text ?? ""
    taskFile.isVisible = fileYaml.visible ?? true
    taskFile.isEditable = fileYaml.editable ?? true
    taskFile.isPropagatable = fileYaml.propagatable ?? true
    taskFile.isLearnerCreated = fileYaml.learner_created ?? false
    return taskFile
}

async function resolveTaskFileText(
    zip: ZipData,
    ownerPath: string,
    fileYaml: TaskFileYaml,
    aesKey: string,
    isBinary: boolean
): Promise<string | undefined> {
    if (fileYaml.encrypted_text) {
        let decryptedText: string | undefined
        try {
            decryptedText = await decryptAesCbc(fileYaml.encrypted_text, aesKey)
        } catch {
            decryptedText = undefined
        }

        if (decryptedText && decryptedText.length > 0) {
            return decryptedText
        }

        const fileText = readTaskFileFromZip(zip, ownerPath, fileYaml.name, isBinary)
        return fileText ?? decryptedText
    }
    if (fileYaml.text !== undefined) {
        return fileYaml.text
    }

    return readTaskFileFromZip(zip, ownerPath, fileYaml.name, isBinary)
}

function readTaskFileFromZip(
    zip: ZipData,
    ownerPath: string,
    name: string | undefined,
    isBinary: boolean
): string | undefined {
    if (!name) return undefined
    const filePath = `${ownerPath}/${name}`
    const raw = zip[filePath]
    if (!raw) return undefined
    return isBinary ? bufferToBase64(raw) : new TextDecoder().decode(raw)
}

function ensureNamedContent(content: Array<string | null> | undefined, configPath: string): string[] {
    if (!content) return []
    return content.map((name, index) => {
        if (!name) {
            throw new Error(`Unnamed item at position ${index + 1} in ${configPath}`)
        }
        return name
    })
}

function readRawYamlFileFromZip<T = Record<string, unknown>>(zip: ZipData, filePath: string): T {
    const raw = zip[filePath]
    if (!raw) throw new Error(`Missing file: ${filePath}`)
    return parse(new TextDecoder().decode(raw)) as T
}

