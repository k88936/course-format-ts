import { describe, it } from "node:test"
import { ok, strictEqual, deepEqual } from "node:assert/strict"
import { readFileSync, existsSync } from "node:fs"
import { join } from "node:path"
import {
  deserializeCourse,
  deserializeSection,
  deserializeLesson,
  deserializeTask,
  deserializeRemoteItem,
} from "../yaml/YamlDeserializer"
import { COURSE_CONFIG, LESSON_CONFIG, TASK_CONFIG, REMOTE_LESSON_CONFIG, REMOTE_TASK_CONFIG } from "../yaml/YamlConfigSettings"
import { CourseMode } from "../courseFormat/CourseMode"
import { Course } from "../courseFormat/Course"
import { Lesson } from "../courseFormat/Lesson"
import { Section } from "../courseFormat/Section"
import { Task } from "../courseFormat/tasks/Task"

const YAML_COURSE_DIR = join(__dirname, "../../yaml-course-example")

function readYamlFile(...paths: string[]): string {
  const fullPath = join(YAML_COURSE_DIR, ...paths)
  if (!existsSync(fullPath)) {
    throw new Error(`YAML file not found: ${fullPath}`)
  }
  return readFileSync(fullPath, "utf-8")
}

describe("YAML Format Deserialization", () => {
  it("parse course-info.yaml", () => {
    const yamlText = readYamlFile("course-info.yaml")
    const course = deserializeCourse(yamlText)
    ok(course !== null, "Course should not be null")

    strictEqual(course.itemType, "Marketplace", "Expected Marketplace course type")
    strictEqual(course.name, "Example Plain Text course", "Expected course title")
    strictEqual(course.languageCode, "English", "Expected language")
    strictEqual(course.programmingLanguage, "Plain text", "Expected programming language")
    strictEqual(course.courseMode, CourseMode.STUDENT, "Expected STUDENT mode (mode field present)")
    ok(course.vendor !== undefined, "Expected vendor to be defined")
    strictEqual(course.vendor.name, "Arseniy Pendryak", "Expected vendor name")

    // Content should reference lesson1
    ok(course.items.length > 0, "Course should have items")
    strictEqual(course.items[0].name, "lesson1", "First item should be lesson1")

    // Summary should be defined
    ok(course.description.length > 0, "Course description should be non-empty")
    ok(course.description.includes("Plain text"), "Description should reference Plain text")
  })

  it("parse lesson1/lesson-info.yaml", () => {
    const yamlText = readYamlFile("lesson1", "lesson-info.yaml")
    const lesson = deserializeLesson(yamlText)

    ok(lesson instanceof Lesson, "Should be a Lesson instance")
    strictEqual(lesson.name, "", "Lesson without custom_name should have empty name")
    strictEqual(lesson.items.length, 2, "Lesson should have 2 tasks")

    const taskNames = lesson.items.map((item) => item.name)
    ok(taskNames.includes("task1"), "Content should include task1")
    ok(taskNames.includes("task2"), "Content should include task2")
  })

  it("parse lesson1/task1/task-info.yaml", () => {
    const yamlText = readYamlFile("lesson1", "task1", "task-info.yaml")
    const task = deserializeTask(yamlText)

    ok(task instanceof Task, "Should be a Task instance")
    strictEqual(task.itemType, "edu", "Expected edu task type")
    strictEqual(task.record, -1, "Expected record -1")
  })

  it("parse lesson1/task2/task-info.yaml", () => {
    const yamlText = readYamlFile("lesson1", "task2", "task-info.yaml")
    const task = deserializeTask(yamlText)

    ok(task instanceof Task, "Should be a Task instance")
    strictEqual(task.itemType, "edu", "Expected edu task type")
  })

  it("parse lesson1/lesson-remote-info.yaml", () => {
    const yamlText = readYamlFile("lesson1", "lesson-remote-info.yaml")
    const remoteItem = deserializeRemoteItem(REMOTE_LESSON_CONFIG, yamlText)

    ok(remoteItem !== null, "Remote item should not be null")
    strictEqual(remoteItem.id, 1886105707, "Expected id 1886105707")
  })

  it("full course deserialization", () => {
    // Deserialize course
    const courseYaml = readYamlFile("course-info.yaml")
    const course = deserializeCourse(courseYaml)
    ok(course !== null, "Course should not be null")

    // Deserialize lesson
    const lessonYaml = readYamlFile("lesson1", "lesson-info.yaml")
    const lesson = deserializeLesson(lessonYaml)
    ok(lesson instanceof Lesson, "Should be a Lesson instance")

    // Deserialize task1
    const task1Yaml = readYamlFile("lesson1", "task1", "task-info.yaml")
    const task1 = deserializeTask(task1Yaml)
    ok(task1 instanceof Task, "task1 should be a Task instance")
    strictEqual(task1.itemType, "edu", "task1 should be edu type")

    // Deserialize task2
    const task2Yaml = readYamlFile("lesson1", "task2", "task-info.yaml")
    const task2 = deserializeTask(task2Yaml)
    ok(task2 instanceof Task, "task2 should be a Task instance")
    strictEqual(task2.itemType, "edu", "task2 should be edu type")

    // Validate structure
    strictEqual(lesson.items.length, 2, "Lesson should have 2 tasks")
    strictEqual(course.items.length, 1, "Course should have 1 item (lesson1)")
  })
})
