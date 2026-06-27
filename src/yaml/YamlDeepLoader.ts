// TODO: mirror of com.jetbrains.edu.learning.yaml.YamlDeepLoader.kt
// TODO: mirror of com.jetbrains.edu.learning.courseFormat.ext.TaskExt.kt (description/format helpers inlined)

import {VirtualFileSystem} from "./VirtualFileSystem"
import {StudyItem} from "../courseFormat/StudyItem"
import {Course} from "../courseFormat/Course"
import {Section} from "../courseFormat/Section"
import {Lesson} from "../courseFormat/Lesson"
import {FrameworkLesson} from "../courseFormat/FrameworkLesson"
import {Task} from "../courseFormat/tasks/Task"
import {LessonContainer} from "../courseFormat/LessonContainer"
import {DescriptionFormat} from "../courseFormat/DescriptionFormat"
import {
    COURSE_CONFIG,
    REMOTE_COURSE_CONFIG,
    REMOTE_SECTION_CONFIG,
    REMOTE_LESSON_CONFIG,
    REMOTE_TASK_CONFIG
} from "./YamlConfigSettings"
import {deserializeCourse} from "./YamlDeserializer"
import {parseYaml} from "./YamlMapper"
import {
    deserializeChildrenIfNeeded,
    studyItemExtGetDir,
} from "./YamlLoader"

/**
 * Load a complete Course from a virtual filesystem.
 * Mirrors YamlDeepLoader.loadCourse(project) from Kotlin.
 *
 * Flow:
 * 1. Find course config via vfs.findChild(courseDir, COURSE_CONFIG)
 * 2. Load and deserialize course YAML
 * 3. Recursively deserialize all children (sections, lessons, tasks)
 * 4. Load remote info (IDs, update dates) for all items
 * 5. Initialize the course hierarchy
 * 6. If EDUCATOR mode, load task descriptions from task.md/task.html
 *
 * @param vfs the virtual filesystem abstraction
 * @param courseDir the root directory path of the course
 * @returns the fully-initialized Course, or null if course config cannot be deserialized
 */
export function loadCourse(vfs: VirtualFileSystem, courseDir: string): Course {
    // Step 1: Find and load course config
    const courseConfigPath = vfs.findChild(courseDir, COURSE_CONFIG)
    if (courseConfigPath == null) {
        throw new Error("Course yaml config cannot be null")
    }

    const courseConfigText = vfs.loadText(courseConfigPath)
    const deserializedCourse = deserializeCourse(courseConfigText)
    if (deserializedCourse == null) throw new Error("Failed to deserialize course config")

    // Step 2: Recursively deserialize children (sections, lessons, tasks)
    deserializeChildrenIfNeeded(deserializedCourse, vfs, courseDir)

    // Step 3: Load remote info for all items recursively
    loadRemoteInfoRecursively(deserializedCourse, vfs, courseDir)

    // Step 4: Load task files from VFS into task objects
    loadTaskFiles(deserializedCourse, vfs, courseDir)

    // Step 5: Initialize the course hierarchy
    deserializedCourse.init(deserializedCourse, true)

    // Step 6: load task descriptions
    setDescriptionInfo(deserializedCourse, vfs, courseDir)

    return deserializedCourse
}

/**
 * Visit all tasks under a StudyItem recursively.
 * Mirrors StudyItem.visitTasks(action) from Kotlin StudyItemExt.kt.
 *
 * @param item the item to start traversal from
 * @param action the callback to invoke for each Task
 */
export function studyItemExtVisitTasks(item: StudyItem, action: (task: Task) => void): void {
    if (item instanceof LessonContainer) {
        item.visitTasks(action)
    } else if (item instanceof Lesson) {
        item.visitTasks(action)
    } else if (item instanceof Task) {
        action(item)
    }
}

/**
 * Load task file text content from the VFS into existing TaskFile objects.
 * Task files and their placeholders are already deserialized from YAML config
 * by buildDeserializedTask in YamlDeserializer.ts. This function only reads
 * the actual file content from the virtual filesystem.
 *
 * @param course the course containing tasks
 * @param vfs the virtual filesystem
 * @param courseDir the root course directory
 */
