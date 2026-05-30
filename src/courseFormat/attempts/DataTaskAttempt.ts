import { AttemptBase } from "./AttemptBase"

export class DataTaskAttempt extends AttemptBase {
  endDateTime: Date | null = null

  override get isRunning(): boolean {
    if (this.endDateTime === null) return true
    return new Date() < this.endDateTime
  }

  static fromAttempt(attempt: AttemptBase): DataTaskAttempt {
    const result = new DataTaskAttempt()
    result.id = attempt.id
    result.time = attempt.time
    result.timeLeft = attempt.timeLeft
    result.endDateTime = result.calculateEndDateTime()
    return result
  }
}
