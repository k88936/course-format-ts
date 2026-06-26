import {
  BinaryContents,
  FileContents,
  InMemoryTextualContents,
  InMemoryUndeterminedContents,
  TextualContents,
  UndeterminedContents,
} from "./FileContents"
import { EduFileErrorHighlightLevel } from "./EduFileErrorHighlightLevel"
import { exceedsBase64ContentLimit, getBinaryFileLimit, isBinary, mimeFileType } from "./fileUtils"
import { logger } from "./loggerUtils"
import type { TaskFile } from "./TaskFile"
import { COURSE_CONTENTS_FOLDER } from "./EduFormatNames"

export class EduFile {
  name = ""

  private _contents: FileContents = UndeterminedContentsEmpty

  get text(): string {
    return this.contents.textualRepresentation
  }

  set text(value: string) {
    this.contents = new InMemoryUndeterminedContents(value)
  }

  get contents(): FileContents {
    return this._contents
  }

  set contents(value: FileContents) {
    this._contents = value
  }

  setContentsIfEquals(expectedValue: FileContents, newValue: FileContents): boolean {
    if (this._contents === expectedValue) {
      this._contents = newValue
      return true
    }
    return false
  }

  get isBinary(): boolean | undefined {
    if (isTextualContents(this.contents)) return false
    if (isBinaryContents(this.contents)) return true
    return undefined
  }

  isTrackChanges = true
  errorHighlightLevel: EduFileErrorHighlightLevel = EduFileErrorHighlightLevel.TEMPORARY_SUPPRESSION
  isVisible = false
  isEditable = true
  isPropagatable = true
  isLearnerCreated = false

  constructor(name?: string, contents?: FileContents | string) {
    if (name !== undefined) {
      this.name = name
    }
    if (contents !== undefined) {
      if (typeof contents === "string") {
        this.contents = new InMemoryTextualContents(contents)
      }
      else {
        this.contents = contents
      }
    }
  }

  getTextToSerialize(): string | null {
    if (!(this instanceof requireTaskFile().TaskFile) || !this.task.course.needWriteYamlText) {
      return null
    }

    if (isBinaryContents(this.contents)) return null
    if (isUndeterminedContents(this.contents)) {
      const contentType = mimeFileType(this.name)
      if (contentType && isBinary(String(contentType))) return null
    }

    const text = this.contents.textualRepresentation
    if (exceedsBase64ContentLimit(text)) {
      logger("EduFile").warn(
        `Base64 encoding of \`${this.name}\` file exceeds limit (${getBinaryFileLimit()}), its content isn't serialized`
      )
      return null
    }

    return text
  }

  get pathInCourse(): string {
    const pathPrefix = this instanceof requireTaskFile().TaskFile ? this.task.pathInCourse : ""
    const pathInCourse = `${pathPrefix}/${this.name}`
    return pathInCourse.startsWith("/") ? pathInCourse.substring(1) : pathInCourse
  }

  get pathInArchive(): string {
    return `${COURSE_CONTENTS_FOLDER}/${this.pathInCourse}`
  }
}

function requireTaskFile(): { TaskFile: typeof TaskFile } {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require("./TaskFile")
}

function isTextualContents(contents: FileContents): contents is TextualContents {
  return (contents as TextualContents).text !== undefined
}

function isBinaryContents(contents: FileContents): contents is BinaryContents {
  return (contents as BinaryContents).bytes !== undefined
}

function isUndeterminedContents(contents: FileContents): contents is UndeterminedContents {
  return (contents as UndeterminedContents).textualRepresentation !== undefined && !isTextualContents(contents)
}

const UndeterminedContentsEmpty: UndeterminedContents = {
  textualRepresentation: "",
  get text() {
    return this.textualRepresentation
  },
  get bytes() {
    try {
      return Buffer.from(this.textualRepresentation, "base64")
    }
    catch {
      return new Uint8Array()
    }
  },
}
