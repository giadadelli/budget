import fs from 'fs';
import csv from 'csv-parser';
import dotenv from 'dotenv';

dotenv.config();

const fileMovimenti = process.env.MOVIMENTI_PATH;

function getMovimenti() {
  
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

async function getSaldo() {
  const movimenti = await Promise.resolve(movimentiService.getMovimenti());
  return movimenti.reduce(
    (accumulator, currentValue) => accumulator + currentValue.importo,
    0,
  );
}

async function addSpese(spese) {
  if (!Array.isArray(spese) || spese.length === 0) {
    throw new Error('Nessuna spesa da salvare');
  }

  const oggi = new Date().toISOString().slice(0, 10);
  
  const righe = spese.map(sp => {
    const descrizione = sp.descrizione.replace(/"/g, '""');
    const sottocategoria = sp.sottocategoria ?? 'null';
    return `\n${sp.data},-${sp.importo},${sp.categoria},${sottocategoria},"${descrizione}",${oggi}`;
  }).join('');
  
  fs.appendFileSync(fileMovimenti, righe, 'utf8');
}

async function addEntrate({ movimenti, incremento, data }) {
  if (!Array.isArray(movimenti) || movimenti.length === 0 || isNaN(incremento) || !data) {
    throw new Error('Dati non validi');
  }

  const oggi = new Date().toISOString().slice(0, 10);
  
  // 1. Scrivi i movimenti
  const righe = movimenti.map(m => {
    const descrizione = m.descrizione.replace(/"/g, '""');
    return `\n${m.data},${m.importo},${m.categoria},null,"${descrizione}",${oggi}`;
  }).join('');
  
  fs.appendFileSync(fileMovimenti, righe, 'utf8');

}

export const movimentiService = {
    addSpese,
    addEntrate,
    getMovimenti,
    getSaldo
};
