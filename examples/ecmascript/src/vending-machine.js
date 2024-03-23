const ITEM_COST = 0.5;

export class VendingMachine {
  constructor() {
    this.balance = 0;
    this.items = {};
  }

  stockItem(itemName, count) {
    this.items[itemName] = this.items[itemName] || 0;
    this.items[itemName] += count;
  }

  insertMoney(amount) {
    this.balance += amount;
  }

  dispenseItem(itemName) {
    if (this.balance >= ITEM_COST && this.items[itemName] > 0) {
      this.balance -= ITEM_COST;
    }

    this.items[itemName] -= 1;
  }
}
