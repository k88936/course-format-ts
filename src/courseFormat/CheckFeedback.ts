import { CheckResult, CheckResultDiff } from "./CheckResult"
import { CheckStatus } from "./CheckStatus"
import { EduTestInfo } from "./EduTestInfo"
import { logger } from "./loggerUtils"

export class CheckFeedback {
  readonly failedTestInfo?: EduTestInfo
  readonly time?: Date
  private _message = ""
  private _expected?: string
  private _actual?: string

  constructor(
    failedTestInfo?: EduTestInfo | null,
    time?: Date | null
  ) {
    this.failedTestInfo = failedTestInfo ?? undefined
    this.time = time ?? undefined
  }

  static fromMessage(message: string, time?: Date | null, expected?: string | null, actual?: string | null): CheckFeedback {
    const feedback = new CheckFeedback(undefined, time ?? undefined)
    feedback.message = message
    feedback.expected = expected ?? undefined
    feedback.actual = actual ?? undefined
    return feedback
  }

  static fromCheckResult(time: Date, checkResult: CheckResult): CheckFeedback {
    const feedback = new CheckFeedback(checkResult.executedTestsInfo[0], time)
    feedback.expected = checkResult.diffResolved?.expected
    feedback.actual = checkResult.diffResolved?.actual
    feedback.message = checkResult.messageResolved
    return feedback
  }

  get message(): string {
    return this._message || this.failedTestInfo?.message || ""
  }

  set message(value: string) {
    this._message = value
  }

  get expected(): string | undefined {
    return this._expected ?? this.failedTestInfo?.checkResultDiff?.expected
  }

  set expected(value: string | undefined) {
    this._expected = value
  }

  get actual(): string | undefined {
    return this._actual ?? this.failedTestInfo?.checkResultDiff?.actual
  }

  set actual(value: string | undefined) {
    this._actual = value
  }

  toCheckResult(status: CheckStatus): CheckResult {
    const expected = this.expected
    const actual = this.actual
    if ((expected === undefined && actual !== undefined) || (expected !== undefined && actual === undefined)) {
      logger("CheckFeedback").warn("Expected/Actual: one value is missing. Second value would be ignored")
    }
    const diff =
      expected !== undefined && actual !== undefined ? new CheckResultDiff(expected, actual) : undefined
    return new CheckResult(status, this.message, undefined, diff)
  }
}
