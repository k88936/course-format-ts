// TODO: mirror of edu-format/src/com/jetbrains/edu/learning/yaml/format/tasks/TheoryTaskYamlUtil.kt

export interface TheoryTaskYaml {
  type: string
  custom_name?: string
  files?: unknown[]
  feedback_link?: string
  status?: string
  feedback?: string
  record?: number
  tags?: string[]
  post_submission_on_open?: boolean
}
