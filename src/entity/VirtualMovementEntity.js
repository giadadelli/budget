//accantonamenti.csv
export const VirtualMovementEntity = class extends MovementEntity {
//class VirtualMovementEntity extends MovementEntity {
    constructor(id, date, amount, description, moneyBoxName) {
      super(id, date, amount, description);
      this.moneyBoxName = moneyBoxName; //TODO usare l'id non il nome!!!!
    }
  }
  