import { CheckStatus } from "../CheckStatus"
import { Task } from "./Task"
import { logger } from "../loggerUtils"

export class TableTask extends Task {
  isMultipleChoice = false
  rows: string[] = []
  columns: string[] = []
  selected: boolean[][] = []

  constructor()
  constructor(name: string)
  constructor(name: string, id: number, position: number, updateDate: Date, status: CheckStatus)
  constructor(name?: string, id?: number, position?: number, updateDate?: Date, status?: CheckStatus) {
    super(name as string, id as number, position as number, updateDate as Date, status as CheckStatus)
  }

  get itemType(): string {
    return TableTask.TABLE_TASK_TYPE
  }

  choose(rowIndex: number, columnIndex: number): void {
    if (rowIndex < 0 || rowIndex >= this.rows.length || columnIndex < 0 || columnIndex >= this.columns.length) {
      logger("TableTask").error("There was an attempt to choose a cell with invalid indices")
      return
    }
    if (!this.isMultipleChoice) {
      this.clearSelectedInRow(rowIndex)
    }
    this.selected[rowIndex][columnIndex] = !this.selected[rowIndex][columnIndex]
  }

  clearSelectedVariants(): void {
    for (let rowIndex = 0; rowIndex < this.selected.length; rowIndex += 1) {
      this.clearSelectedInRow(rowIndex)
    }
  }

  private clearSelectedInRow(rowIndex: number): void {
    this.selected[rowIndex] = this.selected[rowIndex].map(() => false)
  }

  createTable(rows: string[], columns: string[], isCheckbox = false): void {
    this.rows = rows
    this.columns = columns
    this.isMultipleChoice = isCheckbox
    this.selected = rows.map(() => columns.map(() => false))
  }

  static TABLE_TASK_TYPE = "table"
}
