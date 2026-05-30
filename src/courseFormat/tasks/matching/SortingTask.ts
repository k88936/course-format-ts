import { CheckStatus } from "../../CheckStatus"
import { SortingBasedTask } from "./SortingBasedTask"

export class SortingTask extends SortingBasedTask {
  constructor()
  constructor(name: string)
  constructor(name: string, id: number, position: number, updateDate: Date, status: CheckStatus)
  constructor(name?: string, id?: number, position?: number, updateDate?: Date, status?: CheckStatus) {
    super(name as string, id as number, position as number, updateDate as Date, status as CheckStatus)
  }

  get itemType(): string {
    return SortingTask.SORTING_TASK_TYPE
  }

  static SORTING_TASK_TYPE = "sorting"
}
