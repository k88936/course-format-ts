import { CheckStatus } from "../../CheckStatus"
import { message } from "../../uiMessages"
import { Task } from "../Task"
import { ChoiceOption } from "./ChoiceOption"

export class ChoiceTask extends Task {
  choiceOptions: ChoiceOption[] = []
  isMultipleChoice = false
  selectedVariants: number[] = []
  messageCorrect: string = message("check.correct.solution")
  messageIncorrect: string = message("check.incorrect.solution")
  quizHeader?: string
  canCheckLocally = true

  constructor()
  constructor(name: string, id: number, position: number, updateDate: Date, status: CheckStatus)
  constructor(name?: string, id?: number, position?: number, updateDate?: Date, status?: CheckStatus) {
    super(name as string, id as number, position as number, updateDate as Date, status as CheckStatus)
  }

  get itemType(): string {
    return ChoiceTask.CHOICE_TASK_TYPE
  }

  get isPluginTaskType(): boolean {
    return false
  }

  get isChangedOnFailed(): boolean {
    return !this.canCheckLocally
  }

  get isToSubmitToRemote(): boolean {
    return this.status !== CheckStatus.Unchecked
  }

  get presentableQuizHeader(): string {
    if (this.quizHeader) return this.quizHeader
    return this.isMultipleChoice
      ? message("course.creator.create.choice.task.multiple.label")
      : message("course.creator.create.choice.task.single.label")
  }

  addSelectedVariant(variant: number): void {
    this.selectedVariants.push(variant)
  }

  removeSelectedVariant(variant: number): void {
    this.selectedVariants = this.selectedVariants.filter((value) => value !== variant)
  }

  clearSelectedVariants(): void {
    this.selectedVariants = []
  }

  static CHOICE_TASK_TYPE = "choice"
}
