// TODO: mirror of edu-format/src/com/jetbrains/edu/learning/yaml/format/student/StudentTaskFileUtil.kt

import type { TaskFile } from "../../../courseFormat/TaskFile"
import { InMemoryTextualContents } from "../../../courseFormat/FileContents"

export interface StudentTaskFileYaml {
  name: string
  visible?: boolean
  placeholders?: unknown[]
  editable?: boolean
  highlight_level?: string
  text?: string
  is_binary?: boolean
  learner_created?: boolean
}

export function buildStudentTaskFile(yaml: StudentTaskFileYaml): TaskFile {
  const { buildTaskFile } = require("../EduFileYamlUtil")
  const taskFile = buildTaskFile({
    name: yaml.name,
    visible: yaml.visible,
    placeholders: yaml.placeholders,
    editable: yaml.editable,
    highlight_level: yaml.highlight_level,
    is_binary: yaml.is_binary,
  })

  if (yaml.text != null) {
    taskFile.contents = new InMemoryTextualContents(yaml.text)
  }

  taskFile.isLearnerCreated = yaml.learner_created ?? false
  return taskFile
}

/**
 * Filter that includes is_binary only when it is true
 */
export class IsBinaryFilter {
  equals(other: unknown): boolean {
    return other === false || other == null
  }
}

/**
 * Marker storage for binary contents that must not be used directly
 */
export const TakeFromStorageBinaryContents = {
  get bytes(): Uint8Array {
    console.warn("This storage is only a marker storage and must not be used")
    return new Uint8Array()
  }
}

/**
 * Marker storage for textual contents that must not be used directly
 */
export const TakeFromStorageTextualContents = {
  get text(): string {
    console.warn("This storage is only a marker storage and must not be used")
    return ""
  }
}
