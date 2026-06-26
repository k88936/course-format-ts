// TODO: mirror of edu-format/src/com/jetbrains/edu/learning/yaml/format/LessonYamlUtil.kt

import { Lesson } from "../../courseFormat/Lesson"
import { formatError } from "../errorHandling/InvalidYamlFormatException"
import { unnamedItemAtMessage } from "../errorHandling/InvalidYamlFormatException"
import { TaskWithType } from "./tasks/TaskWithType"

export interface LessonYaml {
  custom_name?: string
  content: string[]
  tags?: string[]
}

export function buildLesson(yaml: LessonYaml): Lesson {
  const lesson = new Lesson()
  const taskList = (yaml.content ?? []).map((title: string | null, index: number) => {
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
