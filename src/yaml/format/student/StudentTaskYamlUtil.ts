// TODO: mirror of edu-format/src/com/jetbrains/edu/learning/yaml/format/student/StudentTaskYamlUtil.kt

import type { TaskFile } from "../../../courseFormat/TaskFile"

export interface StudentTaskYaml {
  type: string
  custom_name?: string
  files?: TaskFile[]
  feedback_link?: string
  status?: string
  feedback?: string
  record?: number
  tags?: string[]
}

export interface FeedbackYaml {
  message?: string
  time?: string
  expected?: string
  actual?: string
}
