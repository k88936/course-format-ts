import { CheckStatus } from "../CheckStatus"
import { Task } from "./Task"
import type { DataTaskAttempt } from "../attempts/DataTaskAttempt"

export class DataTask extends Task {
  attempt?: DataTaskAttempt

  get isTimeLimited(): boolean {
    return this.attempt?.endDateTime !== undefined
  }

  constructor()
  constructor(name: string)
  constructor(name: string, id: number, position: number, updateDate: Date, status: CheckStatus)
  constructor(name?: string, id?: number, position?: number, updateDate?: Date, status?: CheckStatus) {
    super(name as string, id as number, position as number, updateDate as Date, status as CheckStatus)
  }

  get itemType(): string {
    return DataTask.DATA_TASK_TYPE
  }

  get supportSubmissions(): boolean {
    return false
  }

  isRunning(): boolean {
    if (this.status !== CheckStatus.Unchecked) return false
    return this.attempt?.isRunning ?? false
  }

  static DATA_TASK_TYPE = "dataset"
  static DATA_FOLDER_NAME = "data"
  static DATA_SAMPLE_FOLDER_NAME = "sample"
  static DATASET_FOLDER_NAME = "dataset"
  static INPUT_FILE_NAME = "input.txt"
}
