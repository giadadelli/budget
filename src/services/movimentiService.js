import { movementRepository } from '../repository/MovementRepository.js';

function getMovimenti(conto) {
  return movementRepository.findAll(conto);
}

async function getSaldo(conto) {
  const movements = await Promise.resolve(movimentiService.getMovimenti(conto));
  return movements.reduce(
    (accumulator, currentValue) => accumulator + currentValue.amount,
    0,
  );
}

async function addSpese(conto, spese) {
  if (!Array.isArray(spese) || spese.length === 0) {
    throw new Error('Nessuna spesa da salvare');
  }

  const today = new Date().toISOString().slice(0, 10);
  
  const rows = spese.map(sp => {
    const description = sp.descrizione.replace(/"/g, '""');
    const subcategory = sp.sottocategoria ?? 'null';
    return `\n${sp.data},-${sp.importo},${sp.categoria},${subcategory},"${description}",${today}`;
  }).join('');
  
  movementRepository.save(conto, rows);
  
}

async function addMovimento(conto, {data, importo, categoria, sottocategoria, descrizione }) {
  if (!conto || !data || !importo) {
    throw new Error('Dati non validi');
  }

  const today = new Date().toISOString().slice(0, 10);
  const row = `\n${data},${importo},${categoria},${sottocategoria},"${descrizione}",${today}`;
  
  movementRepository.save(conto, row);

}

export const movimentiService = {
    addSpese,
    getMovimenti,
    addMovimento,
    getSaldo
};
