import type { EduFile } from "./EduFile"
import type { BinaryContents, TextualContents } from "./FileContents"

/**
 * Factory used to create file contents during deserialization of EduFile, TaskFile.
 * Used when json or yaml do not have the contents themselves (text field is empty).
 */
export interface FileContentsFactory {
  /**
   * [file] is the EduFile object that will contain these contents.
   * This file may not be fully initialized at the moment of the call.
   */
  createBinaryContents(file: EduFile): BinaryContents

  /**
   * see createBinaryContents
   */
  createTextualContents(file: EduFile): TextualContents
}
