//distribuzioni.csv
import fs from 'fs';
import { existsSync } from 'node:fs';

import {fileUtility} from '../services/util/fileUtils.js'

import { AllocationEntity, MoneyBoxAllocationEntity } from '../entity/AllocationEntity.js'

function _getDistribuzioniFile(key) {
  const fileDistribuzioni = fileUtility.getFilePath(key, 'distribuzioni.csv');
  console.log("getDistribuzioniFile -> " + fileDistribuzioni);
  if (!existsSync(fileDistribuzioni)) {
    const content = 'id,nome,salvadanaio_id,importo,inserito,tipo';
    fs.writeFileSync(fileDistribuzioni, content);
    console.log("File distribuzioni.csv created");
  }
  return fileDistribuzioni;
}

async function findAll(conto) {
  const file = allocationRepository._getDistribuzioniFile(conto);
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
  const file = allocationRepository._getDistribuzioniFile(conto);
  fs.appendFileSync(file, allocations, 'utf8');
}

export const allocationRepository = {
  _getDistribuzioniFile,
    findAll,
    save
};