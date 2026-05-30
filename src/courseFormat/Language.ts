const languages: Record<string, string> = {
  Python: "Python",
  "C++": "C/C++",
  ObjectiveC: "C/C++",
  go: "Go",
  JAVA: "Java",
  kotlin: "Kotlin",
  Scala: "Scala",
  JavaScript: "JavaScript",
  Rust: "Rust",
  PHP: "PHP",
  "Shell Script": "Shell Script",
  SQL: "SQL",
  "C#": "C#",
  unity: "unity",
  TEXT: "Plain text",
  FakeGradleBasedLanguage: "FakeGradleBasedLanguage",
}

export const Language = {
  findLanguageByID(id: string): string | undefined {
    return languages[id]
  },
  findLanguageByName(name: string): string | undefined {
    if (name === "C/C++") {
      return "C++"
    }
    const entry = Object.entries(languages).find(([, value]) => value === name)
    return entry ? entry[0] : undefined
  },
}
