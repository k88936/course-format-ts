import { AttemptBase } from "./AttemptBase"
import { Dataset } from "./Dataset"

export class Attempt extends AttemptBase {
  step = 0
  dataset: Dataset | null = null
  status: string | null = null
  user: string | null = null

  get isActive(): boolean {
    return this.status === "active"
  }

  constructor()
  constructor(step: number)
  constructor(id: number, time: Date, timeLeft: number)
  constructor(stepOrId?: number, time?: Date, timeLeft?: number) {
    super()
    if (stepOrId !== undefined && time === undefined) {
      this.step = stepOrId
    }
    else if (stepOrId !== undefined && time !== undefined) {
      this.id = stepOrId
      this.time = time
      this.timeLeft = timeLeft ?? null
    }
  }
}
