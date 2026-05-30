import { CheckStatus } from "../CheckStatus"
import { AnswerTask } from "./AnswerTask"

export class StringTask extends AnswerTask {
  constructor()
  constructor(name: string)
  constructor(name: string, id: number, position: number, updateDate: Date, status: CheckStatus)
  constructor(name?: string, id?: number, position?: number, updateDate?: Date, status?: CheckStatus) {
    super(name as string, id as number, position as number, updateDate as Date, status as CheckStatus)
  }

  get itemType(): string {
    return StringTask.STRING_TASK_TYPE
  }

  static STRING_TASK_TYPE = "string"
}
