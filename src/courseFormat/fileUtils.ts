import { lookup } from "mime-types"
import { logger } from "./loggerUtils"

const mimeBinaryTypes = ["image", "audio", "video", "application", "font"].map((type) => `${type}/`)

export function isBinary(contentType: string): boolean {
  return mimeBinaryTypes.some((prefix) => contentType.startsWith(prefix))
}

export function mimeFileType(path: string): string | false | undefined {
  try {
    return lookup(path)
  }
  catch (error) {
    logger("fileUtils").error("Failed to determine file mimetype", error)
    return undefined
  }
}

export function exceedsBase64ContentLimit(base64text: string): boolean {
  return Buffer.from(base64text, "utf16le").byteLength > getBinaryFileLimit()
}

export function getBinaryFileLimit(): number {
  return 1024 * 1024
}

export function getExtension(fileName: string): string {
  const index = fileName.lastIndexOf(".")
  return index < 0 ? "" : fileName.substring(index + 1)
}
