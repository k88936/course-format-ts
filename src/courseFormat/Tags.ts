import { message } from "./uiMessages"

const PROGRAMMING_LANGUAGE_TAG_SEARCH_OPTION = "programming_language"
const LANGUAGE_TAG_SEARCH_OPTION = "language"

export class Tag {
  readonly text: string
  private readonly searchOption: string

  constructor(text: string, searchOption = "tag") {
    this.text = text
    this.searchOption = searchOption
  }

  getSearchText(): string {
    return `${this.searchOption}:${this.text}`.toLowerCase()
  }

  accept(filter: string): boolean {
    const textInLowerCase = this.text.toLowerCase()
    if (textInLowerCase.includes(filter)) {
      return true
    }
    const searchPrefix = `${this.searchOption}:`
    return filter.startsWith(searchPrefix) && textInLowerCase.includes(filter.substring(searchPrefix.length))
  }
}

export class ProgrammingLanguageTag extends Tag {
  constructor(language: string) {
    super(language, PROGRAMMING_LANGUAGE_TAG_SEARCH_OPTION)
  }
}

export class HumanLanguageTag extends Tag {
  constructor(languageName: string) {
    super(languageName, LANGUAGE_TAG_SEARCH_OPTION)
  }
}

export class FeaturedTag extends Tag {
  constructor() {
    super(message("course.dialog.tags.featured"))
  }
}
