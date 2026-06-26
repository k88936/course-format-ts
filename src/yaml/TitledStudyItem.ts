// TODO: mirror of edu-format/src/com/jetbrains/edu/learning/yaml/format/TitledStudyItem.kt

import { StudyItem } from "../courseFormat/StudyItem"
import type { ItemContainer } from "../courseFormat/ItemContainer"
import type { Course } from "../courseFormat/Course"

/**
 * Placeholder for any StudyItem, should be filled with actual content later
 */
export class TitledStudyItem extends StudyItem {
  constructor(title: string) {
    super(title)
  }

  init(_parentItem: ItemContainer, _isRestarted: boolean): void {
    throw new Error("Not implemented")
  }

  get course(): Course {
    throw new Error("Not implemented")
  }

  get itemType(): string {
    throw new Error("Not implemented")
  }
}
