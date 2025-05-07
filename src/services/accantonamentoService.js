import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import dotenv from 'dotenv';

dotenv.config();

const root = path.resolve(process.cwd());

export async function salvaAccantonamenti({ movimenti, incremento, data }) {
  if (!Array.isArray(movimenti) || movimenti.length === 0 || isNaN(incremento) || !data) {
    throw new Error('Dati non validi');
  }

  const movimentiPath = path.join(root, process.env.MOVIMENTI_PATH);
  const saldoPath = path.join(root, process.env.SALDO_PATH);

  // 1. Scrivi i movimenti
  const righe = movimenti.map(m => {
    const descrizione = m.descrizione.replace(/"/g, '""');
    return `\n${m.data},${m.importo},${m.categoria},null,"${descrizione}"`;
  }).join('');

  fs.appendFileSync(movimentiPath, righe, 'utf8');

  // 2. Leggi saldo più recente
  const records = await new Promise((resolve, reject) => {
    const result = [];
    fs.createReadStream(saldoPath)
      .pipe(csv())
      .on('data', row => {
        const data = row.data?.trim();
        const importo = parseFloat(row.importo);
        if (data && !isNaN(importo)) {
          result.push({ data, importo });
        }
      })
      .on('end', () => resolve(result))
      .on('error', reject);
  });

  let ultimoSaldo = 0;
  if (records.length > 0) {
    records.sort((a, b) => new Date(b.data) - new Date(a.data));
    ultimoSaldo = records[0].importo;
  }

  // 3. Scrivi il nuovo saldo
  const nuovoSaldo = ultimoSaldo + incremento;
  const nuovaRiga = `\n${data},${nuovoSaldo}`;
  fs.appendFileSync(saldoPath, nuovaRiga, 'utf8');
}
