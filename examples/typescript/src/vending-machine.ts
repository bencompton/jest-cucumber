const ITEM_COST = 0.5;

export class VendingMachine {
  public balance: number = 0;

  public items: { [itemName: string]: number } = {};

  public stockItem(itemName: string, count: number) {
    this.items[itemName] = this.items[itemName] || 0;
    this.items[itemName] += count;
  }

  public insertMoney(amount: number) {
    this.balance += amount;
  }

  public dispenseItem(itemName: string) {
    if (this.balance >= ITEM_COST && this.items[itemName] > 0) {
      this.balance -= ITEM_COST;
    }

    this.items[itemName] -= 1;
  }
}
