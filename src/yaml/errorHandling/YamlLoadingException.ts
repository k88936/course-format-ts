// TODO: mirror of edu-format/src/com/jetbrains/edu/learning/yaml/errorHandling/YamlLoadingException.kt

import { message } from "../../courseFormat/uiMessages"
import { ITEM } from "../../courseFormat/EduFormatNames"
import type { StudyItem } from "../../courseFormat/StudyItem"

export class YamlLoadingException extends Error {
  constructor(message: string) {
    super(message)
    this.name = "YamlLoadingException"
  }
}

export class RemoteYamlLoadingException extends Error {
  readonly item: StudyItem

  constructor(item: StudyItem, cause: Error) {
    super(cause.message)
    this.name = "RemoteYamlLoadingException"
    this.item = item
  }
}

export function loadingError(errorMessage: string): never {
  throw new YamlLoadingException(errorMessage)
}

export function noDirForItemMessage(name: string, itemTypeName: string = ITEM): string {
  return message("yaml.editor.invalid.format.no.dir", name, itemTypeName)
}

export function unknownConfigMessage(configName: string): string {
  return message("yaml.editor.invalid.format.unknown.config", configName)
}

export function unexpectedItemTypeMessage(itemType: string): string {
  return message("yaml.editor.invalid.format.unexpected.type", itemType)
}
