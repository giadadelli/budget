import fs from 'fs';
import { existsSync } from 'node:fs';

import {fileUtility} from './util/fileUtils.js'
import { movementRepository } from '../repository/MovementRepository.js';

function getMovimentiFile(key) {
  const fileMovimenti = fileUtility.getFilePath(key, 'movimenti.csv');
  console.log("getMovimentiFile -> " + fileMovimenti);
  if (!existsSync(fileMovimenti)) {
    const content = 'data,importo,categoria,sottocategoria,descrizione,inserito';
    fs.writeFileSync(fileMovimenti, content);
    console.log("File movimenti.csv created");
  }
  return fileMovimenti;
}

function getMovimenti(conto) {
  return movementRepository.findAll(conto);
  //return fileUtility.readCsv(movimentiService.getMovimentiFile(conto));
}

async function getSaldo(conto) {
  const movimenti = await Promise.resolve(movimentiService.getMovimenti(conto));
  return movimenti.reduce(
    (accumulator, currentValue) => accumulator + currentValue.amount,
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
  
  const fileMovimenti = movimentiService.getMovimentiFile(conto);
  fs.appendFileSync(fileMovimenti, righe, 'utf8');
}

async function addMovimento(conto, {data, importo, categoria, sottocategoria, descrizione }) {
  if (!conto || !data || !importo) {
    throw new Error('Dati non validi');
  }

  const oggi = new Date().toISOString().slice(0, 10);
  
  // 1. Scrivi i movimenti
  const riga = `\n${data},${importo},${categoria},${sottocategoria},"${descrizione}",${oggi}`;
  
  const fileMovimenti = movimentiService.getMovimentiFile(conto);
  fs.appendFileSync(fileMovimenti, riga, 'utf8');

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
  
  const fileMovimenti = movimentiService.getMovimentiFile(conto);
  fs.appendFileSync(fileMovimenti, righe, 'utf8');

}

export const movimentiService = {
    addSpese,
    addEntrate,
    getMovimenti,
    addMovimento,
    getSaldo,
    getMovimentiFile
};
