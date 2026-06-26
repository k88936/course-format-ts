// TODO: mirror of edu-format/src/com/jetbrains/edu/learning/yaml/format/SectionYamlUtil.kt

import { Section } from "../../courseFormat/Section"
import { formatError } from "../errorHandling/InvalidYamlFormatException"
import { unnamedItemAtMessage } from "../errorHandling/InvalidYamlFormatException"
import { TitledStudyItem } from "../TitledStudyItem"

export interface SectionYaml {
  custom_name?: string
  content: string[]
  tags?: string[]
}

export function buildSection(yaml: SectionYaml): Section {
  const section = new Section()
  const items = yaml.content.map((title: string | null, index: number) => {
    if (title == null) {
      formatError(unnamedItemAtMessage(index + 1))
    }
    const titledStudyItem = new TitledStudyItem(title!)
    titledStudyItem.index = index + 1
    return titledStudyItem
  })
  section.items = items
  section.customPresentableName = yaml.custom_name
  section.contentTags = yaml.tags ?? []
  return section
}
