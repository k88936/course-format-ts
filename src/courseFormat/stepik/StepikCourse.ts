import { EduCourse } from "../EduCourse"
import { STEPIK } from "../EduFormatNames"

export class StepikCourse extends EduCourse {
  isAdaptive = false

  override get itemType(): string {
    return STEPIK
  }
}
