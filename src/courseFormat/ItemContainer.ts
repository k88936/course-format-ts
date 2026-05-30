import { StudyItem } from "./StudyItem"

export abstract class ItemContainer extends StudyItem {
  private _items: StudyItem[] = []

  get items(): StudyItem[] {
    return this._items
  }

  set items(value: StudyItem[]) {
    this._items = [...value]
  }

  override init(parentItem: ItemContainer, isRestarted: boolean): void {
    this.parent = parentItem
    this.items.forEach((item, index) => {
      item.index = index + 1
      item.init(this, isRestarted)
    })
  }

  getItem(name: string): StudyItem | undefined {
    return this.items.find((item) => item.name === name)
  }

  addItem(item: StudyItem): void {
    this._items.push(item)
  }

  addItemAt(index: number, item: StudyItem): void {
    this._items.splice(index, 0, item)
  }

  replaceItem(existingItem: StudyItem, newItem: StudyItem): void {
    const index = this._items.indexOf(existingItem)
    if (index < 0) return
    this._items[index] = newItem
  }

  removeItem(item: StudyItem): void {
    this._items = this._items.filter((value) => value !== item)
  }

  sortItems(): void {
    this._items.sort((a, b) => a.index - b.index)
  }
}
