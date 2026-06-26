// TODO: mirror of edu-format/src/com/jetbrains/edu/learning/yaml/format/CourseYamlUtil.kt

import { YamlMixinNames } from "../YamlMixinNames"
import { Course } from "../../courseFormat/Course"
import { EduCourse } from "../../courseFormat/EduCourse"
import type { Vendor } from "../../courseFormat/Vendor"
import type { EduFile } from "../../courseFormat/EduFile"
import { DEFAULT_ENVIRONMENT, COURSE } from "../../courseFormat/EduFormatNames"
import { formatError } from "../errorHandling/InvalidYamlFormatException"
import { unsupportedItemTypeMessage } from "../errorHandling/InvalidYamlFormatException"
import { unnamedItemAtMessage } from "../errorHandling/InvalidYamlFormatException"
import { TitledStudyItem } from "../TitledStudyItem"

export interface CourseYaml {
  type?: string
  title: string
  summary?: string
  language: string
  programming_language: string
  programming_language_version?: string
  environment?: string
  solutions_hidden?: boolean
  vendor?: Vendor
  is_private?: boolean
  mode?: string
  content: string[]
  feedback_link?: string
  tags?: string[]
  environment_settings?: Record<string, string>
  additional_files?: EduFile[]
  custom_content_path?: string
  disabled_features?: string[]
  yaml_version?: number
}

export interface EduCourseRemoteInfoYaml {
  id?: number
  update_date?: string
  marketplace_course_version?: number
  generated_edu_id?: string
}

export function buildCourse(yaml: CourseYaml): Course {
  const course: Course = makeCourse(yaml.type ?? null)
  course.name = yaml.title
  course.description = yaml.summary ?? ""
  course.environment = yaml.environment ?? DEFAULT_ENVIRONMENT
  course.vendor = yaml.vendor
  course.isMarketplacePrivate = yaml.is_private ?? false
  course.feedbackLink = yaml.feedback_link
  if (course.marketplaceCourseVersion === 0) course.marketplaceCourseVersion = 1
  course.solutionsHidden = yaml.solutions_hidden ?? false
  course.contentTags = yaml.tags ?? []
  course.environmentSettings = yaml.environment_settings ?? {}
  course.additionalFiles = yaml.additional_files ?? []
  course.disabledFeatures = yaml.disabled_features ?? []

  course.languageCode = yaml.language
  course.programmingLanguage = yaml.programming_language
  course.languageVersion = yaml.programming_language_version

  const newItems = yaml.content.map((title: string | null, index: number) => {
    if (title == null) {
      formatError(unnamedItemAtMessage(index + 1))
    }
    const titledStudyItem = new TitledStudyItem(title!)
    titledStudyItem.index = index + 1
    return titledStudyItem
  })
  course.items = newItems
  course.customContentPath = yaml.custom_content_path ?? ""
  return course
}

function makeCourse(courseType: string | null): Course {
  switch (courseType) {
    case YamlMixinNames.MARKETPLACE_YAML_TYPE:
      return new EduCourse() // isMarketplace set by YamlDeserializer
    case YamlMixinNames.EDU_YAML_TYPE:
    case null:
      return new EduCourse()
    default:
      return formatError(unsupportedItemTypeMessage(courseType, COURSE))
  }
}
