import { MoneyBox } from '../model/MoneyBox.js'


async function fromEntityToModel(moneyBoxEntity, balance) {
    return new MoneyBox(moneyBoxEntity.id, moneyBoxEntity.name, moneyBoxEntity.target, moneyBoxEntity.tag, balance); 
}


export const moneyBoxConverter = {
    fromEntityToModel
};