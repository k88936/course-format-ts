// TODO: mirror of edu-format/src/com/jetbrains/edu/learning/yaml/format/student/StudentFrameworkLessonYamlUtil.kt

import { FrameworkLesson } from "../../../courseFormat/FrameworkLesson"
import { formatError } from "../../errorHandling/InvalidYamlFormatException"
import { unnamedItemAtMessage } from "../../errorHandling/InvalidYamlFormatException"
import { TaskWithType } from "../tasks/TaskWithType"

export interface StudentFrameworkLessonYaml {
  type?: string
  custom_name?: string
  content: string[]
  is_template_based?: boolean
  current_task?: number
  tags?: string[]
}

export function buildStudentFrameworkLesson(yaml: StudentFrameworkLessonYaml): FrameworkLesson {
  const lesson = new FrameworkLesson()
  lesson.isTemplateBased = yaml.is_template_based ?? true
  lesson.currentTaskIndex = yaml.current_task ?? 0
  const taskList = yaml.content.map((title: string | null, index: number) => {
    if (title == null) {
      formatError(unnamedItemAtMessage(index + 1))
    }
    const task = new TaskWithType(title!)
    task.index = index + 1
    return task
  })
  lesson.items = taskList
  lesson.customPresentableName = yaml.custom_name
  lesson.contentTags = yaml.tags ?? []
  return lesson
}
