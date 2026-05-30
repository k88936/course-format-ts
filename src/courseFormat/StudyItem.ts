import { ItemContainer } from "./ItemContainer"
import type { Course } from "./Course"

export abstract class StudyItem {
  index = -1
  name = ""
  updateDate: Date = new Date(0)
  id = 0
  contentTags: string[] = []
  customPresentableName?: string
  protected _parent?: ItemContainer

  constructor(name?: string) {
    if (name) {
      this.name = name
    }
  }

  get parent(): ItemContainer {
    if (!this._parent) {
      throw new Error(`Parent is null for StudyItem ${this.name}`)
    }
    return this._parent
  }

  set parent(value: ItemContainer) {
    this._parent = value
  }

  get presentableName(): string {
    return this.customPresentableName ?? this.name
  }

  abstract get course(): Course
  abstract get itemType(): string
  abstract init(parentItem: ItemContainer, isRestarted: boolean): void

  getRelativePath(root: StudyItem): string {
    if (this === root) return ""
    const parents: string[] = []
    let currentParent = this.parent
    while (currentParent !== root) {
      parents.push(currentParent.name)
      currentParent = currentParent.parent
    }
    parents.reverse()
    if (parents.length === 0) return this.name
    parents.push(this.name)
    return parents.join("/")
  }

  get pathInCourse(): string {
    return this.getRelativePath(this.course)
  }
}
