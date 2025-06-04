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

async function getMovimenti(conto) {
    const result = [];
    const movements = await Promise.resolve(fileUtility.readCsv(movementRepository._getMovimentiFile(conto)));
    movements.forEach(element => {
        result.push(new MovementEntity(element.id, element.data, element.importo, element.descrizione));
    });
    return result;
}


export const movementRepository = {
    _getMovimentiFile,
    getMovimenti
};
