// TODO: mirror of edu-format/src/com/jetbrains/edu/learning/yaml/format/student/StudentAnswerPlaceholderYamlUtil.kt

import { AnswerPlaceholder, MyInitialState } from "../../../courseFormat/AnswerPlaceholder"
import type { AnswerPlaceholderDependency } from "../../../courseFormat/AnswerPlaceholderDependency"
import { buildAnswerPlaceholder } from "../AnswerPlaceholderYamlUtil"

export interface StudentAnswerPlaceholderYaml {
  offset: number
  length: number
  placeholder_text: string
  dependency?: AnswerPlaceholderDependency
  is_visible?: boolean
  initial_state?: InitialStateYaml
  initialized_from_dependency?: boolean
  encrypted_possible_answer?: string
  selected?: boolean
  status?: string
  student_answer?: string
}

export interface InitialStateYaml {
  length?: number
  offset?: number
}

export function buildEduAnswerPlaceholder(yaml: StudentAnswerPlaceholderYaml): AnswerPlaceholder {
  const placeholder = buildAnswerPlaceholder({
    offset: yaml.offset,
    length: yaml.length,
    placeholder_text: yaml.placeholder_text,
    dependency: yaml.dependency,
    is_visible: yaml.is_visible,
  })

  if (yaml.initial_state) {
    placeholder.initialState = new MyInitialState(yaml.initial_state.offset, yaml.initial_state.length)
  }
  placeholder.isInitializedFromDependency = yaml.initialized_from_dependency ?? false
  placeholder.possibleAnswer = yaml.encrypted_possible_answer ?? ""
  placeholder.selected = yaml.selected ?? false
  placeholder.studentAnswer = yaml.student_answer

  return placeholder
}
