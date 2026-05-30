import { CheckStatus } from "../CheckStatus"
import { Task } from "./Task"

export abstract class AnswerTask extends Task {
  static ANSWER_FILE_NAME = "answer.txt"

  constructor()
  constructor(name: string)
  constructor(name: string, id: number, position: number, updateDate: Date, status: CheckStatus)
  constructor(name?: string, id?: number, position?: number, updateDate?: Date, status?: CheckStatus) {
    super(name as string, id as number, position as number, updateDate as Date, status as CheckStatus)
  }
}
