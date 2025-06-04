//distribuzioni.csv
export const AllocationEntity = class {
    constructor(id, name, moneyBoxId, amount, type) {
      this.id = id;
      this.name = name;
      this.moneyBoxId = moneyBoxId;
      this.amount = amount;
      this.type = type;
    }
  }
  