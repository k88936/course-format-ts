import { UserInfo } from "./UserInfo"

export class JBAccountUserInfo implements UserInfo {
  email = ""
  name = ""
  jbaLogin = ""

  constructor(userName?: string) {
    if (userName) {
      this.name = userName
    }
  }

  getFullName(): string {
    return this.name
  }

  toString(): string {
    return this.getFullName()
  }
}
