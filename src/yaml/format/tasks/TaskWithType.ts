// TODO: mirror of edu-format/src/com/jetbrains/edu/learning/yaml/format/tasks/TaskWithType.kt

import { Task } from "../../../courseFormat/tasks/Task"

/**
 * Placeholder to deserialize task type, should be replaced with actual task later
 */
export class TaskWithType extends Task {
  constructor(title: string) {
    super(title)
  }

  get itemType(): string {
    throw new Error("Not implemented")
  }
}
