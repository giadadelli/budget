import { MovementEntity } from './MovementEntity.js'

export const VirtualMovementEntity = class extends MovementEntity {
    constructor(id, date, amount, description, moneyBoxName) {
      super(id, date, amount, description);
      this.moneyBoxName = moneyBoxName; //TODO usare l'id non il nome!!!!
    }
  }
  