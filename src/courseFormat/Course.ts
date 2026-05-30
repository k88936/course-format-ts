import { LessonContainer } from "./LessonContainer"
import { CourseMode } from "./CourseMode"
import { CourseVisibility } from "./CourseVisibility"
import { EduFile } from "./EduFile"
import { PluginInfo } from "./PluginInfo"
import { UserInfo } from "./UserInfo"
import { Vendor } from "./Vendor"
import { LESSON, OBJECTIVE_C, CPP, PYCHARM, DEFAULT_ENVIRONMENT } from "./EduFormatNames"
import { Lesson } from "./Lesson"
import { Section } from "./Section"
import { ItemContainer } from "./ItemContainer"
import { Language } from "./Language"

export abstract class Course extends LessonContainer {
  description = ""
  environment = DEFAULT_ENVIRONMENT
  environmentSettings: Record<string, string> = {}
  courseMode: CourseMode = CourseMode.STUDENT
  solutionsHidden = false
  disabledFeatures: string[] = []
  visibility: CourseVisibility = CourseVisibility.LocalVisibility
  additionalFiles: EduFile[] = []
  pluginDependencies: PluginInfo[] = []
  private nonEditableFiles: Set<string> = new Set()
  authors: UserInfo[] = []
  isLocal = false
  needWriteYamlText = false
  languageCode = "en"

  get type(): string {
    return this.itemType
  }

  get title(): string {
    return this.name
  }

  set title(value: string) {
    this.name = value
  }

  get language(): string {
    return this.languageCode
  }

  get content(): Lesson[] {
    return this.lessons
  }

  isMarketplace = false
  vendor?: Vendor
  marketplaceCourseVersion = 0
  organization?: string
  isMarketplacePrivate = false
  createDate: Date = new Date(0)
  feedbackLink?: string
  license?: string

  customContentPath = ""

  private _languageId = ""
  languageVersion?: string
  private _programmingLanguage = ""

  get programmingLanguage(): string {
    return this._programmingLanguage
  }

  set programmingLanguage(value: string | null) {
    if (!value) return
    this._programmingLanguage = value
    const parts = value.split(" ")
    this.languageId = parts[0]
    this.languageVersion = parts[1]
  }

  get languageId(): string {
    if (this._languageId === OBJECTIVE_C || this._languageId === CPP) {
      return Language.findLanguageByName("C/C++") ?? this._languageId
    }
    return this._languageId
  }

  set languageId(value: string) {
    this._languageId = value
  }

  initCourse(isRestarted: boolean): void {
    this.init(this, isRestarted)
  }

  override init(parentItem: ItemContainer, isRestarted: boolean): void {
    if (!(parentItem instanceof Course)) {
      throw new Error("Parent for course must be itself")
    }
    super.init(parentItem, isRestarted)
  }

  getLesson(sectionName?: string, lessonName?: string): Lesson | undefined
  getLesson(param?: string | number | ((lesson: Lesson) => boolean)): Lesson | undefined
  getLesson(param1?: string | number | ((lesson: Lesson) => boolean), param2?: string): Lesson | undefined {
    if (typeof param1 === "string" && param2 !== undefined) {
      const sectionName = param1
      const lessonName = param2
      if (sectionName) {
        const section = this.getSection(sectionName)
        if (section) {
          return section.getLesson(lessonName)
        }
      }
      return this.lessons.find((lesson) => lesson.name === lessonName)
    }
    if (param1 === undefined) return undefined
    if (typeof param1 === "string") {
      return super.getLesson(param1)
    }
    if (typeof param1 === "number") {
      return super.getLesson(param1)
    }
    return super.getLesson(param1 as (lesson: Lesson) => boolean)
  }

  get sections(): Section[] {
    return this.items.filter((item): item is Section => item instanceof Section)
  }

  addSection(section: Section): void {
    this.addItem(section)
  }

  removeSection(section: Section): void {
    this.removeItem(section)
  }

  getSection(name: string): Section | undefined
  getSection(predicate: (section: Section) => boolean): Section | undefined
  getSection(param: string | ((section: Section) => boolean)): Section | undefined {
    if (typeof param === "string") {
      return this.sections.find((section) => section.name === param)
    }
    return this.sections.find(param)
  }

  get course(): Course {
    return this
  }

  get itemType(): string {
    return PYCHARM
  }

  get isStudy(): boolean {
    return this.courseMode === CourseMode.STUDENT
  }

  override sortItems(): void {
    super.sortItems()
    this.sections.forEach((section) => section.sortItems())
  }

  toString(): string {
    return this.name
  }

  get authorFullNames(): string[] {
    return this.organization ? [this.organization] : this.authors.map((author) => author.getFullName())
  }

  get humanLanguage(): string {
    try {
      return new Intl.DisplayNames([this.languageCode], { type: "language" }).of(this.languageCode) ?? this.languageCode
    }
    catch {
      return this.languageCode
    }
  }

  get isStepikRemote(): boolean {
    return false
  }

  incrementMarketplaceCourseVersion(remoteCourseVersion: number): void {
    this.marketplaceCourseVersion = remoteCourseVersion + 1
  }

  isEditableFile(path: string): boolean {
    return !this.nonEditableFiles.has(path)
  }

  addNonEditableFile(path?: string | null): void {
    if (path && this.isStudy) {
      this.nonEditableFiles.add(path)
    }
  }

  removeNonEditableFile(path?: string | null): void {
    if (path && this.isStudy) {
      this.nonEditableFiles.delete(path)
    }
  }
}
