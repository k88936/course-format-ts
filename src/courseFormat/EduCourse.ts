import { Course } from "./Course"
import { MARKETPLACE } from "./EduFormatNames"
import { JSON_FORMAT_VERSION } from "./EduVersions"

export class EduCourse extends Course {
  get itemType(): string {
    return this.isMarketplace ? MARKETPLACE : super.itemType
  }

  get isStepikRemote(): boolean {
    return this.id !== 0 && !this.isMarketplace
  }

  get isMarketplaceRemote(): boolean {
    return this.id !== 0 && this.isMarketplace
  }

  formatVersion = JSON_FORMAT_VERSION
  isUpToDate = true
  learnersCount = 0
  reviewScore = 0.0
  generatedEduId?: string
  isPreview = false
  sectionIds: number[] = []
  instructors: number[] = []
  isStepikPublic = false
  reviewSummary = 0

  convertToLocal(): void {
    if (this.isMarketplace) {
      this.marketplaceCourseVersion = 1
    }
    else {
      this.isStepikPublic = false
      this.sectionIds = []
      this.instructors = []
    }
    this.id = 0
    this.updateDate = new Date(0)
  }
}
