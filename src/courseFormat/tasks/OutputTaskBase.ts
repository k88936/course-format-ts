import { CheckStatus } from "../CheckStatus"
import { Task } from "./Task"

export abstract class OutputTaskBase extends Task {
  inputFileName = OutputTaskBase.INPUT_PATTERN_NAME
  outputFileName = OutputTaskBase.OUTPUT_PATTERN_NAME
  latestOutputFileName = OutputTaskBase.LATEST_OUTPUT_PATTERN_NAME

  constructor()
  constructor(name: string)
  constructor(name: string, id: number, position: number, updateDate: Date, status: CheckStatus)
  constructor(name?: string, id?: number, position?: number, updateDate?: Date, status?: CheckStatus) {
    super(name as string, id as number, position as number, updateDate as Date, status as CheckStatus)
  }

  get supportSubmissions(): boolean {
    return true
  }

  static OUTPUT_PATTERN_NAME = "output.txt"
  static INPUT_PATTERN_NAME = "input.txt"
  static LATEST_OUTPUT_PATTERN_NAME = "latest_output.txt"
}
