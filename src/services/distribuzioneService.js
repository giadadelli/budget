import fs from 'fs';
import { existsSync } from 'node:fs';
import crypto from 'crypto'

import {fileUtility} from './util/fileUtils.js'

function getDistribuzioniFile(key) {
  const fileDistribuzioni = fileUtility.getFilePath(key, 'distribuzioni.csv');
  console.log("getDistribuzioniFile -> " + fileDistribuzioni);
  if (!existsSync(fileDistribuzioni)) {
    const content = 'id,nome,salvadanaio_id,importo,inserito,tipo';
    fs.writeFileSync(fileDistribuzioni, content);
    console.log("File distribuzioni.csv created");
  }
  return fileDistribuzioni;
}

function addDistribuzione(conto, body) {
    if (!Array.isArray(body.distribuzioni) || body.distribuzioni.length === 0) {
        throw new Error('Nessuna distribuzione da salvare');
    }
    const oggi = new Date().toISOString().slice(0, 10);
    
    const id = crypto.randomUUID()
    const righe = body.distribuzioni.map(d => {
        const salvadanaioId = d.salvadanaioId;
        const importo = d.importo;
        return `\n${id},${body.nome},${salvadanaioId},${importo},${oggi},${body.tipoDistribuzione}`;
      }).join('');

    const file = distribuzioneService.getDistribuzioniFile(conto);
    fs.appendFileSync(file, righe, 'utf8');
}

async function getDistribuzioni(conto) {
  const file = distribuzioneService.getDistribuzioniFile(conto);
  const distribuzioni = await Promise.resolve(fileUtility.readCsvAsJson(file));
  let result = {};
  for (const distribuzione of distribuzioni) {
    if (!result[distribuzione.id]) {
      result[distribuzione.id] = {};
      result[distribuzione.id].nome = distribuzione.nome;
      result[distribuzione.id].tipo = distribuzione.tipo;
      result[distribuzione.id].salvadanai = [];

    }

    result[distribuzione.id].salvadanai.push({
      "salvadanaioId": distribuzione.salvadanaio_id,
      "importo": distribuzione.importo
    });
  }
  
  return result;
}

export const distribuzioneService = {
    getDistribuzioniFile,
    addDistribuzione,
    getDistribuzioni
};