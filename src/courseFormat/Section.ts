import { LessonContainer } from "./LessonContainer"
import type { Course } from "./Course"
import { SECTION } from "./EduFormatNames"
import { ItemContainer } from "./ItemContainer"

function getCourseModule(): { Course: typeof Course } {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require("./Course")
}

export class Section extends LessonContainer {
  override init(parentItem: ItemContainer, isRestarted: boolean): void {
    if (!(parentItem instanceof getCourseModule().Course)) {
      throw new Error(`Course is null for section ${this.name}`)
    }
    super.init(parentItem, isRestarted)
  }

  get course(): Course {
    if (!(this.parent instanceof getCourseModule().Course)) {
      throw new Error(`Course is null for section ${this.name}`)
    }
    return this.parent as Course
  }

  get itemType(): string {
    return SECTION
  }
}
