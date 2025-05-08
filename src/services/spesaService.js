import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();
const root = path.resolve(process.cwd());

export async function salvaSpese(spese) {
  if (!Array.isArray(spese) || spese.length === 0) {
    throw new Error('Nessuna spesa da salvare');
  }

  const movimentiPath = path.join(root, process.env.MOVIMENTI_PATH);
  const oggi = new Date().toISOString().slice(0, 10);
  
  const righe = spese.map(sp => {
    const descrizione = sp.descrizione.replace(/"/g, '""');
    const sottocategoria = sp.sottocategoria ?? 'null';
    return `\n${sp.data},-${sp.importo},${sp.categoria},${sottocategoria},"${descrizione}",${oggi}`;
  }).join('');
  
  fs.appendFileSync(movimentiPath, righe, 'utf8');
}

