import { Movement } from '../model/Movement.js'


async function fromEntityToModel(movementEntity) {
    return new Movement(movementEntity.id, movementEntity.date, movementEntity.amount, movementEntity.description);
}


export const MovementConverter = {
    fromEntityToModel
};