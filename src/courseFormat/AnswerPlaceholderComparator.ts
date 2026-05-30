import { AnswerPlaceholder } from "./AnswerPlaceholder"

export const AnswerPlaceholderComparator = {
  compare(a: AnswerPlaceholder, b: AnswerPlaceholder): number {
    return a.offset - b.offset
  },
}
