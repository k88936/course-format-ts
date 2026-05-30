const path = require("node:path")
const assert = require("node:assert/strict")
const test = require("node:test")
const fs = require("node:fs")
const os = require("node:os")

const { loadCourseProject, EduCourse, EduTask, ChoiceTask, MatchingTask, SortingTask, TableTask } = require("../dist")

test("loads example course project into a Course object with correct class types", async () => {
  const projectPath = path.join(__dirname, "..", "example-course-project")
  const course = await loadCourseProject(projectPath)

  // Course-level checks
  assert.ok(course instanceof EduCourse)
  assert.equal(course.title, "Example Plain Text course")
  assert.equal(course.language, "English")
  assert.equal(course.programmingLanguage, "Plain text")
  assert.equal(course.courseMode, "STUDENT")
  assert.equal(course.content.length, 1)

  // Lesson-level checks
  const lesson = course.content[0]
  assert.equal(lesson.name, "lesson1")
  assert.equal(lesson.content.length, 2)

  // Task-level checks
  const task1 = lesson.content[0]
  assert.ok(task1 instanceof EduTask)
  assert.equal(task1.name, "task1")
  assert.equal(task1.files.length, 2)

  const taskFile = task1.files.find((file) => file.name === "Task.txt")
  assert.ok(taskFile)
  assert.ok(taskFile.text && taskFile.text.includes("type your solution here"))
})

/**
 * Helper: quickly build a mini YAML course project on disk.
 */
function writeYamlProject(baseDir, structure) {
  for (const [relPath, content] of Object.entries(structure)) {
    const fullPath = path.join(baseDir, relPath)
    fs.mkdirSync(path.dirname(fullPath), { recursive: true })
    fs.writeFileSync(fullPath, content, "utf8")
  }
}

test("loads choice task with options from YAML", async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "test-choice-"))
  try {
    writeYamlProject(tmpDir, {
      "course-info.yaml": `
title: Choice Test Course
language: English
programming_language: Python
mode: student
content:
  - lesson1
`,
      "lesson1/lesson-info.yaml": `
content:
  - task1
`,
      "lesson1/task1/task-info.yaml": `
type: choice
is_multiple_choice: true
options:
  - text: Option A
    is_correct: true
  - text: Option B
    is_correct: false
  - text: Option C
    is_correct: true
status: Unchecked
record: -1
`,
      "lesson1/task1/Task.txt": "placeholder",
    })

    const course = await loadCourseProject(tmpDir)
    const task = course.content[0].content[0]

    assert.ok(task instanceof ChoiceTask, "Should be a ChoiceTask instance")
    assert.equal(task.name, "task1")
    assert.equal(task.isMultipleChoice, true)

    const options = task.choiceOptions
    assert.ok(options)
    assert.equal(options.length, 3)
    assert.equal(options[0].text, "Option A")
    assert.equal(options[1].text, "Option B")
    assert.equal(options[2].text, "Option C")
  }
  finally {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }
})

test("loads matching task with captions", async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "test-matching-"))
  try {
    writeYamlProject(tmpDir, {
      "course-info.yaml": `
title: Matching Test Course
language: English
programming_language: Python
content:
  - lesson1
`,
      "lesson1/lesson-info.yaml": `
content:
  - task1
`,
      "lesson1/task1/task-info.yaml": `
type: matching
options:
  - a
  - b
  - c
captions:
  - first: "1"
    second: "one"
  - first: "2"
    second: "two"
status: Unchecked
`,
    })

    const course = await loadCourseProject(tmpDir)
    const task = course.content[0].content[0]

    assert.ok(task instanceof MatchingTask, "Should be a MatchingTask instance")
    assert.equal(task.name, "task1")
    assert.deepEqual(task.options, ["a", "b", "c"])
    assert.deepEqual(task.captions, ["1 : one", "2 : two"])
  }
  finally {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }
})

test("loads sorting task with options", async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "test-sorting-"))
  try {
    writeYamlProject(tmpDir, {
      "course-info.yaml": `
title: Sorting Test Course
language: English
programming_language: Python
content:
  - lesson1
`,
      "lesson1/lesson-info.yaml": `
content:
  - task1
`,
      "lesson1/task1/task-info.yaml": `
type: sorting
options:
  - first
  - second
  - third
status: Unchecked
`,
    })

    const course = await loadCourseProject(tmpDir)
    const task = course.content[0].content[0]

    assert.ok(task instanceof SortingTask, "Should be a SortingTask instance")
    assert.deepEqual(task.options, ["first", "second", "third"])
  }
  finally {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }
})

test("loads table task with rows, columns, and selected cells", async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "test-table-"))
  try {
    writeYamlProject(tmpDir, {
      "course-info.yaml": `
title: Table Test Course
language: English
programming_language: Python
content:
  - lesson1
`,
      "lesson1/lesson-info.yaml": `
content:
  - task1
`,
      "lesson1/task1/task-info.yaml": `
type: table
is_multiple_choice: true
rows:
  - Row1
  - Row2
columns:
  - Col1
  - Col2
selected:
  - [0, 1]
  - [1, 0]
status: Unchecked
`,
    })

    const course = await loadCourseProject(tmpDir)
    const task = course.content[0].content[0]

    assert.ok(task instanceof TableTask, "Should be a TableTask instance")
    assert.equal(task.isMultipleChoice, true)
    assert.deepEqual(task.rows, ["Row1", "Row2"])
    assert.deepEqual(task.columns, ["Col1", "Col2"])
    assert.deepEqual(task.selected, [[false, true], [true, false]])
  }
  finally {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }
})

test("creates correct task types for all supported task YAML types", async () => {
  const typeClassMap = {
    edu: "EduTask",
    pycharm: "EduTask",
    code: "CodeTask",
    number: "NumberTask",
    string: "StringTask",
    output: "OutputTask",
    dataset: "DataTask",
    table: "TableTask",
    theory: "TheoryTask",
    ide: "IdeTask",
    unsupported: "UnsupportedTask",
    remote_edu: "RemoteEduTask",
    choice: "ChoiceTask",
    matching: "MatchingTask",
    sorting: "SortingTask",
  }

  const { EduTask, CodeTask, NumberTask, StringTask, OutputTask, DataTask, TableTask, TheoryTask, IdeTask, UnsupportedTask, RemoteEduTask, ChoiceTask, MatchingTask, SortingTask } = require("../dist")

  const classMap = { EduTask, CodeTask, NumberTask, StringTask, OutputTask, DataTask, TableTask, TheoryTask, IdeTask, UnsupportedTask, RemoteEduTask, ChoiceTask, MatchingTask, SortingTask }

  for (const [type, expectedClassName] of Object.entries(typeClassMap)) {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `test-${type}-`))
    try {
      writeYamlProject(tmpDir, {
        "course-info.yaml": `
title: ${type} Test
language: English
programming_language: Python
content:
  - lesson1
`,
        "lesson1/lesson-info.yaml": `
content:
  - task1
`,
        "lesson1/task1/task-info.yaml": `
type: ${type}
status: Unchecked
record: -1
`,
        "lesson1/task1/Task.txt": "test",
      })

      const course = await loadCourseProject(tmpDir)
      const task = course.content[0].content[0]

      const ExpectedClass = classMap[expectedClassName]
      assert.ok(task instanceof ExpectedClass, `type "${type}" should produce ${expectedClassName}`)
    }
    finally {
      fs.rmSync(tmpDir, { recursive: true, force: true })
    }
  }
})
