// TODO: mirror of edu-format/src/com/jetbrains/edu/learning/yaml/format/student/StudentChoiceTaskYamlMixin.kt

import type { TaskFile } from "../../../courseFormat/TaskFile"

export interface StudentChoiceTaskYaml {
  type: string
  is_multiple_choice?: boolean
  options?: unknown[]
  message_correct?: string
  message_incorrect?: string
  quiz_header?: string
  files?: TaskFile[]
  feedback_link?: string
  status?: string
  feedback?: string
  record?: number
  selected_options?: number[]
  tags?: string[]
}
