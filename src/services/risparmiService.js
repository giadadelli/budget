import crypto from 'crypto'

import { MoneyBoxRepository } from '../repository/MoneyBoxRepository.js';
import { MoneyBoxConverter } from '../converter/MoneyBoxConverter.js';

import { VirtualMovementRepository } from '../repository/VirtualMovementRepository.js';
import { VirtualMovementConverter } from '../converter/VirtualMovementConverter.js'


async function getSalvadanai(conto) {
    const result = [];
    const moneyBoxEntities = await Promise.resolve(MoneyBoxRepository.findAll(conto));
    for (const moneyBoxEntity of moneyBoxEntities) {
      const balance = await Promise.resolve(risparmiService.getRisparmiTotalePerSalvadanaio(conto, moneyBoxEntity.name)); //TODO va usato l'id del salvadanaio!!!
      const moneyBox = await Promise.resolve(MoneyBoxConverter.fromEntityToModel(moneyBoxEntity, balance));
      result.push(moneyBox);
      
    }
    
    return result;
}

async function getMovimenti(conto) {
  const entities = await Promise.resolve(VirtualMovementRepository.findAll(conto));
  const result = [];
  for (let index = 0; index < entities.length; index++) {
    const entity = entities[index];
    const model = await Promise.resolve(VirtualMovementConverter.fromEntityToModel(entity));
    result.push(model);
  }

  return result;
}

async function getSpese(conto) {
  const movimenti = await Promise.resolve(risparmiService.getMovimenti(conto));
  return movimenti.filter((m) => m.importo < 0);
}

async function getRisparmiTotalePerSalvadanaio(conto, salvadanaio) {
  const movimenti = await Promise.resolve(risparmiService.getMovimenti(conto));
  return movimenti.filter((m) => m.moneyBoxName == salvadanaio).reduce(
    (accumulator, currentValue) => accumulator + currentValue.amount,
    0,
  );
}

async function addSalvadanaio(conto, {titolo, obiettivo, iniziale}) {
    if (!titolo) {
      throw new Error('Nome del salvadanaio obligatorio');
    }
  
    const target = obiettivo > 0 ? obiettivo : null;
    const today = new Date().toISOString().slice(0, 10);
    //'id,titolo,obiettivo,inserito'

    let uuid = crypto.randomUUID();
    const row = `\n${uuid},${titolo},${target},${today},null`;
    
    MoneyBoxRepository.save(conto, row);

    if (iniziale && iniziale > 0) {
      //(conto, {data, importo, categoria, sottocategoria, descrizione })
      risparmiService.addMovimento(conto, {
        data: today,
        importo: iniziale,
        categoria: titolo,
        sottocategoria: null,
        descrizione: "Creazione salvadanaio " + titolo
      });

    }
}

async function addMovimentoNew(conto, {data, importo, salvadanaioId, descrizione }) {
  if (!conto || !data || !importo || !salvadanaioId) {
    throw new Error('Dati non validi');
  }

  const today = new Date().toISOString().slice(0, 10);
  const salvadanai = await Promise.resolve(risparmiService.getSalvadanai(conto));
  const salvadanaio = salvadanai.filter(s => s.id == salvadanaioId);
  const categoria = salvadanaio[0].titolo; //TODO usare id
  
  // 1. Scrivi i movimenti
  const row = `\n${data},${importo},"${categoria}",null,"${descrizione}",${today}`;
  
  VirtualMovementRepository.save(conto, row);
}

async function addMovimento(conto, {data, importo, categoria, sottocategoria, descrizione }) {
  if (!conto || !data || !importo || !categoria) {
    throw new Error('Dati non validi');
  }

  const today = new Date().toISOString().slice(0, 10);
  
  // 1. Scrivi i movimenti
  const row = `\n${data},${importo},"${categoria}",${sottocategoria},"${descrizione}",${today}`;
  
  VirtualMovementRepository.save(conto, row);

}

export const risparmiService = {
    getSalvadanai,
    addSalvadanaio,
    getMovimenti,
    getSpese,
    addMovimento,
    addMovimentoNew,
    getRisparmiTotalePerSalvadanaio
  };
