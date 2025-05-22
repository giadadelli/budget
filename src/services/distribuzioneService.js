import fs from 'fs';
import { existsSync } from 'node:fs';
import crypto from 'crypto'

import {fileUtility} from './util/fileUtils.js'

function getDistribuzioniFile(key) {
  const fileDistribuzioni = fileUtility.getFilePath(key, 'distribuzioni.csv');
  console.log("getDistribuzioniFile -> " + fileDistribuzioni);
  if (!existsSync(fileDistribuzioni)) {
    const content = 'id,nome,salvadanaio_id,importo,inserito';
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
    
    const righe = body.distribuzioni.map(d => {
        const id = crypto.randomUUID()
        const salvadanaioId = d.salvadanaioId;
        const importo = d.importo;
        return `\n${id},${body.nome},${salvadanaioId},${importo},${oggi}`;
      }).join('');
    const riga = `\n${body.nome},${body.distribuzioni},${oggi}`;

    const file = distribuzioneService.getDistribuzioniFile(conto);
    fs.appendFileSync(file, righe, 'utf8');
}

export const distribuzioneService = {
    getDistribuzioniFile,
    addDistribuzione
};