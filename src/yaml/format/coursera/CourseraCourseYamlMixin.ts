// TODO: mirror of edu-format/src/com/jetbrains/edu/learning/yaml/format/coursera/CourseraCourseYamlMixin.kt

export interface CourseraCourseYaml {
  type?: string
  title: string
  summary?: string
  language: string
  programming_language: string
  programming_language_version?: string
  environment?: string
  solutions_hidden?: boolean
  vendor?: unknown
  is_private?: boolean
  content: string[]
  submit_manually?: boolean
  custom_content_path?: string
}
