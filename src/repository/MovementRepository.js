//movimenti.csv

import fs from 'fs';
import { existsSync } from 'node:fs';

import {fileUtility} from '../services/util/fileUtils.js'

import { Movement } from "../model/Movement.js";

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
    const movements = await Promise.resolve(fileUtility.readCsv(movementRepository._getMovimentiFile(conto)));
    movements.forEach(element => {
      //TODO data deve essere un new Date
      //TODO importo deve essere un numero
        result.push(new Movement(element.id, element.data, element.importo, element.descrizione));
    });
    return result;
}


export const movementRepository = {
    _getMovimentiFile,
    findAll
};
