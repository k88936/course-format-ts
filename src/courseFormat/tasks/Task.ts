import { CheckFeedback } from "../CheckFeedback"
import { CheckStatus } from "../CheckStatus"
import { DescriptionFormat } from "../DescriptionFormat"
import { ItemContainer } from "../ItemContainer"
import type { Lesson } from "../Lesson"
import { Course } from "../Course"
import { TaskFile } from "../TaskFile"
import { StudyItem } from "../StudyItem"
import { logger } from "../loggerUtils"

function getLessonModuleLazy(): { Lesson: typeof Lesson } {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require("../Lesson")
}

export abstract class Task extends StudyItem {
  private _taskFiles: Map<string, TaskFile> = new Map()

  get taskFiles(): Map<string, TaskFile> {
    return this._taskFiles
  }

  set taskFiles(value: Map<string, TaskFile>) {
    this._taskFiles = value
  }

  feedback?: CheckFeedback
  descriptionText = ""
  descriptionFormat: DescriptionFormat = DescriptionFormat.MD
  feedbackLink?: string
  solutionHidden?: boolean
  record = -1
  isUpToDate = true

  protected checkStatus: CheckStatus = CheckStatus.Unchecked

  get status(): CheckStatus {
    return this.checkStatus
  }

  set status(status: CheckStatus) {
    for (const taskFile of this._taskFiles.values()) {
      for (const placeholder of taskFile.answerPlaceholders) {
        placeholder.status = status
      }
    }
    if (this.checkStatus !== status) {
      this.feedback = undefined
    }
    this.checkStatus = status
  }

  get lesson(): Lesson {
    const LessonClass = getLessonModuleLazy().Lesson
    if (!(this.parent instanceof LessonClass)) {
      throw new Error(`Lesson is null for task ${this.name}`)
    }
    return this.parent as Lesson
  }

  get isPluginTaskType(): boolean {
    return true
  }

  get supportSubmissions(): boolean {
    return false
  }

  get isToSubmitToRemote(): boolean {
    return false
  }

  get isChangedOnFailed(): boolean {
    return false
  }

  get course(): Course {
    return this.lesson.course
  }

  get files(): TaskFile[] {
    return this.getTaskFileValues()
  }

  constructor()
  constructor(name: string)
  constructor(name: string, id: number, position: number, updateDate: Date, status: CheckStatus)
  constructor(name?: string, id?: number, position?: number, updateDate?: Date, status?: CheckStatus) {
    super(name)
    if (id !== undefined) this.id = id
    if (position !== undefined) this.index = position
    if (updateDate !== undefined) this.updateDate = updateDate
    if (status !== undefined) this.checkStatus = status
  }

  override init(parentItem: ItemContainer, isRestarted: boolean): void {
    this.parent = parentItem
    for (const taskFile of this._taskFiles.values()) {
      taskFile.initTaskFile(this, isRestarted)
    }
  }

  getTaskFile(name: string): TaskFile | undefined {
    return this._taskFiles.get(name)
  }

  addTaskFile(name: string, isVisible = true): TaskFile {
    const taskFile = new TaskFile()
    taskFile.task = this
    taskFile.name = name
    taskFile.isVisible = isVisible
    this._taskFiles.set(name, taskFile)
    return taskFile
  }

  addTaskFileInstance(taskFile: TaskFile): void {
    taskFile.task = this
    this._taskFiles.set(taskFile.name, taskFile)
  }

  addTaskFileAt(taskFile: TaskFile, position: number): void {
    taskFile.task = this
    if (position < 0 || position > this._taskFiles.size) {
      throw new Error("IndexOutOfBounds")
    }
    const entries = Array.from(this._taskFiles.entries())
    entries.splice(position, 0, [taskFile.name, taskFile])
    this._taskFiles = new Map(entries)
  }

  setTaskFileValues(taskFiles: TaskFile[]): void {
    this._taskFiles.clear()
    for (const taskFile of taskFiles) {
      this._taskFiles.set(taskFile.name, taskFile)
    }
  }

  getTaskFileValues(): TaskFile[] {
    return Array.from(this._taskFiles.values())
  }

  removeTaskFile(taskFile: string): TaskFile | undefined {
    const value = this._taskFiles.get(taskFile)
    this._taskFiles.delete(taskFile)
    return value
  }

  taskFileIndex(taskFile: string): number | undefined {
    const index = Array.from(this._taskFiles.keys()).indexOf(taskFile)
    return index === -1 ? undefined : index
  }

  equals(other: Task): boolean {
    if (this === other) return true
    if (this.index !== other.index) return false
    if (this.name !== other.name) return false
    if (this._taskFiles !== other._taskFiles) return false
    if (this.descriptionText !== other.descriptionText) return false
    return this.descriptionFormat === other.descriptionFormat
  }

  hashCode(): number {
    let result = hashString(this.name)
    result = 31 * result + this.index
    result = 31 * result + this._taskFiles.size
    result = 31 * result + hashString(this.descriptionText)
    result = 31 * result + hashString(this.descriptionFormat)
    return result
  }

  static LOG = logger("Task")
}

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return hash
}
