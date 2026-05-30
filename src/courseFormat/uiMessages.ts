const FORMAT_BUNDLE = "messages.EduFormatBundle"

export function message(key: string, ...params: Array<string | number>): string {
  if (params.length === 0) {
    return key
  }
  return params.reduce((result: string, param, index) => {
    return result.replace(new RegExp(`\\{${index}\\}`, "g"), String(param))
  }, key)
}

export { FORMAT_BUNDLE }
