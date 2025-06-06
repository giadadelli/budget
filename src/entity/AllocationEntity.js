export const MoneyBoxAllocationEntity = class {
  constructor(moneyBoxId, amount) {
    this.moneyBoxId = moneyBoxId;
    this.amount = amount;
  }
}

export const AllocationEntity = class {
    constructor(id, name, type, moneyBoxAllocations) {
      this.id = id;
      this.name = name;
      this.type = type;
      this.moneyBoxAllocations = moneyBoxAllocations;
    }
  }
  