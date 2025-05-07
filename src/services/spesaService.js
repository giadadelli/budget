import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import dotenv from 'dotenv';

dotenv.config();
const root = path.resolve(process.cwd());

export async function salvaSpese(spese) {
  if (!Array.isArray(spese) || spese.length === 0) {
    throw new Error('Nessuna spesa da salvare');
  }

  const movimentiPath = path.join(root, process.env.MOVIMENTI_PATH);
  const saldoPath = path.join(root, process.env.SALDO_PATH);

  const righe = spese.map(sp => {
    const descrizione = sp.descrizione.replace(/"/g, '""');
    const sottocategoria = sp.sottocategoria ?? 'null';
    return `\n${sp.data},-${sp.importo},${sp.categoria},${sottocategoria},"${descrizione}"`;
  }).join('');

  fs.appendFileSync(movimentiPath, righe, 'utf8');

  // Leggi saldo corrente
  const records = await new Promise((resolve, reject) => {
    const result = [];
    fs.createReadStream(saldoPath)
      .pipe(csv())
      .on('data', row => {
        const d = row.data?.trim();
        const i = parseFloat(row.importo);
        if (d && !isNaN(i)) result.push({ data: d, importo: i });
      })
      .on('end', () => resolve(result))
      .on('error', reject);
  });

  const ultimoSaldo = records.sort((a, b) => new Date(b.data) - new Date(a.data))[0]?.importo ?? 0;
  const totaleSpese = spese.reduce((sum, s) => sum + s.importo, 0);
  const nuovaRiga = `\n${spese[0].data},${ultimoSaldo - totaleSpese}`;
  fs.appendFileSync(saldoPath, nuovaRiga, 'utf8');
}

