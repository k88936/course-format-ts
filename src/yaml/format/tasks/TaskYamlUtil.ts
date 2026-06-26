// TODO: mirror of edu-format/src/com/jetbrains/edu/learning/yaml/format/tasks/TaskYamlUtil.kt

import type { TaskFile } from "../../../courseFormat/TaskFile"

export interface TaskYaml {
  type: string
  custom_name?: string
  files?: TaskFile[]
  feedback_link?: string
  solution_hidden?: boolean
  tags?: string[]
}
