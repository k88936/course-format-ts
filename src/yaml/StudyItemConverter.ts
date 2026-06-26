// TODO: mirror of edu-format/src/com/jetbrains/edu/learning/yaml/format/StudyItemConverter.kt

import type { StudyItem } from "../courseFormat/StudyItem"

/**
 * Converts a StudyItem to its name string (equivalent to Jackson StdConverter in Kotlin)
 */
export function studyItemToName(item: StudyItem): string {
  return item.name
}
