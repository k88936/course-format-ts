// TODO: mirror of edu-format/src/com/jetbrains/edu/learning/yaml/format/EduFileYamlUtil.kt

import { EduFile } from "../../courseFormat/EduFile"
import { TaskFile } from "../../courseFormat/TaskFile"
import { AnswerPlaceholder } from "../../courseFormat/AnswerPlaceholder"
import { buildAnswerPlaceholder } from "./AnswerPlaceholderYamlUtil"
import { EduFileErrorHighlightLevel } from "../../courseFormat/EduFileErrorHighlightLevel"

export interface EduFileYaml {
  name: string
  is_binary?: boolean
}

export interface AdditionalFileYaml {
  name: string
  visible?: boolean
  is_binary?: boolean
}

export interface TaskFileYaml {
  name: string
  visible?: boolean
  placeholders?: Array<{
    offset: number
    length: number
    placeholder_text: string
    dependency?: any
    is_visible?: boolean
  }>
  editable?: boolean
  propagatable?: boolean
  highlight_level?: string
  is_binary?: boolean
}

export function buildAdditionalFile(yaml: AdditionalFileYaml): EduFile {
  const file = new EduFile()
  file.name = yaml.name
  file.isVisible = yaml.visible ?? false
  return file
}

export function buildTaskFile(yaml: TaskFileYaml): TaskFile {
  const taskFile = new TaskFile()
  taskFile.name = yaml.name
  taskFile.isVisible = yaml.visible ?? true
  taskFile.isEditable = yaml.editable ?? true
  taskFile.isPropagatable = yaml.propagatable ?? true
  if (yaml.highlight_level != null && yaml.highlight_level !== EduFileErrorHighlightLevel.ALL_PROBLEMS
    && yaml.highlight_level !== EduFileErrorHighlightLevel.TEMPORARY_SUPPRESSION) {
    taskFile.errorHighlightLevel = yaml.highlight_level as EduFileErrorHighlightLevel
  }
  if (yaml.placeholders != null) {
    taskFile.answerPlaceholders = yaml.placeholders.map(p => buildAnswerPlaceholder({
      offset: p.offset,
      length: p.length,
      placeholder_text: p.placeholder_text,
      dependency: p.dependency,
      is_visible: p.is_visible,
    }))
  }
  return taskFile
}
