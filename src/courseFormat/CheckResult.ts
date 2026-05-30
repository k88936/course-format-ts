import { CheckResultSeverity } from "./CheckResultSeverity"
import { CheckStatus } from "./CheckStatus"
import { FAILED_TO_CHECK_URL, LOGIN_NEEDED_MESSAGE, NO_TESTS_URL } from "./EduFormatNames"
import { message } from "./uiMessages"
import { EduTestInfo } from "./EduTestInfo"

export class CheckResult {
  readonly status: CheckStatus
  readonly severity: CheckResultSeverity
  readonly hyperlinkAction?: () => void
  readonly executedTestsInfo: EduTestInfo[]

  private readonly firstFailedTest?: EduTestInfo

  details?: string
  diff?: CheckResultDiff
  messageText: string

  constructor(
    status: CheckStatus,
    messageText = "",
    details?: string | null,
    diff?: CheckResultDiff | null,
    severity: CheckResultSeverity = CheckResultSeverity.Info,
    hyperlinkAction?: (() => void) | null,
    executedTestsInfo: EduTestInfo[] = []
  ) {
    this.status = status
    this.severity = severity
    this.hyperlinkAction = hyperlinkAction ?? undefined
    this.executedTestsInfo = executedTestsInfo
    this.firstFailedTest = this.executedTestsInfo.find((test) => !test.isSuccess)
    this.details = details ?? undefined
    this.diff = diff ?? undefined
    this.messageText = messageText
  }

  get fullMessage(): string {
    return this.details ? `${this.messageText}\n\n${this.details}` : this.messageText
  }

  get isSolved(): boolean {
    return this.status === CheckStatus.Solved
  }

  get detailsResolved(): string | undefined {
    return this.details ?? this.firstFailedTest?.details
  }

  get diffResolved(): CheckResultDiff | undefined {
    return this.diff ?? this.firstFailedTest?.checkResultDiff
  }

  get messageResolved(): string {
    return this.messageText || this.firstFailedTest?.message || ""
  }

  static NO_LOCAL_CHECK = new CheckResult(
    CheckStatus.Unchecked,
    message("check.result.local.check.unavailable")
  )
  static LOGIN_NEEDED = new CheckResult(CheckStatus.Unchecked, LOGIN_NEEDED_MESSAGE)
  static CONNECTION_FAILED = new CheckResult(
    CheckStatus.Unchecked,
    message("check.result.connection.failed")
  )
  static SOLVED = new CheckResult(CheckStatus.Solved)
  static CANCELED = new CheckResult(CheckStatus.Unchecked, message("check.result.canceled"))
  static UNCHECKED = new CheckResult(CheckStatus.Unchecked)

  static get noTestsRun(): CheckResult {
    return new CheckResult(
      CheckStatus.Unchecked,
      message("check.no.tests.with.help.guide", NO_TESTS_URL)
    )
  }

  static get failedToCheck(): CheckResult {
    return new CheckResult(
      CheckStatus.Unchecked,
      message("error.failed.to.launch.checking.with.help.guide", FAILED_TO_CHECK_URL)
    )
  }
}

export class CheckResultDiff {
  constructor(
    readonly expected: string,
    readonly actual: string,
    readonly title = ""
  ) {}
}
