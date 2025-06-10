export const MoneyBoxAllocation = class {
  constructor(moneyBoxId, amount) {
    this.moneyBoxId = moneyBoxId;
    this.amount = amount;
  }
}

export const Allocation = class {
    constructor(id, name, type, moneyBoxAllocations) {
      this.id = id;
      this.name = name;
      this.type = type;
      this.moneyBoxAllocations = moneyBoxAllocations;
    }
  }
  