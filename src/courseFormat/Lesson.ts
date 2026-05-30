import { LessonContainer } from "./LessonContainer"
import type { Course } from "./Course"
import type { Section } from "./Section"
import { Task } from "./tasks/Task"
import { LESSON } from "./EduFormatNames"
import { ItemContainer } from "./ItemContainer"

function getLessonContainerModule(): { Section: typeof Section } {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require("./Section")
}

export class Lesson extends LessonContainer {
  override init(parentItem: ItemContainer, isRestarted: boolean): void {
    if (!(parentItem instanceof LessonContainer)) {
      throw new Error(`Parent for lesson ${this.name} should be either course or section`)
    }
    super.init(parentItem, isRestarted)
  }

  get taskList(): Task[] {
    return this.items.filter((item): item is Task => item instanceof Task)
  }

  get course(): Course {
    return this.parent.course
  }

  get section(): Section | undefined {
    return this.parent instanceof getLessonContainerModule().Section ? this.parent : undefined
  }

  get content(): Task[] {
    return this.items.filter((item): item is Task => item instanceof Task)
  }

  get itemType(): string {
    return LESSON
  }

  addTask(task: Task): void {
    this.addItem(task)
  }

  addTaskAt(index: number, task: Task): void {
    this.addItemAt(index, task)
  }

  removeTask(task: Task): void {
    this.removeItem(task)
  }

  getTask(name: string): Task | undefined
  getTask(id: number): Task | undefined
  getTask(param: string | number): Task | undefined {
    if (typeof param === "string") {
      return this.taskList.find((task) => task.name === param)
    }
    return this.taskList.find((task) => task.id === param)
  }

  get container(): LessonContainer {
    return this.section ?? this.course
  }

  visitTasks(visit: (task: Task) => void): void {
    this.taskList.forEach(visit)
  }
}
