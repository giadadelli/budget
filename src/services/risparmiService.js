import fs from 'fs';
import { existsSync } from 'node:fs';
import csv from 'csvtojson'

import { contiService } from './contiService.js';
import { movimentiService } from './movimentiService.js';

async function getSalvadanai(conto) {
    const fileRisparmi = contiService.getRisparmiFilePath(conto);
    if (!existsSync(fileRisparmi)) {
      const content = 'titolo,obiettivo,importo-ricorrente,frequenza,inserito';
      fs.writeFileSync(fileRisparmi, content);
      console.log("File risparmi.csv created");
    }

    const jsonArray=await csv().fromFile(fileRisparmi);
    return jsonArray;
}

async function getSalvadanaiCsv(conto) {
  const fileRisparmi = contiService.getRisparmiFilePath(conto);
  
    if (!existsSync(fileRisparmi)) {
      const content = 'titolo,obiettivo,importo-ricorrente,frequenza,inserito';
      fs.writeFileSync(fileRisparmi, content);
      console.log("File risparmi.csv created");
    }
    
  
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

async function getRisparmiTotale(conto) {
 //const salvadanai = this.getSalvadanaiCsv(conto);
  const salvadanai = await Promise.resolve(this.getSalvadanaiCsv(conto));
    return salvadanai.reduce(
        (accumulator, currentValue) => accumulator + currentValue.importo,
        0,
    );
}

async function addSalvadanaio(conto, {titolo, obiettivo, iniziale}) {
    if (!titolo) {
      throw new Error('Nessuna spesa da salvare');
    }
  
    const oggi = new Date().toISOString().slice(0, 10);
    const riga = `\n${titolo},${obiettivo},null,null,${oggi}`;
    
    const fileRisparmi = contiService.getRisparmiFilePath(conto);
    fs.appendFileSync(fileRisparmi, riga, 'utf8');

    if (iniziale && iniziale > 0) {
      //(conto, {data, importo, categoria, sottocategoria, descrizione })
      movimentiService.addMovimento(conto, {
        data: oggi,
        importo: -iniziale,
        categoria: null,
        sottocategoria: null,
        descrizione: "Creazione salvadanaio " + titolo
      });

    }
}

export const risparmiService = {
    getSalvadanai,
    getRisparmiTotale,
    addSalvadanaio,
    getSalvadanaiCsv
};
