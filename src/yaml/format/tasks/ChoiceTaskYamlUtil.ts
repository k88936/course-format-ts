// TODO: mirror of edu-format/src/com/jetbrains/edu/learning/yaml/format/tasks/ChoiceTaskYamlUtil.kt

import type { TaskFile } from "../../../courseFormat/TaskFile"

export interface ChoiceTaskYaml {
  type: string
  is_multiple_choice: boolean
  options: ChoiceOptionYaml[]
  message_correct?: string
  message_incorrect?: string
  quiz_header?: string
  files?: TaskFile[]
  feedback_link?: string
  tags?: string[]
  local_check?: boolean
}

export interface ChoiceOptionYaml {
  text: string
  is_correct?: boolean
}
