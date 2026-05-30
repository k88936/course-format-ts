import { Lesson } from "../Lesson"
import { STEPIK } from "../EduFormatNames"

export class StepikLesson extends Lesson {
  stepIds: number[] = []
  unitId = 0

  override get itemType(): string {
    return STEPIK
  }
}
