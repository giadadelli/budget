import { contiService } from './contiService.js';
import fs from 'fs';
import { existsSync } from 'node:fs';

function getSalvadanai(conto) {
    const fileRisparmi = contiService.getRisparmiFilePath(conto);
      if (!existsSync(fileRisparmi)) {
        const content = 'titolo,obiettivo,importo-ricorrente,frequenza,inserito';
        fs.writeFileSync(fileRisparmi, content);
        console.log("File risparmi.csv created");
      }
    return [];
}

export const risparmiService = {
    getSalvadanai
};
