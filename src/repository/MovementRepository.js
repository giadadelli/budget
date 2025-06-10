//movimenti.csv

import fs from 'fs';
import { existsSync } from 'node:fs';

import {fileUtility} from '../services/util/fileUtils.js'

import { MovementEntity } from "../entity/MovementEntity.js";

function _getMovimentiFile(key) {
  const fileMovimenti = fileUtility.getFilePath(key, 'movimenti.csv');
  console.log("getMovimentiFile -> " + fileMovimenti);
  if (!existsSync(fileMovimenti)) {
    const content = 'data,importo,categoria,sottocategoria,descrizione,inserito';
    fs.writeFileSync(fileMovimenti, content);
    console.log("File movimenti.csv created");
  }
  return fileMovimenti;
}

async function findAll(conto) {
    const result = [];
    const movements = await Promise.resolve(fileUtility.readCsv(MovementRepository._getMovimentiFile(conto)));
    movements.forEach(element => {
      result.push(new MovementEntity(element.id, new Date(element.data), element.importo, element.descrizione));
    });
    return result;
}

function save(conto, movements) {
  const file = MovementRepository._getMovimentiFile(conto);
  fs.appendFileSync(file, movements, 'utf8');
}


export const MovementRepository = {
    _getMovimentiFile,
    findAll,
    save
};
