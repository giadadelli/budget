//risparmi.csv
export const MoneyBox = class {
    constructor(id, name, target, tag, balance) {
      this.id = id;
      this.name = name; //titolo
      this.target = target; //obiettivo
      this.tag = tag; //etichetta
      this.balance = balance;
      this.isTargetAchieved = target <= balance;
    }
  }
  