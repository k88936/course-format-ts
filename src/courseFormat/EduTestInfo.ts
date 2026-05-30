import { CheckResultDiff } from "./CheckResult"

export class EduTestInfo {
  readonly name: string
  readonly status: number
  readonly message: string
  readonly details?: string
  readonly checkResultDiff?: CheckResultDiff

  private readonly isSuccessInternal: boolean

  constructor(
    name = "",
    status = -1,
    message = "",
    details?: string | null,
    isFinishedSuccessfully?: boolean | null,
    checkResultDiff?: CheckResultDiff | null
  ) {
    this.name = name
    this.status = status
    this.message = message
    this.details = details ?? undefined
    this.checkResultDiff = checkResultDiff ?? undefined
    this.isSuccessInternal =
      isFinishedSuccessfully === true ||
      (EduTestInfo.get(status) !== undefined && EduTestInfo.isSuccess(EduTestInfo.get(status)!))
  }

  get isSuccess(): boolean {
    return this.isSuccessInternal
  }

  toString(): string {
    return `[${EduTestInfo.getPresentableStatus(this.status)}] ${this.name}`
  }

  static firstFailed(tests: EduTestInfo[]): EduTestInfo | undefined {
    return tests.find((test) => !test.isSuccess)
  }
}

export namespace EduTestInfo {
  export enum PresentableStatus {
    SKIPPED = 0,
    COMPLETED = 1,
    NOT_RUN = 2,
    RUNNING = 3,
    TERMINATED = 4,
    IGNORED = 5,
    FAILED = 6,
    ERROR = 8,
  }

  const STATUS_TITLES: Record<PresentableStatus, string> = {
    [PresentableStatus.SKIPPED]: "Skipped",
    [PresentableStatus.COMPLETED]: "Completed",
    [PresentableStatus.NOT_RUN]: "Not run",
    [PresentableStatus.RUNNING]: "Running",
    [PresentableStatus.TERMINATED]: "Terminated",
    [PresentableStatus.IGNORED]: "Ignored",
    [PresentableStatus.FAILED]: "Failed",
    [PresentableStatus.ERROR]: "Error",
  }

  export function get(status: number): PresentableStatus | undefined {
    return (Object.values(PresentableStatus) as Array<string | number>)
      .filter((value) => typeof value === "number")
      .map((value) => value as number)
      .includes(status)
      ? (status as PresentableStatus)
      : undefined
  }

  export function getPresentableStatus(status: number): string {
    const value = get(status)
    return value === undefined ? "Unknown" : STATUS_TITLES[value]
  }

  export function isSuccess(status: PresentableStatus): boolean {
    return (
      status === PresentableStatus.COMPLETED ||
      status === PresentableStatus.SKIPPED ||
      status === PresentableStatus.IGNORED
    )
  }
}
