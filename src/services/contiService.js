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

function getElencoConti() {
    return elencoConti;
}

export const contiService = {
    getConti,
    getElencoConti
};