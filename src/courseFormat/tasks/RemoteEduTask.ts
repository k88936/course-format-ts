import { CheckStatus } from "../CheckStatus"
import { EduTask } from "./EduTask"

export class RemoteEduTask extends EduTask {
  checkProfile = ""

  constructor()
  constructor(name: string, id: number, position: number, updateDate: Date, status: CheckStatus)
  constructor(name?: string, id?: number, position?: number, updateDate?: Date, status?: CheckStatus) {
    super(name as string, id as number, position as number, updateDate as Date, status as CheckStatus)
  }

  get itemType(): string {
    return RemoteEduTask.REMOTE_EDU_TASK_TYPE
  }

  static REMOTE_EDU_TASK_TYPE = "remote_edu"
}
