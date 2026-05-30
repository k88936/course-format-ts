import { CheckStatus } from "../../CheckStatus"
import { SortingBasedTask } from "./SortingBasedTask"

export class MatchingTask extends SortingBasedTask {
  captions: string[] = []

  constructor()
  constructor(name: string)
  constructor(name: string, id: number, position: number, updateDate: Date, status: CheckStatus)
  constructor(name?: string, id?: number, position?: number, updateDate?: Date, status?: CheckStatus) {
    super(name as string, id as number, position as number, updateDate as Date, status as CheckStatus)
  }

  get itemType(): string {
    return MatchingTask.MATCHING_TASK_TYPE
  }

  static MATCHING_TASK_TYPE = "matching"
}
