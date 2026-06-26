const assert = require("node:assert/strict")
const test = require("node:test")

const {
  loadCourseJsonFromZip,
  EduCourse,
  Section,
  EduTask,
  ChoiceTask,
} = require("../dist")

const ZIP_URL = "https://gitee.com/k88936/microsoft-vs-code-smell/releases/download/v0.4.0/Microsoft_V_S__Code__a_tour_about_refactor.zip"

test("loads a course from a zip URL into a Course object", async () => {
  // Download the zip file
  const response = await fetch(ZIP_URL)
  if (!response.ok) {
    throw new Error(`Failed to download zip: ${response.status} ${response.statusText}`)
  }
  const arrayBuffer = await response.arrayBuffer()
  const zipData = new Uint8Array(arrayBuffer)

  // Load the course from the zip
  const course = await loadCourseJsonFromZip(zipData)

  // Course-level checks
  assert.ok(course instanceof EduCourse, "Course should be an EduCourse instance")
  assert.equal(course.title, "Microsoft VS Code: a tour about refactor")
  assert.equal(course.language, "en")
  assert.equal(course.programmingLanguage, "Python")
  assert.ok(course.vendor)
  assert.equal(course.vendor.name, "k88936")

  // Section-level checks
  assert.ok(course.sections.length >= 2, "Course should have at least 2 sections")
  const sectionNames = course.sections.map((s) => s.name)
  assert.ok(sectionNames.includes("RefactoringAndItsPurpose"), "Should contain RefactoringAndItsPurpose section")
  assert.ok(sectionNames.includes("Bloaters"), "Should contain Bloaters section")

  // Check that a section has lessons
  const firstSection = course.sections[0]
  assert.ok(firstSection.items.length > 0, "Section should have lessons")
  const lesson = firstSection.items[0]
  assert.ok(lesson.name.length > 0, "Lesson should have a name")

  // Check that a task has files loaded with text content
  const allTasks = []
  for (const section of course.sections) {
    for (const lessonItem of section.items) {
      for (const task of lessonItem.taskList) {
        allTasks.push(task)
      }
    }
  }

  assert.ok(allTasks.length > 0, "Course should have tasks")

  // Find a theory task and check it has file content
  const theoryTask = allTasks.find((t) => t instanceof EduTask || t instanceof ChoiceTask)
  if (theoryTask) {
    assert.ok(theoryTask.files.length > 0, "Task should have files")
    const taskFile = theoryTask.files[0]
    assert.ok(taskFile.text && taskFile.text.length > 0, "Task file should have text content")
  }

  // Find a choice task and verify its options
  const choiceTask = allTasks.find((t) => t instanceof ChoiceTask)
  if (choiceTask) {
    assert.ok(choiceTask.choiceOptions.length > 0, "Choice task should have options")
    assert.equal(choiceTask.isMultipleChoice, false, "Quiz should be single choice")
    assert.ok(choiceTask.messageIncorrect && choiceTask.messageIncorrect.length > 0, "Should have incorrect message")
  }
})
