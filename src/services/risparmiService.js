import fs from 'fs';
import { existsSync } from 'node:fs';
import crypto from 'crypto'

import { fileUtility } from './util/fileUtils.js'

import { moneyBoxRepository } from '../repository/MoneyBoxRepository.js';
import { moneyBoxConverter } from '../converter/MoneyBoxConverter.js';

function getAccantonamentiFile(key) {
  const fileAccantonamenti = fileUtility.getFilePath(key, 'accantonamenti.csv');
  console.log("getAccantonamentiFile -> " + fileAccantonamenti);

  if (!existsSync(fileAccantonamenti)) {
    const content = 'data,importo,categoria,sottocategoria,descrizione,inserito';
    fs.writeFileSync(fileAccantonamenti, content);
    console.log("File accantonamenti.csv created");
  }

  return fileAccantonamenti;
}

async function getSalvadanai(conto) {
    const result = [];
    const moneyBoxEntities = await Promise.resolve(moneyBoxRepository.findAll(conto));
    for (const moneyBoxEntity of moneyBoxEntities) {
      const balance = await Promise.resolve(risparmiService.getRisparmiTotalePerSalvadanaio(conto, moneyBoxEntity.name)); //TODO va usato l'id del salvadanaio!!!
      const moneyBox = await Promise.resolve(moneyBoxConverter.fromEntityToModel(moneyBoxEntity, balance));
      result.push(moneyBox);
      
    }
    
    return result;
}

function getMovimenti(conto) {
  return fileUtility.readCsv(risparmiService.getAccantonamentiFile(conto));
}

async function getSpese(conto) {
  const movimenti = await Promise.resolve(risparmiService.getMovimenti(conto));
  return movimenti.filter((m) => m.importo < 0);
}

async function getRisparmiTotalePerSalvadanaio(conto, salvadanaio) {
  const movimenti = await Promise.resolve(risparmiService.getMovimenti(conto));
  return movimenti.filter((m) => m.categoria == salvadanaio).reduce(
    (accumulator, currentValue) => accumulator + currentValue.importo,
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
    
    moneyBoxRepository.save(conto, row);

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

  const oggi = new Date().toISOString().slice(0, 10);
  const salvadanai = await Promise.resolve(risparmiService.getSalvadanai(conto));
  const salvadanaio = salvadanai.filter(s => s.id == salvadanaioId);
  const categoria = salvadanaio[0].titolo; //TODO usare id
  
  // 1. Scrivi i movimenti
  const riga = `\n${data},${importo},"${categoria}",null,"${descrizione}",${oggi}`;
  
  const fileMovimenti = risparmiService.getAccantonamentiFile(conto);
  fs.appendFileSync(fileMovimenti, riga, 'utf8');

}

async function addMovimento(conto, {data, importo, categoria, sottocategoria, descrizione }) {
  if (!conto || !data || !importo || !categoria) {
    throw new Error('Dati non validi');
  }

  const oggi = new Date().toISOString().slice(0, 10);
  
  // 1. Scrivi i movimenti
  const riga = `\n${data},${importo},"${categoria}",${sottocategoria},"${descrizione}",${oggi}`;
  
  const fileMovimenti = risparmiService.getAccantonamentiFile(conto);
  fs.appendFileSync(fileMovimenti, riga, 'utf8');

}

export const risparmiService = {
    getSalvadanai,
    addSalvadanaio,
    getAccantonamentiFile,
    getMovimenti,
    getSpese,
    addMovimento,
    addMovimentoNew,
    getRisparmiTotalePerSalvadanaio
  };
