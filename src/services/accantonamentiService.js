import fs from 'fs';
import { contiService } from './contiService.js';

function getAccantonamenti(conto) {
    const fileAccantonamenti = contiService.getAccantonamentiFilePath(conto);
    const raw = fs.readFileSync(fileAccantonamenti);
    return JSON.parse(raw);
}

export const accantonamentiService = {
    getAccantonamenti
};