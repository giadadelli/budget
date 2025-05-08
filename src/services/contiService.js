import fs from 'fs';
import dotenv from 'dotenv';
import path  from 'path';

dotenv.config();

const elencoConti = JSON.parse(process.env.CONTI);

function getConti() {
    let result = [];
    elencoConti.forEach(contoPath => {
        const fileInfo = path.join(contoPath, 'info.json');
        const info = JSON.parse(fs.readFileSync(fileInfo));
        result.push(info);
    });
    return result;
}

function getAccantonamentiFilePath(key) {
    const result = getFilePath(key, 'accantonamenti.json');
    console.log("getAccantonamentiFilePath -> " + result)
    return result;
}

function getSottocategorieFilePath(key) {
    const result = getFilePath(key, 'sottocategorie.json');
    console.log("getSottocategorieFilePath -> " + result)
    return result;
}

function getMovimentiFilePath(key) {
    const result = getFilePath(key, 'movimenti.csv');
    console.log("getMovimentiFilePath -> " + result)
    return result;
}

function getFilePath(key, fileName) {
    let result = null;
    elencoConti.forEach(contoPath => {
        const fileInfo = path.join(contoPath, 'info.json');
        const info = JSON.parse(fs.readFileSync(fileInfo));
        if (info.key === key) {
            result = path.join(contoPath, fileName);
        }
    });
    return result;
}

export const contiService = {
    getConti,
    getAccantonamentiFilePath,
    getSottocategorieFilePath,
    getMovimentiFilePath
};