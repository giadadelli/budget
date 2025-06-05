//risparmi.csv
import fs from 'fs';
import { existsSync } from 'node:fs';

import {fileUtility} from '../services/util/fileUtils.js'

import { MoneyBoxEntity } from '../entity/MoneyBoxEntity.js'

function _getRisparmiFile(key) {
  const fileRisparmi = fileUtility.getFilePath(key, 'risparmi.csv');
  console.log("getRisparmiFile -> " + fileRisparmi);

  if (!existsSync(fileRisparmi)) {
    const content = 'id,titolo,obiettivo,inserito,etichetta';
    fs.writeFileSync(fileRisparmi, content);
    console.log("File risparmi.csv created");
  }

  return fileRisparmi;
}

async function findAll(conto) {
    const fileRisparmi = moneyBoxRepository._getRisparmiFile(conto);
    const moneyBoxes = await Promise.resolve(fileUtility.readCsvAsJson(fileRisparmi));
    const result = [];
    for (const moneyBoxEntity of moneyBoxes) {
      const target = moneyBoxEntity.obiettivo != "null" ? parseFloat(moneyBoxEntity.obiettivo) : null;
      const tag = moneyBoxEntity.etichetta === 'null' ? null : moneyBoxEntity.etichetta;
      result.push(new MoneyBoxEntity(moneyBoxEntity.id, moneyBoxEntity.titolo, target, tag));
    }
    
    return result;
}

async function save(conto, moneyBoxEntity) {
  const fileRisparmi = moneyBoxRepository._getRisparmiFile(conto);
  fs.appendFileSync(fileRisparmi, moneyBoxEntity, 'utf8');
}

export const moneyBoxRepository = {
    _getRisparmiFile,
    findAll,
    save
};