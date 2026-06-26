// TODO: mirror of edu-format/src/com/jetbrains/edu/learning/yaml/format/AnswerPlaceholderYamlUtil.kt

import { AnswerPlaceholder } from "../../courseFormat/AnswerPlaceholder"
import type { AnswerPlaceholderDependency } from "../../courseFormat/AnswerPlaceholderDependency"
import { formatError } from "../errorHandling/InvalidYamlFormatException"
import { negativeLengthNotAllowedMessage } from "../errorHandling/InvalidYamlFormatException"
import { negativeOffsetNotAllowedMessage } from "../errorHandling/InvalidYamlFormatException"

export interface AnswerPlaceholderYaml {
  offset: number
  length: number
  placeholder_text: string
  dependency?: AnswerPlaceholderDependency
  is_visible?: boolean
}

export function buildAnswerPlaceholder(yaml: AnswerPlaceholderYaml): AnswerPlaceholder {
  if (yaml.length < 0) {
    formatError(negativeLengthNotAllowedMessage())
  }
  if (yaml.offset < 0) {
    formatError(negativeOffsetNotAllowedMessage())
  }
  const placeholder = new AnswerPlaceholder(yaml.offset, yaml.placeholder_text)
  placeholder.length = yaml.length
  placeholder.placeholderDependency = yaml.dependency
  placeholder.isVisible = yaml.is_visible ?? true
  return placeholder
}
