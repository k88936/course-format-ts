export class Vendor {
  readonly name: string
  readonly email?: string
  readonly url?: string

  constructor(name = "", email?: string | null, url?: string | null) {
    this.name = name
    this.email = email ?? undefined
    this.url = url ?? undefined
  }

  toString(): string {
    return this.name
  }
}
