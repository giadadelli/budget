import { Movement } from "./Movement.js";

export const VirtualMovement = class extends Movement {
    constructor(id, date, amount, description, moneyBoxName) {
      super(id, date, amount, description);
      this.moneyBoxName = moneyBoxName; //TODO usare l'id non il nome!!!!
    }
  }
  