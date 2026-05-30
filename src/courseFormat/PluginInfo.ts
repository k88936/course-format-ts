export class PluginInfo {
  stringId = ""
  displayName?: string
  minVersion?: string
  maxVersion?: string

  constructor(stringId?: string, displayName?: string | null, minVersion?: string | null, maxVersion?: string | null) {
    if (stringId !== undefined) {
      this.stringId = stringId
    }
    this.displayName = displayName ?? undefined
    this.minVersion = minVersion ?? undefined
    this.maxVersion = maxVersion ?? undefined
  }
}
