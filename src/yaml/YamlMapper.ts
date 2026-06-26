// TODO: mirror of edu-format/src/com/jetbrains/edu/learning/yaml/YamlMapper.kt

import yaml, { DocumentOptions, SchemaOptions, ParseOptions } from "yaml"

export const CURRENT_YAML_VERSION = 5

export interface YamlMapperOptions {
  locale?: string
  snakeCase?: boolean
}

const defaultOptions: YamlMapperOptions = {
  locale: "en",
  snakeCase: true,
}

export function createParseOptions(): ParseOptions & DocumentOptions & SchemaOptions {
  return {
    // Equivalent to Jackson's YAMLParser.Feature.EMPTY_STRING_AS_NULL
    // and similar parse configuration
  }
}

export function createStringifyOptions(): any {
  return {
    // Equivalent to:
    // - disable WRITE_DOC_START_MARKER
    // - disable USE_NATIVE_TYPE_ID
    // - enable MINIMIZE_QUOTES
    // - enable LITERAL_BLOCK_STYLE
    indent: 2,
    lineWidth: 0, // LITERAL_BLOCK_STYLE equivalent
    doubleQuotedMinMultiLineLength: 0, // minimize quotes
    collectionStyle: "block" as any,
  }
}

/**
 * Parse YAML string into a JavaScript object
 */
export function parseYaml<T = any>(yamlText: string): T {
  return yaml.parse(yamlText, createParseOptions()) as T
}

/**
 * Stringify a JavaScript object into YAML string
 */
export function stringifyYaml(obj: any): string {
  return yaml.stringify(obj, createStringifyOptions())
}
