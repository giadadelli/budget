import fs from 'fs';
import { existsSync } from 'node:fs';
import csv from 'csvtojson'
import crypto from 'crypto'

import { fileUtility } from './util/fileUtils.js'

function getRisparmiFile(key) {
  const fileRisparmi = fileUtility.getFilePath(key, 'risparmi.csv');
  console.log("getRisparmiFile -> " + fileRisparmi);

  if (!existsSync(fileRisparmi)) {
    const content = 'id,titolo,obiettivo,importo_ricorrente,frequenza,inserito';
    fs.writeFileSync(fileRisparmi, content);
    console.log("File risparmi.csv created");
  }

  return fileRisparmi;
}

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
    const fileRisparmi = risparmiService.getRisparmiFile(conto);
    const result = await Promise.resolve(fileUtility.readCsvAsJson(fileRisparmi));
    for (const element of result) {
      const saldo = await Promise.resolve(risparmiService.getRisparmiTotalePerSalvadanaio(conto, element.titolo));
      element.saldo = saldo;
      element.obiettivo = element.obiettivo != "null" ? parseFloat(element.obiettivo) : null;
      element.importo_ricorrente = element.importo_ricorrente != "null" ? parseFloat(element.importo_ricorrente) : null;
      if (element.obiettivo) {
        if (element.obiettivo <= element.saldo) {
          element.obiettivo_raggiunto = true;
        } else {
          element.obiettivo_raggiunto = false;
        }
      } else {
        element.obiettivo_raggiunto = false;
      }
      //element.obiettivo_raggiunto = element.obiettivo ? false : element.obiettivo <= element.saldo;
    }
    
    return result;
}

async function getSalvadanaiCsv(conto) {
  const fileRisparmi = risparmiService.getRisparmiFile(conto);
  
    return new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(fileRisparmi)
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

function getMovimenti(conto) {
  return fileUtility.readCsv(risparmiService.getAccantonamentiFile(conto));
}

async function getRisparmiTotale(conto) {
  const movimenti = await Promise.resolve(risparmiService.getMovimenti(conto));
  return movimenti.reduce(
    (accumulator, currentValue) => accumulator + currentValue.importo,
    0,
  );
}

async function getRisparmiTotalePerSalvadanaio(conto, salvadanaio) {
  const movimenti = await Promise.resolve(risparmiService.getMovimenti(conto));
  return movimenti.filter((m) => m.categoria == salvadanaio).reduce(
    (accumulator, currentValue) => accumulator + currentValue.importo,
    0,
  );
}

async function addSalvadanaio(conto, {titolo, obiettivo, iniziale, importo_ricorrente}) {
    if (!titolo) {
      throw new Error('Nessuna spesa da salvare');
    }
  
    obiettivo = obiettivo > 0 ? obiettivo : null;
    const oggi = new Date().toISOString().slice(0, 10);
    //'id,titolo,obiettivo,importo_ricorrente,frequenza,inserito'
    let frequenza = 'manuale';
    if (importo_ricorrente != null && importo_ricorrente > 0) {
      frequenza = 'stipendio';
    } else {
      importo_ricorrente = null;
    }

    let uuid = crypto.randomUUID();
    const riga = `\n${uuid},${titolo},${obiettivo},${importo_ricorrente},${frequenza},${oggi}`;
    
    const fileRisparmi = risparmiService.getRisparmiFile(conto);
    fs.appendFileSync(fileRisparmi, riga, 'utf8');

    if (iniziale && iniziale > 0) {
      //(conto, {data, importo, categoria, sottocategoria, descrizione })
      risparmiService.addMovimento(conto, {
        data: oggi,
        importo: iniziale,
        categoria: titolo,
        sottocategoria: null,
        descrizione: "Creazione salvadanaio " + titolo
      });

    }
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
    getRisparmiTotale,
    addSalvadanaio,
    getSalvadanaiCsv,
    getRisparmiFile,
    getAccantonamentiFile,
    getMovimenti,
    addMovimento,
    getRisparmiTotalePerSalvadanaio
};
