import { CheckStatus } from "./CheckStatus"
import { TaskFile } from "./TaskFile"
import { AnswerPlaceholderDependency } from "./AnswerPlaceholderDependency"

export class AnswerPlaceholder {
  offset = -1
  length = -1
  index = -1

  private _initialState?: MyInitialState
  private _taskFile?: TaskFile

  placeholderDependency?: AnswerPlaceholderDependency
  isInitializedFromDependency = false
  possibleAnswer = ""
  placeholderText = ""
  selected = false
  status: CheckStatus = CheckStatus.Unchecked
  isVisible = true
  studentAnswer?: string

  constructor()
  constructor(offset: number, placeholderText: string)
  constructor(offset?: number, placeholderText?: string) {
    if (offset !== undefined && placeholderText !== undefined) {
      this.offset = offset
      this.length = placeholderText.length
      this.placeholderText = placeholderText
    }
  }

  get initialState(): MyInitialState {
    if (!this._initialState) {
      throw new Error("No initial state for answer placeholder")
    }
    return this._initialState
  }

  set initialState(value: MyInitialState) {
    this._initialState = value
  }

  get taskFile(): TaskFile {
    if (!this._taskFile) {
      throw new Error(`Task file is null for answer placeholder`)
    }
    return this._taskFile
  }

  set taskFile(value: TaskFile) {
    this._taskFile = value
  }

  init(file: TaskFile, isRestarted: boolean): void {
    this.taskFile = file
    if (isRestarted) return
    if (this.placeholderDependency) {
      this.placeholderDependency.answerPlaceholder = this
    }
    this.initialState = new MyInitialState(this.offset, this.length)
    this.status = file.task.status
  }

  reset(revertStartOffset: boolean): void {
    if (revertStartOffset) {
      this.offset = this.initialState.offset
    }
    this.length = this.initialState.length
    this.status = CheckStatus.Unchecked
    this.isInitializedFromDependency = false
  }

  initEmpty(): void {
    this.initialState = new MyInitialState(this.offset, this.placeholderText.length)
  }

  get isCurrentlyVisible(): boolean {
    let result = this.shouldBeVisible
    if (this.placeholderDependency) {
      result = result || !this.isInitializedFromDependency
    }
    return result
  }

  get shouldBeVisible(): boolean {
    if (!this.placeholderDependency) {
      return this.isVisible
    }
    return this.isVisible && this.placeholderDependency.isVisible
  }

  isValid(textLength: number): boolean {
    return this.offset >= 0 && this.length >= 0 && this.endOffset <= textLength
  }

  get endOffset(): number {
    return this.offset + this.length
  }

  toString(): string {
    const task = this.taskFile.task
    const lesson = task.lesson
    const section = lesson.section
    const sectionPrefix = section ? `${section.name}#` : ""
    return `${sectionPrefix}${lesson.name}#${task.name}#${this.taskFile.name}[${this.offset}, ${this.endOffset}]`
  }
}

export class MyInitialState {
  length = -1
  offset = -1

  constructor(initialOffset?: number, initialLength?: number) {
    if (initialOffset !== undefined) {
      this.offset = initialOffset
    }
    if (initialLength !== undefined) {
      this.length = initialLength
    }
  }
}
