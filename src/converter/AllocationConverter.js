import { Allocation, MoneyBoxAllocation } from '../model/Allocation.js'


async function fromEntityToModel(allocationEntity) {
    const moneyBoxAllocations =  [];
    allocationEntity.moneyBoxAllocations.forEach(element => {
        moneyBoxAllocations.push(new MoneyBoxAllocation(element.moneyBoxId, element.amount));
    });
    return new Allocation(allocationEntity.id, allocationEntity.name, allocationEntity.type, moneyBoxAllocations); 
}


export const AllocationConverter = {
    fromEntityToModel
};