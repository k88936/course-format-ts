import { describe, it, before } from "node:test"
import { ok, strictEqual } from "node:assert/strict"
import { readFileSync, readdirSync, statSync } from "node:fs"
import { join, relative } from "node:path"
import { zipSync, unzipSync } from "fflate"
import { loadFromYamlZip } from "../yaml-loader"
import { Course } from "../courseFormat/Course"
import { Lesson } from "../courseFormat/Lesson"
import { Task } from "../courseFormat/tasks/Task"
import { CourseMode } from "../courseFormat/CourseMode"

const YAML_COURSE_DIR = join(__dirname, "../../yaml-course-example")

describe("YAML Zip Loader", () => {
  let course: Course

  before(() => {
    // Build a zip archive from the yaml-course-example directory
    const zipData = buildZipFromDir(YAML_COURSE_DIR)
    course = loadFromYamlZip(zipData)
  })

  it("loads a complete Course from zip", () => {
    ok(course instanceof Course, "Should return a Course instance")
    strictEqual(course.itemType, "Marketplace", "Expected Marketplace course type")
    strictEqual(course.name, "Example Plain Text course", "Expected course title")
    strictEqual(course.languageCode, "English", "Expected language")
    strictEqual(course.programmingLanguage, "Plain text", "Expected programming language")
    strictEqual(course.courseMode, CourseMode.STUDENT, "Expected STUDENT mode")
    ok(course.vendor !== undefined, "Vendor should be defined")
    strictEqual(course.vendor.name, "Arseniy Pendryak", "Expected vendor name")
  })

  it("loads lesson from zip", () => {
    strictEqual(course.items.length, 1, "Course should have 1 lesson")
    const lesson = course.items[0]
    ok(lesson instanceof Lesson, "First item should be a Lesson")
    strictEqual(lesson.name, "lesson1", "Lesson name should be 'lesson1'")
  })

  it("loads tasks from zip", () => {
    const lesson = course.items[0] as Lesson
    strictEqual(lesson.items.length, 2, "Lesson should have 2 tasks")

    const task1 = lesson.items[0]
    strictEqual(task1.name, "task1", "First task should be task1")
    strictEqual(task1.itemType, "edu", "task1 should be edu type")

    const task2 = lesson.items[1]
    strictEqual(task2.name, "task2", "Second task should be task2")
    strictEqual(task2.itemType, "edu", "task2 should be edu type")
  })

  it("loads task files from zip", () => {
    const lesson = course.items[0] as Lesson
    const task1 = lesson.items[0] as Task
    const taskFiles = task1.getTaskFileValues()

    // Should have Task.txt and tests/Tests.txt
    const fileNames = taskFiles.map((f: { name: string }) => f.name)
    ok(fileNames.includes("Task.txt"), "Should include Task.txt")
    ok(fileNames.includes("tests/Tests.txt"), "Should include tests/Tests.txt")

    // Verify Task.txt content is read from zip
    const taskFile = taskFiles.find((f: { name: string }) => f.name === "Task.txt")
    ok(taskFile !== undefined, "Task.txt should exist")
    ok(taskFile.text.length > 0, "Task.txt should have content")
  })

  it("loads multiple edu tasks", () => {
    const lesson = course.items[0] as Lesson
    const task1 = lesson.items[0]
    const task2 = lesson.items[1]
    strictEqual(task1.itemType, "edu", "task1 should be edu")
    strictEqual(task2.itemType, "edu", "task2 should be edu")
  })
})

/**
 * Build a zip archive from a directory on disk.
 * Returns a Uint8Array suitable for fflate.unzipSync / our loader.
 */
function buildZipFromDir(dirPath: string): Uint8Array {
  const entries: Record<string, Uint8Array> = {}
  collectDirEntries(dirPath, dirPath, entries)

  const zipped = zipSync(entries as any, { level: 0 })
  return zipped
}

function collectDirEntries(
  basePath: string,
  currentPath: string,
  entries: Record<string, Uint8Array>,
): void {
  const names = readdirSync(currentPath)
  for (const name of names) {
    const fullPath = join(currentPath, name)
    const stat = statSync(fullPath)
    if (stat.isDirectory()) {
      collectDirEntries(basePath, fullPath, entries)
    } else if (stat.isFile()) {
      const relPath = relative(basePath, fullPath)
      entries[relPath] = readFileSync(fullPath)
    }
  }
}
