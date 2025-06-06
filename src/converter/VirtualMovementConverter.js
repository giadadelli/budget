import { VirtualMovement } from '../model/VirtualMovement.js'


async function fromEntityToModel(virtualMovementEntity) {
    return new VirtualMovement(virtualMovementEntity.id, virtualMovementEntity.date, virtualMovementEntity.amount, virtualMovementEntity.description, virtualMovementEntity.moneyBoxName);
}


export const VirtualMovementConverter = {
    fromEntityToModel
};