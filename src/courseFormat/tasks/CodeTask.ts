import { CheckStatus } from "../CheckStatus"
import { Task } from "./Task"

export class CodeTask extends Task {
  submissionLanguage?: string

  constructor()
  constructor(name: string)
  constructor(
    name: string,
    id: number,
    position: number,
    updateDate: Date,
    status: CheckStatus,
    submissionLanguage?: string | null
  )
  constructor(
    name?: string,
    id?: number,
    position?: number,
    updateDate?: Date,
    status?: CheckStatus,
    submissionLanguage?: string | null
  ) {
    super(name as string, id as number, position as number, updateDate as Date, status as CheckStatus)
    this.submissionLanguage = submissionLanguage ?? undefined
  }

  get itemType(): string {
    return CodeTask.CODE_TASK_TYPE
  }

  get supportSubmissions(): boolean {
    return true
  }

  get isPluginTaskType(): boolean {
    return false
  }

  static CODE_TASK_TYPE = "code"
}
