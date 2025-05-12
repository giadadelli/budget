import fs from 'fs';
import csv from 'csv-parser';
import { contiService } from './contiService.js';
import { existsSync } from 'node:fs';

function getMovimenti(conto) {
  const fileMovimenti = contiService.getMovimentiFilePath(conto);

  if (!existsSync(fileMovimenti)) {
    const content = 'data,importo,categoria,sottocategoria,descrizione,inserito';
    fs.writeFileSync(fileMovimenti, content);
    console.log("File movimenti.csv created");
  }
  

  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(fileMovimenti)
      .pipe(csv())
      .on('data', (data) => {
        const importo = parseFloat(data.importo);
        if (!isNaN(importo)) {
          results.push({ ...data, importo });
        }
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

async function getSaldo(conto) {
  const movimenti = await Promise.resolve(movimentiService.getMovimenti(conto));
  return movimenti.reduce(
    (accumulator, currentValue) => accumulator + currentValue.importo,
    0,
  );
}

async function addSpese(conto, spese) {
  if (!Array.isArray(spese) || spese.length === 0) {
    throw new Error('Nessuna spesa da salvare');
  }

  const oggi = new Date().toISOString().slice(0, 10);
  
  const righe = spese.map(sp => {
    const descrizione = sp.descrizione.replace(/"/g, '""');
    const sottocategoria = sp.sottocategoria ?? 'null';
    return `\n${sp.data},-${sp.importo},${sp.categoria},${sottocategoria},"${descrizione}",${oggi}`;
  }).join('');
  
  const fileMovimenti = contiService.getMovimentiFilePath(conto);
  fs.appendFileSync(fileMovimenti, righe, 'utf8');
}

async function addEntrate(conto, {movimenti, incremento, data }) {
  if (!Array.isArray(movimenti) || movimenti.length === 0 || isNaN(incremento) || !data) {
    throw new Error('Dati non validi');
  }

  const oggi = new Date().toISOString().slice(0, 10);
  
  // 1. Scrivi i movimenti
  const righe = movimenti.map(m => {
    const descrizione = m.descrizione.replace(/"/g, '""');
    return `\n${m.data},${m.importo},${m.categoria},null,"${descrizione}",${oggi}`;
  }).join('');
  
  const fileMovimenti = contiService.getMovimentiFilePath(conto);
  fs.appendFileSync(fileMovimenti, righe, 'utf8');

}

export const movimentiService = {
    addSpese,
    addEntrate,
    getMovimenti,
    getSaldo
};
