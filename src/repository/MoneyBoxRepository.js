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
    const file = MoneyBoxRepository._getRisparmiFile(conto);
    const entities = await Promise.resolve(fileUtility.readCsvAsJson(file));
    const result = [];
    for (const moneyBoxEntity of entities) {
      const target = moneyBoxEntity.obiettivo != "null" ? parseFloat(moneyBoxEntity.obiettivo) : null;
      const tag = moneyBoxEntity.etichetta === 'null' ? null : moneyBoxEntity.etichetta;
      result.push(new MoneyBoxEntity(moneyBoxEntity.id, moneyBoxEntity.titolo, target, tag));
    }
    
    return result;
}

async function save(conto, moneyBoxEntity) {
  const file = MoneyBoxRepository._getRisparmiFile(conto);
  fs.appendFileSync(file, moneyBoxEntity, 'utf8');
}

export const MoneyBoxRepository = {
    _getRisparmiFile,
    findAll,
    save
};