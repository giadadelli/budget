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

function getConto(key) {
    let result = null;
    for (const contoPath of elencoConti) {
        const fileInfo = path.join(contoPath, 'info.json');
        const info = JSON.parse(fs.readFileSync(fileInfo));
        if (info.key === key) {
            result = info;
        }
    }
    console.log("Info Conto ", result);
    return result;
}

function getElencoConti() {
    return elencoConti;
}

export const contiService = {
    getConti,
    getConto,
    getElencoConti
};