import { ItemContainer } from "./ItemContainer"
import type { Lesson } from "./Lesson"
import type { Section } from "./Section"
import { Task } from "./tasks/Task"

function getLessonModule(): { Lesson: typeof Lesson; Section: typeof Section } {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const SectionModule = require("./Section")
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const LessonModule = require("./Lesson")
  return { Lesson: LessonModule.Lesson, Section: SectionModule.Section }
}

export abstract class LessonContainer extends ItemContainer {
  get lessons(): Lesson[] {
    const mod = getLessonModule()
    return this.items.filter((item): item is Lesson => item instanceof mod.Lesson)
  }

  getLesson(name: string): Lesson | undefined
  getLesson(id: number): Lesson | undefined
  getLesson(check: (lesson: Lesson) => boolean): Lesson | undefined
  getLesson(param: string | number | ((lesson: Lesson) => boolean)): Lesson | undefined {
    if (typeof param === "string") {
      return this.getLesson((lesson) => lesson.name === param)
    }
    if (typeof param === "number") {
      return this.getLesson((lesson) => lesson.id === param)
    }
    return this.lessons.find(param)
  }

  addLessons(lessons: Lesson[]): void {
    lessons.forEach((lesson) => this.addItem(lesson))
  }

  addLesson(lesson: Lesson): void {
    this.addItem(lesson)
  }

  removeLesson(lesson: Lesson): void {
    this.removeItem(lesson)
  }

  visitLessons(visit: (lesson: Lesson) => void): void {
    const mod = getLessonModule()
    for (const item of this.items) {
      if (item instanceof mod.Lesson) {
        visit(item)
      }
      else if (item instanceof mod.Section) {
        item.lessons.forEach(visit)
      }
    }
  }

  visitSections(visit: (section: Section) => void): void {
    const mod = getLessonModule()
    this.items.filter((item): item is Section => item instanceof mod.Section).forEach(visit)
  }

  visitTasks(visit: (task: Task) => void): void {
    this.visitLessons((lesson) => lesson.visitTasks(visit))
  }
}
