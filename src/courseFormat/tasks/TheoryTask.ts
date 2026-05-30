import { CheckStatus } from "../CheckStatus"
import { Task } from "./Task"

export class TheoryTask extends Task {
  postSubmissionOnOpen = true

  constructor()
  constructor(name: string)
  constructor(name: string, id: number, position: number, updateDate: Date, status: CheckStatus)
  constructor(name?: string, id?: number, position?: number, updateDate?: Date, status?: CheckStatus) {
    super(name as string, id as number, position as number, updateDate as Date, status as CheckStatus)
  }

  get itemType(): string {
    return TheoryTask.THEORY_TASK_TYPE
  }

  static THEORY_TASK_TYPE = "theory"
}
