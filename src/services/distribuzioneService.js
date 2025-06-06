import crypto from 'crypto'

import { allocationRepository } from '../repository/AllocationRepository.js'
import { AllocationConverter } from '../converter/AllocationConverter.js'

function addDistribuzione(conto, body) {
    if (!Array.isArray(body.distribuzioni) || body.distribuzioni.length === 0) {
        throw new Error('Nessuna distribuzione da salvare');
    }
    const today = new Date().toISOString().slice(0, 10);
    
    const id = crypto.randomUUID()
    const rows = body.distribuzioni.map(d => {
        const salvadanaioId = d.salvadanaioId;
        const importo = d.importo;
        return `\n${id},${body.nome},${salvadanaioId},${importo},${today},${body.tipoDistribuzione}`;
      }).join('');

    allocationRepository.save(conto, rows);
}

async function getDistribuzioni(conto) {
  const allocationEntities = await Promise.resolve(allocationRepository.findAll(conto));
  const result = [];
  for(var i=0; i<allocationEntities.length; i++) {
    const model = await Promise.resolve(AllocationConverter.fromEntityToModel(allocationEntities[i]));
    result.push(model);

  }

  return result;
}

export const distribuzioneService = {
    addDistribuzione,
    getDistribuzioni
};