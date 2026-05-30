import { Lesson } from "./Lesson"
import { FRAMEWORK } from "./EduFormatNames"
import { Task } from "./tasks/Task"

export class FrameworkLesson extends Lesson {
  currentTaskIndex = 0
  isTemplateBased = true

  constructor(lesson?: Lesson) {
    super()
    if (lesson) {
      this.id = lesson.id
      this.updateDate = lesson.updateDate
      this.name = lesson.name
      this.items = lesson.items
      this.parent = lesson.parent
      this.index = lesson.index
      this.customPresentableName = lesson.customPresentableName
    }
  }

  currentTask(): Task | undefined {
    return this.taskList[this.currentTaskIndex]
  }

  get itemType(): string {
    return FRAMEWORK
  }
}
