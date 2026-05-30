import { EduFile } from "./EduFile"
import { AnswerPlaceholder } from "./AnswerPlaceholder"
import { AnswerPlaceholderComparator } from "./AnswerPlaceholderComparator"
import { CheckStatus } from "./CheckStatus"
import type { Task } from "./tasks/Task"
import { FileContents } from "./FileContents"

export class TaskFile extends EduFile {
  private _answerPlaceholders: AnswerPlaceholder[] = []
  private _task?: Task
  override isVisible = true

  constructor()
  constructor(name: string, text: string)
  constructor(name: string, contents: FileContents)
  constructor(name: string, text: string, isVisible: boolean)
  constructor(name: string, text: string, isVisible: boolean, isLearnerCreated: boolean)
  constructor(name?: string, textOrContents?: string | FileContents, isVisible?: boolean, isLearnerCreated?: boolean) {
    super()
    if (name !== undefined) this.name = name
    if (typeof textOrContents === "string") {
      this.text = textOrContents
    }
    else if (textOrContents) {
      this.contents = textOrContents
    }
    if (isVisible !== undefined) this.isVisible = isVisible
    if (isLearnerCreated !== undefined) this.isLearnerCreated = isLearnerCreated
  }

  get answerPlaceholders(): AnswerPlaceholder[] {
    return this._answerPlaceholders
  }

  set answerPlaceholders(value: AnswerPlaceholder[]) {
    this._answerPlaceholders = [...value]
  }

  get task(): Task {
    if (!this._task) {
      throw new Error(`Task is null for TaskFile ${this.name}`)
    }
    return this._task
  }

  set task(value: Task) {
    this._task = value
  }

  initTaskFile(task: Task, isRestarted: boolean): void {
    this.task = task
    for (const answerPlaceholder of this._answerPlaceholders) {
      answerPlaceholder.init(this, isRestarted)
    }
    this.sortAnswerPlaceholders()
  }

  addAnswerPlaceholder(answerPlaceholder: AnswerPlaceholder): void {
    this._answerPlaceholders.push(answerPlaceholder)
  }

  removeAnswerPlaceholder(answerPlaceholder: AnswerPlaceholder): void {
    this._answerPlaceholders = this._answerPlaceholders.filter((item) => item !== answerPlaceholder)
  }

  getAnswerPlaceholder(offset: number): AnswerPlaceholder | undefined {
    return this._answerPlaceholders.find((placeholder) => offset >= placeholder.offset && offset <= placeholder.endOffset)
  }

  removeAllPlaceholders(): void {
    this._answerPlaceholders = []
  }

  sortAnswerPlaceholders(): void {
    this._answerPlaceholders.sort(AnswerPlaceholderComparator.compare)
    this._answerPlaceholders.forEach((placeholder, index) => {
      placeholder.index = index
    })
  }

  hasFailedPlaceholders(): boolean {
    return this._answerPlaceholders.some((placeholder) => placeholder.status === CheckStatus.Failed)
  }

  isValid(text: string): boolean {
    return this._answerPlaceholders.every((placeholder) => placeholder.isValid(text.length))
  }
}
