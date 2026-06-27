// TODO: mirror of com.jetbrains.edu.learning.yaml.YamlLoader.kt
// TODO: mirror of com.jetbrains.edu.learning.courseFormat.ext.StudyItemExt.kt (path helpers inlined)
// TODO: mirror of com.jetbrains.edu.learning.courseFormat.ext.TaskExt.kt (dirName/findDir helpers inlined)

import { VirtualFileSystem } from "./VirtualFileSystem"
import { StudyItem } from "../courseFormat/StudyItem"
import { Course } from "../courseFormat/Course"
import { Section } from "../courseFormat/Section"
import { Lesson } from "../courseFormat/Lesson"
import { FrameworkLesson } from "../courseFormat/FrameworkLesson"
import { Task } from "../courseFormat/tasks/Task"
import { ItemContainer } from "../courseFormat/ItemContainer"
import { getChildrenConfigFileNames, deserializeItem } from "./YamlDeserializer"

/**
 * Get the relative path to children directory for a StudyItem.
 * Only Course has a non-empty path (customContentPath); all others return "".
 * Mirrors StudyItem.getPathToChildren() from Kotlin.
 */
export function studyItemExtGetPathToChildren(item: StudyItem): string {
  if (item instanceof Course) {
    return item.customContentPath
  }
  return ""
}

/**
 * Get the directory name for a Task.
 * For framework tasks in study mode, returns "task" instead of the task name.
 * Mirrors Task.dirName from Kotlin TaskExt.kt.
 */
export function taskExtDirName(task: Task): string {
  if (task.lesson instanceof FrameworkLesson) {
    return "task"
  }
  return task.name
}

/**
 * Find the task directory within a lesson directory.
 * Mirrors Task.findDir(lessonDir) from Kotlin TaskExt.kt.
 */
export function taskExtFindDir(task: Task, lessonDir: string | null, vfs: VirtualFileSystem): string | null {
  if (lessonDir == null) return null
  return vfs.findChild(lessonDir, taskExtDirName(task))
}

/**
 * Resolve the filesystem directory for a StudyItem within the course.
 * Mirrors StudyItem.getDir(courseDir) from Kotlin StudyItemExt.kt.
 *
 * @param item the study item to resolve directory for
 * @param courseDir the root course directory path
 * @param vfs the virtual filesystem
 * @returns the resolved directory path, or null if not found
 */
export function studyItemExtGetDir(item: StudyItem, courseDir: string, vfs: VirtualFileSystem): string | null {
  if (item instanceof Course) {
    return courseDir
  }

  if (item instanceof Section) {
    const parentDir = studyItemExtGetDir(item.parent, courseDir, vfs)
    if (parentDir == null) return null
    const childrenRelPath = studyItemExtGetPathToChildren(item.parent)
    const childrenDir = vfs.findFileByRelativePath(parentDir, childrenRelPath)
    if (childrenDir == null) return null
    return vfs.findChild(childrenDir, item.name)
  }

  if (item instanceof Lesson) {
    const parentDir = studyItemExtGetDir(item.parent, courseDir, vfs)
    if (parentDir == null) return null
    const childrenRelPath = studyItemExtGetPathToChildren(item.parent)
    const childrenDir = vfs.findFileByRelativePath(parentDir, childrenRelPath)
    if (childrenDir == null) return null
    return vfs.findChild(childrenDir, item.name)
  }

  if (item instanceof Task) {
    const lessonDir = studyItemExtGetDir(item.lesson, courseDir, vfs)
    return taskExtFindDir(item, lessonDir, vfs)
  }

  throw new Error(`Can't find directory for the item ${item.itemType}`)
}

/**
 * Get the config file for a child item within a parent container.
 * Mirrors StudyItem.getConfigFileForChild(project, childName) from Kotlin YamlLoader.kt.
 *
 * @param parent the parent container item
 * @param childName the name of the child to find config for
 * @param vfs the virtual filesystem
 * @param courseDir the root course directory
 * @returns the config file path and config name, or null if not found
 */
export function getConfigFileForChild(
  parent: StudyItem,
  childName: string,
  vfs: VirtualFileSystem,
  courseDir: string,
): { configFilePath: string; configName: string } | null {
  const parentDir = studyItemExtGetDir(parent, courseDir, vfs)
  if (parentDir == null) return null

  const childrenRelPath = studyItemExtGetPathToChildren(parent)
  const childrenDir = vfs.findFileByRelativePath(parentDir, childrenRelPath)
  if (childrenDir == null) return null

  const childDir = vfs.findChild(childrenDir, childName)
  if (childDir == null) return null

  const configNames = getChildrenConfigFileNames(parent)
  for (const configName of configNames) {
    const configFilePath = vfs.findChild(childDir, configName)
    if (configFilePath != null) {
      return { configFilePath, configName }
    }
  }

  return null
}

/**
 * Deserialize a list of content placeholders into fully-initialized items.
 * Mirrors StudyItem.deserializeContent(project, contentList, mapper) from Kotlin YamlLoader.kt.
 *
 * @param parent the parent container item
 * @param contentList the list of placeholder items (TitledStudyItem instances)
 * @param vfs the virtual filesystem
 * @param courseDir the root course directory
 * @returns the list of deserialized items
 */
export function deserializeContent<T extends StudyItem>(
  parent: StudyItem,
  contentList: T[],
  vfs: VirtualFileSystem,
  courseDir: string,
): T[] {
  const content: T[] = []
  for (const titledItem of contentList) {
    const configInfo = getConfigFileForChild(parent, titledItem.name, vfs, courseDir)
    if (configInfo == null) continue

    const configFileText = vfs.loadText(configInfo.configFilePath)
    const deserializedItem = deserializeItem(configInfo.configName, configFileText, parent) as T | null
    if (deserializedItem == null) continue

    deserializedItem.name = titledItem.name
    deserializedItem.index = titledItem.index
    deserializedItem.parent = parent as ItemContainer
    content.push(deserializedItem)
  }
  return content
}

/**
 * Recursively deserialize children of an item if it is an ItemContainer.
 * Mirrors StudyItem.deserializeChildrenIfNeeded(project, course) from Kotlin YamlLoader.kt.
 *
 * @param item the item to deserialize children for
 * @param vfs the virtual filesystem
 * @param courseDir the root course directory
 */
export function deserializeChildrenIfNeeded(
  item: StudyItem,
  vfs: VirtualFileSystem,
  courseDir: string,
): void {
  if (!(item instanceof ItemContainer)) return

  item.items = deserializeContent(item, item.items, vfs, courseDir)
  item.items.filter((child): child is ItemContainer => child instanceof ItemContainer).forEach((container) => {
    deserializeChildrenIfNeeded(container, vfs, courseDir)
  })
}

