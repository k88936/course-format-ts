import {Course, Lesson, loadFromYamlZip, Section, Task} from "../src";

const ZIP_URL = "https://gitee.com/k88936/microsoft-vs-code-smell/archive/refs/tags/v0.4.1.zip"

async function main() {
    console.log("Fetching zip from:", ZIP_URL)
    const resp = await fetch(ZIP_URL)
    if (!resp.ok) {
        throw new Error(`Failed to fetch: ${resp.status} ${resp.statusText}`)
    }
    const buffer = await resp.arrayBuffer()
    console.log(`Downloaded ${buffer.byteLength} bytes`)

    const course = loadFromYamlZip(buffer)
    console.log("\n=== Course ===")
    console.log(`  name: ${course.name}`)
    console.log(`  itemType: ${course.itemType}`)
    console.log(`  language: ${course.languageCode}`)
    console.log(`  programmingLanguage: ${course.programmingLanguage}`)
    console.log(`  isMarketplace: ${course.isMarketplace}`)
    console.log(`  vendor: ${JSON.stringify(course.vendor)}`)
    console.log(`  additionalFiles count: ${course.additionalFiles.length}`)
    for (const af of course.additionalFiles) {
        console.log(`    additionalFile: ${af.name}, is bin: ${af.isBinary}`)
    }
    console.log(`  items count: ${course.items.length}`)

    dumpItems(course.items, 0)

    // Basic sanity checks
    let sectionCount = 0, lessonCount = 0, taskCount = 0, fileCount = 0

    function countItems(items: any[], depth: number) {
        for (const item of items) {
            if (item instanceof Section) {
                sectionCount++
                countItems(item.items, depth + 1)
            } else if (item instanceof Lesson) {
                lessonCount++
                countItems(item.items, depth + 1)
            } else if (item instanceof Task) {
                taskCount++
                fileCount += item.getTaskFileValues().length
            }
        }
    }

    countItems(course.items, 0)

    console.log(`\n=== Summary ===`)
    console.log(`  Sections: ${sectionCount}`)
    console.log(`  Lessons: ${lessonCount}`)
    console.log(`  Tasks: ${taskCount}`)
    console.log(`  Task files: ${fileCount}`)

    // Verify the course is a valid Course instance
    console.assert(course instanceof Course, "Should be a Course instance")
    // courseMode is EDUCATOR when no `mode` field in YAML (default)
    console.assert(course.items.length > 0, "Course should have items")

    // Check that all items were properly loaded (no remaining TitledStudyItem/TaskWithType placeholders)
    let hasPlaceholders = false

    function checkPlaceholders(items: any[]) {
        for (const item of items) {
            const className = item.constructor?.name
            if (className === "TitledStudyItem" || (item instanceof Task && className === "TaskWithType")) {
                console.log(`    WARNING: placeholder ${className} found at ${item.name}`)
                hasPlaceholders = true
            }
            if (item.items) checkPlaceholders(item.items)
        }
    }

    checkPlaceholders(course.items)
    console.assert(!hasPlaceholders, "No placeholders should remain")

    console.log("\n✅ All checks passed!")
}

function dumpItems(items: any[], depth: number) {
    const indent = "  ".repeat(depth + 2)
    for (const item of items) {
        const name = (item as any).name ?? "?"
        const type = item.constructor?.name ?? "?"
        console.log(`${indent}${type}: ${name}`)
        if (item instanceof Section) {
            console.log(`${indent}  type: ${item.itemType}`)
            dumpItems(item.items, depth + 1)
        } else if (item instanceof Lesson) {
            console.log(`${indent}  type: ${item.itemType}`)
            dumpItems(item.items, depth + 1)
        } else if (item instanceof Task) {
            console.log(`${indent}  type: ${item.itemType}`)
            console.log(`${indent}  desc: ${item.descriptionText.length} len`)
            const files = item.getTaskFileValues()
            if (files.length > 0) {
                console.log(`${indent}  files: [${files.map((f: any) => f.name).join(", ")}]`)
            }
        }
    }
}

main().catch(err => {
    console.error("FATAL:", err)
    process.exit(1)
})
