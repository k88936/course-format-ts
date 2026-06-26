// TODO: mirror of edu-format/src/com/jetbrains/edu/learning/yaml/format/RemoteStudyItem.kt

import { StudyItem } from "../courseFormat/StudyItem"
import type { ItemContainer } from "../courseFormat/ItemContainer"
import type { Course } from "../courseFormat/Course"

/**
 * Placeholder to deserialize StudyItem with remote info. Remote info is applied to
 * existing StudyItem by RemoteInfoChangeApplierBase
 */
export class RemoteStudyItem extends StudyItem {
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
