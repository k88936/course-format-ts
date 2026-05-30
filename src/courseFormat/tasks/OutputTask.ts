import { CheckStatus } from "../CheckStatus"
import { OutputTaskBase } from "./OutputTaskBase"

export class OutputTask extends OutputTaskBase {
  constructor()
  constructor(name: string)
  constructor(name: string, id: number, position: number, updateDate: Date, status: CheckStatus)
  constructor(name?: string, id?: number, position?: number, updateDate?: Date, status?: CheckStatus) {
    super(name as string, id as number, position as number, updateDate as Date, status as CheckStatus)
  }

  get itemType(): string {
    return OutputTask.OUTPUT_TASK_TYPE
  }

  get isToSubmitToRemote(): boolean {
    return this.checkStatus !== CheckStatus.Unchecked
  }

  static OUTPUT_TASK_TYPE = "output"
}
