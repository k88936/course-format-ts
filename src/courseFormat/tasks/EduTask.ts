import { CheckStatus } from "../CheckStatus"
import { Task } from "./Task"

export class EduTask extends Task {
  constructor()
  constructor(name: string)
  constructor(name: string, id: number, position: number, updateDate: Date, status: CheckStatus)
  constructor(name?: string, id?: number, position?: number, updateDate?: Date, status?: CheckStatus) {
    super(name as string, id as number, position as number, updateDate as Date, status as CheckStatus)
  }

  get itemType(): string {
    return EduTask.EDU_TASK_TYPE
  }

  get isToSubmitToRemote(): boolean {
    return this.checkStatus !== CheckStatus.Unchecked
  }

  get supportSubmissions(): boolean {
    return true
  }

  static EDU_TASK_TYPE = "edu"
  static PYCHARM_TASK_TYPE = "pycharm"
}
