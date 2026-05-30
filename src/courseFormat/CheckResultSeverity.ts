export enum CheckResultSeverity {
  Info = "Info",
  Warning = "Warning",
  Error = "Error",
}

export function isWarning(severity: CheckResultSeverity): boolean {
  return severity === CheckResultSeverity.Warning
}

export function isInfo(severity: CheckResultSeverity): boolean {
  return severity === CheckResultSeverity.Info
}
