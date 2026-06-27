// TODO: mirror of com.jetbrains.edu.learning.yaml.VirtualFileSystem (conceptual abstraction)

/**
 * Abstract virtual filesystem interface for reading course files.
 * Mirrors IntelliJ's VirtualFile operations used by the Kotlin YAML loader.
 */
export interface VirtualFileSystem {
  /**
   * Find a child file/directory by name within a directory.
   * @param dirPath the parent directory path
   * @param name the child name to look for
   * @returns the full path to the found child, or null if not found
   */
  findChild(dirPath: string, name: string): string | null

  /**
   * Load the full text content of a file.
   * @param filePath the full path to the file
   * @returns the file content as a string
   */
  loadText(filePath: string): string

  /**
   * Find a file by a relative path within a directory.
   * @param dirPath the parent directory path
   * @param relativePath the relative path to look for
   * @returns the full path to the found file, or null if not found
   */
  findFileByRelativePath(dirPath: string, relativePath: string): string | null
}
