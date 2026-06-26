import type { EduFile } from "./EduFile"
import type { FileContentsFactory } from "./FileContentsFactory"
import { BinaryContentsEmpty, TextualContentsEmpty } from "./FileContents"

export const EmtpyFileContentFactory: FileContentsFactory = {
  createBinaryContents(_file: EduFile) {
    return BinaryContentsEmpty
  },
  createTextualContents(_file: EduFile) {
    return TextualContentsEmpty
  },
}
