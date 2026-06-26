// TODO: mirror of edu-format/src/com/jetbrains/edu/learning/yaml/format/student/StudentCourseUtil.kt

import type { EduFile } from "../../../courseFormat/EduFile"

export interface StudentCourseYaml {
  type?: string
  title: string
  language: string
  summary?: string
  programming_language: string
  programming_language_version?: string
  environment?: string
  content: string[]
  custom_content_path?: string
  additional_files?: EduFile[]
  mode?: string
  tags?: string[]
}
