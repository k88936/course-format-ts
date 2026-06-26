// TODO: mirror of edu-format/src/com/jetbrains/edu/learning/yaml/errorHandling/InvalidYamlFormatException.kt

import { message } from "../../courseFormat/uiMessages"
import { ITEM } from "../../courseFormat/EduFormatNames"

export class InvalidYamlFormatException extends Error {
  constructor(message: string) {
    super(message)
    this.name = "InvalidYamlFormatException"
  }
}

export function formatError(errorMessage: string): never {
  throw new InvalidYamlFormatException(errorMessage)
}

export function unsupportedItemTypeMessage(itemType: string, itemName: string = ITEM): string {
  return message("yaml.editor.invalid.format.unsupported.type", itemName, itemType)
}

export function unnamedItemAtMessage(position: number): string {
  return message("yaml.editor.invalid.format.unnamed.item", position)
}

export function negativeLengthNotAllowedMessage(): string {
  return message("yaml.editor.invalid.format.placeholders.negative.length")
}

export function negativeOffsetNotAllowedMessage(): string {
  return message("yaml.editor.invalid.format.placeholders.negative.offset")
}
