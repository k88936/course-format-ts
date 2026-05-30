export interface FileContents {
  readonly textualRepresentation: string
}

export interface DeterminedContents extends FileContents {}

export interface TextualContents extends DeterminedContents {
  readonly text: string
}

export interface BinaryContents extends DeterminedContents {
  readonly bytes: Uint8Array
}

export interface UndeterminedContents extends FileContents {
  readonly textualRepresentation: string
  readonly text: string
  readonly bytes: Uint8Array
}

export const TextualContentsEmpty: TextualContents = {
  text: "",
  get textualRepresentation() {
    return this.text
  },
}

export const BinaryContentsEmpty: BinaryContents = {
  bytes: new Uint8Array(),
  get textualRepresentation() {
    return Buffer.from(this.bytes).toString("base64")
  },
}

export const UndeterminedContentsEmpty: UndeterminedContents = {
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

export class InMemoryBinaryContents implements BinaryContents {
  readonly bytes: Uint8Array

  constructor(bytes: Uint8Array) {
    this.bytes = bytes
  }

  get textualRepresentation(): string {
    return Buffer.from(this.bytes).toString("base64")
  }

  static parseBase64Encoding(base64: string): InMemoryBinaryContents {
    return new InMemoryBinaryContents(Buffer.from(base64, "base64"))
  }
}

export class InMemoryTextualContents implements TextualContents {
  readonly text: string

  constructor(text: string) {
    this.text = text
  }

  get textualRepresentation(): string {
    return this.text
  }
}

export class InMemoryUndeterminedContents implements UndeterminedContents {
  readonly textualRepresentation: string

  constructor(textualRepresentation: string) {
    this.textualRepresentation = textualRepresentation
  }

  get text(): string {
    return this.textualRepresentation
  }

  get bytes(): Uint8Array {
    try {
      return Buffer.from(this.textualRepresentation, "base64")
    }
    catch {
      return new Uint8Array()
    }
  }
}
