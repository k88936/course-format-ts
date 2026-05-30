import { AnswerPlaceholder } from "./AnswerPlaceholder"
import { Course } from "./Course"
import { Lesson } from "./Lesson"
import { message } from "./uiMessages"

const DEPENDENCY_PATTERN = /(([^#]+)#)?([^#]+)#([^#]+)#([^#]+)#(\d+)/

export class AnswerPlaceholderDependency {
  sectionName?: string
  lessonName = ""
  taskName = ""
  fileName = ""
  placeholderIndex = 0
  isVisible = true
  answerPlaceholder!: AnswerPlaceholder

  constructor(
    answerPlaceholder?: AnswerPlaceholder,
    sectionName?: string | null,
    lessonName = "",
    taskName = "",
    fileName = "",
    placeholderIndex = 0,
    isVisible = true
  ) {
    if (answerPlaceholder) {
      this.answerPlaceholder = answerPlaceholder
    }
    this.sectionName = sectionName ?? undefined
    this.lessonName = lessonName
    this.taskName = taskName
    this.fileName = fileName
    this.placeholderIndex = placeholderIndex
    this.isVisible = isVisible
  }

  resolve(course: Course): AnswerPlaceholder | undefined {
    const lesson = course.getLesson(this.sectionName, this.lessonName)
    const task = lesson?.getTask(this.taskName)
    const taskFile = task?.getTaskFile(this.fileName)
    return taskFile?.answerPlaceholders[this.placeholderIndex]
  }

  toString(): string {
    const section = this.sectionName ? `${this.sectionName}#` : ""
    return `${section}${this.lessonName}#${this.taskName}#${this.fileName}#${this.placeholderIndex + 1}`
  }

  static create(answerPlaceholder: AnswerPlaceholder, text: string): AnswerPlaceholderDependency | null {
    if (!text.trim()) {
      return null
    }
    const task = answerPlaceholder.taskFile.task
    const match = text.match(DEPENDENCY_PATTERN)
    if (!match) {
      throw new InvalidDependencyException(text)
    }

    const sectionName = match[2]
    const lessonName = match[3]
    const taskName = match[4]
    const filePath = toSystemIndependent(match[5])
    const placeholderIndex = Number.parseInt(match[6], 10) - 1
    if (Number.isNaN(placeholderIndex)) {
      throw new InvalidDependencyException(text)
    }

    const dependency = new AnswerPlaceholderDependency(
      answerPlaceholder,
      sectionName,
      lessonName,
      taskName,
      filePath,
      placeholderIndex,
      true
    )
    const targetPlaceholder = dependency.resolve(task.course)
    if (!targetPlaceholder) {
      throw new InvalidDependencyException(text, message("exception.placeholder.non.existing"))
    }
    if (targetPlaceholder.taskFile.task === task) {
      throw new InvalidDependencyException(text, message("exception.placeholder.wrong.reference.to.source"))
    }
    if (refersToNextTask(task, targetPlaceholder.taskFile.task)) {
      throw new InvalidDependencyException(text, message("exception.placeholder.wrong.reference.to.next"))
    }
    return dependency
  }
}

export class InvalidDependencyException extends Error {
  readonly customMessage: string

  constructor(dependencyText: string, customMessage?: string) {
    super(
      customMessage
        ? `'${dependencyText}' is not a valid placeholder dependency\n${customMessage}`
        : `'${dependencyText}' is not a valid placeholder dependency`
    )
    this.customMessage = customMessage ?? message("exception.placeholder.invalid.dependency")
  }
}

function toSystemIndependent(pathValue: string): string {
  return pathValue.replace(/\\/g, "/")
}

function refersToNextTask(sourceTask: { lesson: Lesson; index: number }, targetTask: { lesson: Lesson; index: number }): boolean {
  const sourceLesson = sourceTask.lesson
  const targetLesson = targetTask.lesson
  if (sourceLesson === targetLesson) {
    return targetTask.index > sourceTask.index
  }
  if (sourceLesson.section === targetLesson.section) {
    return targetLesson.index > sourceLesson.index
  }
  return getIndexInCourse(targetLesson) > getIndexInCourse(sourceLesson)
}

function getIndexInCourse(lesson: Lesson): number {
  return lesson.section?.index ?? lesson.index
}
