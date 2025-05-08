import fs from 'fs';

import { contiService } from './contiService.js';

function getSottocategorie(conto,) {
    const fileSottocategorie = contiService.getSottocategorieFilePath(conto);
    const raw = fs.readFileSync(fileSottocategorie);
    return JSON.parse(raw);
}

export const sottocategorieService = {
    getSottocategorie
};