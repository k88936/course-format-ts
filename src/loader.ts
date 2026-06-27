import { Course } from "./courseFormat/Course"
import { unzipSync } from "fflate"
import { loadCourse } from "./yaml/YamlDeepLoader"
import { VirtualFileSystem } from "./yaml/VirtualFileSystem"
import { COURSE_CONFIG } from "./yaml/YamlConfigSettings"

export function loadFromYamlZip(zipBuffer: ArrayBuffer | Uint8Array): Course {
  // Convert to Uint8Array if needed
  const buffer: Uint8Array = zipBuffer instanceof ArrayBuffer
    ? new Uint8Array(zipBuffer)
    : zipBuffer

  // Unzip the archive into a map of file path → Uint8Array
  const zipEntries: Record<string, Uint8Array> = unzipSync(buffer)

  // Build a ZipVfs from the entries and load the course
  const files: Record<string, string> = {}
  for (const [path, data] of Object.entries(zipEntries)) {
    files[path] = new TextDecoder().decode(data)
  }

  const allKeys = Object.keys(files)

  const vfs: VirtualFileSystem = {
    findChild(dirPath: string, name: string): string | null {
      const normalizedDir = !dirPath || dirPath === "." ? "" : dirPath + "/"
      const fullPath = normalizedDir + name
      if (files[fullPath] !== undefined || allKeys.some(k => k.startsWith(fullPath + "/"))) {
        return fullPath
      }
      return null
    },
    loadText(filePath: string): string {
      const content = files[filePath]
      if (content === undefined) {
        throw new Error(`File not found: ${filePath}`)
      }
      return content
    },
    findFileByRelativePath(dirPath: string, relativePath: string): string | null {
      if (!relativePath) {
        return !dirPath || dirPath === "." ? "" : dirPath
      }
      const normalizedDir = !dirPath || dirPath === "." ? "" : dirPath + "/"
      const fullPath = normalizedDir + relativePath
      if (files[fullPath] !== undefined || allKeys.some(k => k.startsWith(fullPath + "/"))) {
        return fullPath
      }
      return null
    },
  }

  // Find the root dir: the course config file may be at any key level
  const courseConfigKey = allKeys.find(k => k === COURSE_CONFIG || k.endsWith("/" + COURSE_CONFIG))
  if (courseConfigKey == null) {
    throw new Error("No course-info.yaml found in zip")
  }
  const idx = courseConfigKey.lastIndexOf("/")
  const courseDir = idx >= 0 ? courseConfigKey.substring(0, idx) : ""

  return loadCourse(vfs, courseDir)
}

