export class Dataset {
  isMultipleChoice = false
  options: string[] | null = null
  pairs: Pair[] | null = null
  rows: string[] | null = null
  columns: string[] | null = null
  isCheckbox = false
}

export class Pair {
  first = ""
  second = ""
}
