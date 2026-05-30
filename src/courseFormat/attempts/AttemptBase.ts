export abstract class AttemptBase {
  id = 0
  time: Date = new Date()
  timeLeft: number | null = null

  get isRunning(): boolean {
    const endDateTime = this.calculateEndDateTime()
    if (endDateTime === null) return true
    return new Date() < endDateTime
  }

  protected calculateEndDateTime(): Date | null {
    if (this.timeLeft === null) return null
    return new Date(this.time.getTime() + this.timeLeft * 1000)
  }

  constructor()
  constructor(id: number, time: Date, timeLeft: number | null)
  constructor(id?: number, time?: Date, timeLeft?: number | null) {
    if (id !== undefined) this.id = id
    if (time !== undefined) this.time = time
    if (timeLeft !== undefined) this.timeLeft = timeLeft
  }
}
