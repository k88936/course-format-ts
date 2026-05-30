import { Course } from "./Course"
import { COURSERA } from "./EduFormatNames"

export class CourseraCourse extends Course {
  submitManually = false

  override get itemType(): string {
    return COURSERA
  }
}
