import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const root = path.resolve(process.cwd());

export async function salvaAccantonamenti({ movimenti, incremento, data }) {
  if (!Array.isArray(movimenti) || movimenti.length === 0 || isNaN(incremento) || !data) {
    throw new Error('Dati non validi');
  }

  const movimentiPath = path.join(root, process.env.MOVIMENTI_PATH);
  const oggi = new Date().toISOString().slice(0, 10);
  
  // 1. Scrivi i movimenti
  const righe = movimenti.map(m => {
    const descrizione = m.descrizione.replace(/"/g, '""');
    return `\n${m.data},${m.importo},${m.categoria},null,"${descrizione}",${oggi}`;
  }).join('');
  
  fs.appendFileSync(movimentiPath, righe, 'utf8');

}
