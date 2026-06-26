// TODO: mirror of edu-format/src/com/jetbrains/edu/learning/yaml/format/AnswerPlaceholderDependencyYamlUtil.kt

export interface AnswerPlaceholderDependencyYaml {
  section?: string
  lesson: string
  task: string
  file: string
  placeholder: number
  is_visible?: boolean
}
