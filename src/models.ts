export interface Vendor {
  name: string
  url?: string
  email?: string
}

export type CourseMode = "STUDENT" | "EDUCATOR"

export interface TaskFile {
  name: string
  text?: string
  visible: boolean
  editable: boolean
  propagatable: boolean
  isBinary: boolean
  learnerCreated: boolean
}

export interface Task {
  name: string
  type: string
  status?: string
  record?: number
  files: TaskFile[]
  feedbackLink?: string
  solutionHidden?: boolean
  tags?: string[]
}

export interface Lesson {
  name: string
  customName?: string
  tags?: string[]
  content: Task[]
}

export interface Course {
  type: string
  title: string
  summary: string
  language: string
  programmingLanguage: string
  programmingLanguageVersion?: string
  environment?: string
  solutionsHidden?: boolean
  environmentSettings: Record<string, string>
  additionalFiles: TaskFile[]
  customContentPath?: string
  disabledFeatures: string[]
  vendor?: Vendor
  isPrivate?: boolean
  courseMode: CourseMode
  content: Lesson[]
}
