// TODO: mirror of edu-format/src/com/jetbrains/edu/learning/yaml/format/remote/RemoteCourseYamlMixin.kt

import { YamlMixinNames } from "../../YamlMixinNames"
import { Course } from "../../../courseFormat/Course"
import { EduCourse } from "../../../courseFormat/EduCourse"
import { CourseraCourse } from "../../../courseFormat/CourseraCourse"
import { formatError } from "../../errorHandling/InvalidYamlFormatException"
import { unsupportedItemTypeMessage } from "../../errorHandling/InvalidYamlFormatException"
import { COURSE } from "../../../courseFormat/EduFormatNames"

export interface RemoteCourseYaml {
  type?: string
  title: string
  summary?: string
  vendor?: unknown
  is_private?: boolean
  feedback_link?: string
  generated_edu_id?: string
  programming_language: string
  programming_language_version?: string
  language: string
  environment?: string
  content: string[]
  submit_manually?: boolean
  solutions_hidden?: boolean
  tags?: string[]
  custom_content_path?: string
}

export function buildRemoteCourse(yaml: RemoteCourseYaml): Course {
  const course = makeRemoteCourse(yaml.type ?? null)
  course.name = yaml.title
  course.description = yaml.summary ?? ""
  course.vendor = yaml.vendor as any
  course.isMarketplacePrivate = yaml.is_private ?? false
  course.feedbackLink = yaml.feedback_link
  course.languageCode = yaml.language
  course.programmingLanguage = yaml.programming_language
  course.languageVersion = yaml.programming_language_version
  course.solutionsHidden = yaml.solutions_hidden ?? false
  course.contentTags = yaml.tags ?? []
  course.customContentPath = yaml.custom_content_path ?? ""
  course.isMarketplace = (yaml.type as string | undefined) === YamlMixinNames.MARKETPLACE_YAML_TYPE
  return course
}

function makeRemoteCourse(courseType: string | null): Course {
  switch (courseType) {
    case YamlMixinNames.COURSE_TYPE_YAML:
      return new CourseraCourse()
    case null:
      return new EduCourse()
    default:
      return formatError(unsupportedItemTypeMessage(courseType, COURSE))
  }
}
