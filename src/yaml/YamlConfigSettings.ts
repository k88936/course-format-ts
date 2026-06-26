// TODO: mirror of edu-format/src/com/jetbrains/edu/learning/yaml/YamlConfigSettings.kt

import { COURSE, SECTION, LESSON, TASK } from "../courseFormat/EduFormatNames"
import { Course } from "../courseFormat/Course"
import { Section } from "../courseFormat/Section"
import { Lesson } from "../courseFormat/Lesson"
import type { Task } from "../courseFormat/tasks/Task"
import type { StudyItem } from "../courseFormat/StudyItem"

function getLocalConfigFileName(itemKind: string): string {
  return `${itemKind}-info.yaml`
}

export const COURSE_CONFIG = getLocalConfigFileName(COURSE)
export const SECTION_CONFIG = getLocalConfigFileName(SECTION)
export const LESSON_CONFIG = getLocalConfigFileName(LESSON)
export const TASK_CONFIG = getLocalConfigFileName(TASK)

export const REMOTE_COURSE_CONFIG = "course-remote-info.yaml"
export const REMOTE_SECTION_CONFIG = "section-remote-info.yaml"
export const REMOTE_LESSON_CONFIG = "lesson-remote-info.yaml"
export const REMOTE_TASK_CONFIG = "task-remote-info.yaml"

export function getConfigFileName(item: StudyItem): string {
  if (item instanceof Course) return COURSE_CONFIG
  if (item instanceof Section) return SECTION_CONFIG
  if (item instanceof Lesson) return LESSON_CONFIG
  return TASK_CONFIG
}

export function getRemoteConfigFileName(item: StudyItem): string {
  if (item instanceof Course) return REMOTE_COURSE_CONFIG
  if (item instanceof Section) return REMOTE_SECTION_CONFIG
  if (item instanceof Lesson) return REMOTE_LESSON_CONFIG
  return REMOTE_TASK_CONFIG
}