export function loadTaskFiles(
    course: Course,
    vfs: VirtualFileSystem,
    courseDir: string,
): void {
    course.visitLessons((lesson) => {
        for (const task of lesson.taskList) {
            const taskDir = taskExtGetTaskDirectory(task, vfs, courseDir)
            if (taskDir == null) continue

            for (const taskFile of task.getTaskFileValues()) {
                // Look for the actual file content under the task directory
                const filePath = vfs.findChild(taskDir, taskFile.name)
                if (filePath != null) {
                    try {
                        taskFile.text = vfs.loadText(filePath)
                    } catch {
                        // File not found or unreadable — leave text empty
                    }
                }
            }
        }
    })
}

/**
 * Get the directory name for a Task.
 * For framework tasks in study mode, returns "task" instead of the task name.
 * Mirrors Task.dirName from Kotlin TaskExt.kt.
 *
 * Note: This is the same as the function in YamlLoader.ts, re-exported for convenience.
 */
export {taskExtDirName} from "./YamlLoader"

/**
 * Get the task directory path for description/YAML file resolution.
 * For framework lessons in study mode, the description/YAML files are in a different
 * directory than the task files.
 *
 * Mirrors Task.getTaskDirectory(project) from Kotlin TaskExt.kt.
 *
 * @param task the task to find directory for
 * @param vfs the virtual filesystem
 * @param courseDir the root course directory
 * @returns the task directory path, or null if not found
 */
export function taskExtGetTaskDirectory(
    task: Task,
    vfs: VirtualFileSystem,
    courseDir: string,
): string | null {
    if (task.lesson instanceof FrameworkLesson) {
        // In study mode for framework lessons, description/YAML files are in the named task directory
        const lessonDir = studyItemExtGetDir(task.lesson, courseDir, vfs)
        if (lessonDir == null) {
            return null
        }
        return vfs.findChild(lessonDir, task.name)
    }

    // Otherwise, use the standard task directory resolution
    return studyItemExtGetDir(task, courseDir, vfs)
}

/**
 * Map a file extension to a DescriptionFormat.
 * Mirrors VirtualFile.toDescriptionFormat() from Kotlin TaskExt.kt.
 *
 * @param extension the file extension (e.g., "html", "md")
 * @returns the corresponding DescriptionFormat
 */
export function taskExtToDescriptionFormat(extension: string): DescriptionFormat {
    switch (extension) {
        case "html":
            return DescriptionFormat.HTML
        case "md":
            return DescriptionFormat.MD
        default:
            throw new Error(`Unknown description format for extension: ${extension}`)
    }
}

/**
 * Get the description file for a task.
 * Mirrors Task.getDescriptionFile(project, translationLanguage, guessFormat) from Kotlin TaskExt.kt.
 *
 * @param task the task to find description file for
 * @param vfs the virtual filesystem
 * @param courseDir the root course directory
 * @param guessFormat if true, try both task.html and task.md; otherwise use the current descriptionFormat
 * @returns the path to the description file, or null if not found
 */
export function taskExtGetDescriptionFile(
    task: Task,
    vfs: VirtualFileSystem,
    courseDir: string,
    guessFormat: boolean = false,
): string | null {
    const taskDirectory = taskExtGetTaskDirectory(task, vfs, courseDir)
    if (taskDirectory == null) return null

    if (guessFormat) {
        const htmlFile = vfs.findChild(taskDirectory, "task.html")
        if (htmlFile != null) return htmlFile
        return vfs.findChild(taskDirectory, "task.md")
    }

    const fileName = task.descriptionFormat === DescriptionFormat.HTML ? "task.html" : "task.md"
    return vfs.findChild(taskDirectory, fileName)
}

/**
 * Update a task's description text and format from its description file.
 * Mirrors Task.updateDescriptionTextAndFormat(project) from Kotlin TaskExt.kt.
 *
 * @param task the task to update
 * @param vfs the virtual filesystem
 * @param courseDir the root course directory
 */
