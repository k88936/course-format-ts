import { Course } from "../Course"
import { HyperskillProject } from "./HyperskillProject"
import { HyperskillStage } from "./HyperskillStage"
import { HyperskillTopic } from "./HyperskillTopic"
import { HYPERSKILL } from "../EduFormatNames"

export class HyperskillCourse extends Course {
  taskToTopics: Map<number, HyperskillTopic[]> = new Map()
  stages: HyperskillStage[] = []
  hyperskillProject: HyperskillProject | null = null
  selectedStage: number | null = null
  selectedProblem: number | null = null

  override get itemType(): string {
    return HYPERSKILL
  }

  get isTemplateBased(): boolean {
    if (!this.hyperskillProject) {
      throw new Error("Disconnected Hyperskill project")
    }
    return this.hyperskillProject.isTemplateBased
  }
}
