export class HyperskillStage {
  id = -1
  title = ""
  stepId = -1
  isCompleted = false

  constructor()
  constructor(stageId: number, stageTitle: string, stageStepId: number, isStageCompleted: boolean)
  constructor(stageId?: number, stageTitle?: string, stageStepId?: number, isStageCompleted?: boolean) {
    if (stageId !== undefined) this.id = stageId
    if (stageTitle !== undefined) this.title = stageTitle
    if (stageStepId !== undefined) this.stepId = stageStepId
    if (isStageCompleted !== undefined) this.isCompleted = isStageCompleted
  }
}
