import { CheckStatus } from "../../CheckStatus"
import { logger } from "../../loggerUtils"
import { Task } from "../Task"

export abstract class SortingBasedTask extends Task {
  private _options: string[] = []
  ordering: number[] = []

  get options(): string[] {
    return this._options
  }

  set options(value: string[]) {
    this.ordering = value.map((_, index) => index)
    this._options = value
  }

  constructor()
  constructor(name: string)
  constructor(name: string, id: number, position: number, updateDate: Date, status: CheckStatus)
  constructor(name?: string, id?: number, position?: number, updateDate?: Date, status?: CheckStatus) {
    super(name as string, id as number, position as number, updateDate as Date, status as CheckStatus)
  }

  getOrderedOptions(): string[] {
    return this.options.map((_, index) => this.options[this.ordering[index]])
  }

  moveOptionUp(index: number): void {
    const targetIndex = index - 1
    if (targetIndex < 0) {
      const message = "There was an attempt to move the option up out of bounds"
      logger("SortingBasedTask").error(message)
      throw new Error(message)
    }
    this.swapOptions(index, targetIndex)
  }

  moveOptionDown(index: number): void {
    const targetIndex = index + 1
    if (targetIndex === this.options.length) {
      const message = "There was an attempt to move the option down out of bounds"
      logger("SortingBasedTask").error(message)
      throw new Error(message)
    }
    this.swapOptions(index, targetIndex)
  }

  swapOptions(firstColumnIndex: number, secondColumnIndex: number): void {
    const firstOptionIndex = this.ordering[firstColumnIndex]
    const secondOptionIndex = this.ordering[secondColumnIndex]
    this.ordering[firstColumnIndex] = secondOptionIndex
    this.ordering[secondColumnIndex] = firstOptionIndex
  }

  restoreInitialOrdering(): void {
    this.ordering = this.options.map((_, index) => index)
  }
}
