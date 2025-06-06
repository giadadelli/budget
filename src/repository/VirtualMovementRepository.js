//accantonamenti.csv

import fs from 'fs';
import { existsSync } from 'node:fs';

import {fileUtility} from '../services/util/fileUtils.js'

import { Movement } from "../model/Movement.js";
import { VirtualMovementEntity } from "../entity/VirtualMovementEntity.js";


function _getAccantonamentiFile(key) {
  const file = fileUtility.getFilePath(key, 'accantonamenti.csv');
  console.log("getAccantonamentiFile -> " + file);

  if (!existsSync(file)) {
    const content = 'data,importo,categoria,sottocategoria,descrizione,inserito';
    fs.writeFileSync(file, content);
    console.log("File accantonamenti.csv created");
  }

  return file;
}

async function findAll(conto) {
    const result = [];
    const movements = await Promise.resolve(fileUtility.readCsv(VirtualMovementRepository._getAccantonamentiFile(conto)));
    movements.forEach(element => {
      result.push(new VirtualMovementEntity(element.id, new Date(element.data), element.importo, element.descrizione, element.categoria));//TODO non ho l'id e la moneyBox è la categoria (nome moneyBox non id!!!!)
    });
    return result;
}

function save(conto, movements) {
  const file = VirtualMovementRepository._getAccantonamentiFile(conto);
  fs.appendFileSync(file, movements, 'utf8');
}


export const VirtualMovementRepository = {
  _getAccantonamentiFile,
    findAll,
    save
};
