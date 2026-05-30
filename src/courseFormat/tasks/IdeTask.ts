import { CheckStatus } from "../CheckStatus"
import { Task } from "./Task"

export class IdeTask extends Task {
  constructor()
  constructor(name: string)
  constructor(name: string, id: number, position: number, updateDate: Date, status: CheckStatus)
  constructor(name?: string, id?: number, position?: number, updateDate?: Date, status?: CheckStatus) {
    super(name as string, id as number, position as number, updateDate as Date, status as CheckStatus)
  }

  get itemType(): string {
    return IdeTask.IDE_TASK_TYPE
  }

  static IDE_TASK_TYPE = "ide"
}
