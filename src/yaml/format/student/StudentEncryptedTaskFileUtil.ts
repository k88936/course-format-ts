// TODO: mirror of edu-format/src/com/jetbrains/edu/learning/yaml/format/student/StudentEncryptedTaskFileUtil.kt

export interface StudentEncryptedTaskFileYaml {
  name: string
  visible?: boolean
  placeholders?: unknown[]
  editable?: boolean
  encrypted_text?: string
  is_binary?: boolean
  learner_created?: boolean
}
