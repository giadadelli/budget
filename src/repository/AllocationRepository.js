//distribuzioni.csv
import fs from 'fs';
import { existsSync } from 'node:fs';

import {fileUtility} from '../services/util/fileUtils.js'

import { AllocationEntity, MoneyBoxAllocationEntity } from '../entity/AllocationEntity.js'

function _getDistribuzioniFile(key) {
  const file = fileUtility.getFilePath(key, 'distribuzioni.csv');
  console.log("getDistribuzioniFile -> " + file);
  if (!existsSync(file)) {
    const content = 'id,nome,salvadanaio_id,importo,inserito,tipo';
    fs.writeFileSync(file, content);
    console.log("File distribuzioni.csv created");
  }
  return file;
}

async function findAll(conto) {
  const file = AllocationRepository._getDistribuzioniFile(conto);
  const allocations = await Promise.resolve(fileUtility.readCsvAsJson(file));
  let result = {};
  for (const allocation of allocations) {
    if (!result[allocation.id]) {
      result[allocation.id] = {};
      result[allocation.id].nome = allocation.nome;
      result[allocation.id].tipo = allocation.tipo;
      result[allocation.id].salvadanai = [];

    }

    result[allocation.id].salvadanai.push({
      "salvadanaioId": allocation.salvadanaio_id,
      "importo": allocation.importo
    });
  }
  
  const newResult = [];
  Object.keys(result).forEach(key => {
    const moneyBoxAllocations = [];
    result[key].salvadanai.forEach(s => {
      moneyBoxAllocations.push(new MoneyBoxAllocationEntity(s.salvadanaioId, s.importo));
    });
    newResult.push(new AllocationEntity(key, result[key].nome, result[key].tipo, moneyBoxAllocations));
  });
  return newResult;

}

async function save(conto, allocations) {
  const file = AllocationRepository._getDistribuzioniFile(conto);
  fs.appendFileSync(file, allocations, 'utf8');
}

export const AllocationRepository = {
  _getDistribuzioniFile,
    findAll,
    save
};