export function taskExtUpdateDescriptionTextAndFormat(
    task: Task,
    vfs: VirtualFileSystem,
    courseDir: string,
): void {
    const taskDescriptionFile = taskExtGetDescriptionFile(task, vfs, courseDir, true)

    if (taskDescriptionFile == null) {
        task.descriptionFormat = DescriptionFormat.HTML
        task.descriptionText = "Task description not found"
        return
    }

    try {
        task.descriptionText = vfs.loadText(taskDescriptionFile)
        const extension = taskDescriptionFile.split(".").pop() ?? ""
        task.descriptionFormat = taskExtToDescriptionFormat(extension)
    } catch {
        task.descriptionFormat = DescriptionFormat.HTML
        task.descriptionText = "Task description not found"
    }
}

/**
 * Get the remote config file name for a StudyItem.
 */
function getRemoteConfigFileName(item: StudyItem): string {
    if (item instanceof Course) return REMOTE_COURSE_CONFIG
    if (item instanceof Section) return REMOTE_SECTION_CONFIG
    if (item instanceof Lesson) return REMOTE_LESSON_CONFIG
    return REMOTE_TASK_CONFIG
}

/**
 * Load remote info for a single StudyItem.
 * Finds *-remote-info.yaml, parses it, and applies id/updateDate.
 * Mirrors StudyItem.loadRemoteInfo(project) from Kotlin YamlDeepLoader.kt.
 *
 * @param item the item to load remote info for
 * @param vfs the virtual filesystem
 * @param courseDir the root course directory
 */
export function loadRemoteInfo(
    item: StudyItem,
    vfs: VirtualFileSystem,
    courseDir: string,
): void {
    const itemDir = studyItemExtGetDir(item, courseDir, vfs)
    if (itemDir == null) return

    const remoteConfigName = getRemoteConfigFileName(item)
    const remoteConfigPath = vfs.findChild(itemDir, remoteConfigName)
    if (remoteConfigPath == null) {
        // If no remote config found, silently default (keep id=0, updateDate=epoch)
        return
    }

    const remoteText = vfs.loadText(remoteConfigPath)
    const yaml: any = parseYaml(remoteText) ?? {}

    // Apply remote info - mirrors the inline approach from dist/yaml-loader.js
    if (yaml.id != null && (yaml.id as number) > 0) {
        item.id = yaml.id
    }
    if (yaml.update_date != null) {
        item.updateDate = new Date(yaml.update_date)
    }
}

/**
 * Recursively load remote info for all items under a course.
 * Mirrors Course.loadRemoteInfoRecursively(project) from Kotlin YamlDeepLoader.kt.
 *
 * @param course the course to load remote info for
 * @param vfs the virtual filesystem
 * @param courseDir the root course directory
 */
export function loadRemoteInfoRecursively(
    course: Course,
    vfs: VirtualFileSystem,
    courseDir: string,
): void {
    // Load remote info for the course itself
    loadRemoteInfo(course, vfs, courseDir)

    // Load remote info for sections (top-level only)
    for (const section of course.sections) {
        loadRemoteInfo(section, vfs, courseDir)
    }

    // Load remote info for all lessons and their tasks
    course.visitLessons((lesson) => {
        loadRemoteInfo(lesson, vfs, courseDir)
        for (const task of lesson.taskList) {
            loadRemoteInfo(task, vfs, courseDir)
        }
    })
}

/**
 * Set description info for all tasks in a course.
 * Only called in EDUCATOR mode.
 * Mirrors Course.setDescriptionInfo(project) from Kotlin YamlDeepLoader.kt.
 *
 * @param course the course
 * @param vfs the virtual filesystem
 * @param courseDir the root course directory
 */
export function setDescriptionInfo(
    course: Course,
    vfs: VirtualFileSystem,
    courseDir: string,
): void {
    course.visitLessons((lesson) => {
        lesson.visitTasks((task) => {
            taskExtUpdateDescriptionTextAndFormat(task, vfs, courseDir)
        })
    })
}
