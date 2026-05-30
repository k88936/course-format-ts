import { ChoiceOptionStatus } from "./ChoiceOptionStatus"

export class ChoiceOption {
  text = ""
  status: ChoiceOptionStatus = ChoiceOptionStatus.UNKNOWN

  constructor()
  constructor(text: string)
  constructor(text: string, status: ChoiceOptionStatus)
  constructor(text?: string, status?: ChoiceOptionStatus) {
    if (text !== undefined) {
      this.text = text
    }
    if (status !== undefined) {
      this.status = status
    }
  }

  equals(other: ChoiceOption): boolean {
    return this.text === other.text && this.status === other.status
  }

  hashCode(): number {
    let result = hashString(this.text)
    result = 31 * result + hashString(this.status)
    return result
  }
}

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return hash
}
