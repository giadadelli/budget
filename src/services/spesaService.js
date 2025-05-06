import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import dotenv from 'dotenv';

dotenv.config();
const root = path.resolve(process.cwd());

export function salvaSpesa({ data, importo, categoria, descrizione }) {
  if (!data || isNaN(importo) || !categoria || !descrizione) {
    throw new Error('Dati spesa non validi');
  }

  const movimentiPath = path.join(root, process.env.MOVIMENTI_PATH);
  const saldoPath = path.join(root, process.env.SALDO_PATH);

  // 1. Salva la spesa nel file movimenti
  const rigaSpesa = `\n${data},-${importo},${categoria},"${descrizione.replace(/"/g, '""')}"`;
  fs.appendFileSync(movimentiPath, rigaSpesa, 'utf8');

  // 2. Leggi il saldo più recente
  const records = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(saldoPath)
      .pipe(csv())
      .on('data', row => {
        const d = row.data?.trim();
        const i = parseFloat(row.importo);
        if (d && !isNaN(i)) {
          records.push({ data: d, importo: i });
        }
      })
      .on('end', () => {
        let ultimoSaldo = 0;
        if (records.length > 0) {
          records.sort((a, b) => new Date(b.data) - new Date(a.data));
          ultimoSaldo = records[0].importo;
        }

        // 3. Calcola il nuovo saldo
        const nuovoSaldo = ultimoSaldo - importo;
        const nuovaRigaSaldo = `\n${data},${nuovoSaldo}`;

        try {
          fs.appendFileSync(saldoPath, nuovaRigaSaldo, 'utf8');
          resolve();
        } catch (err) {
          console.error('❌ Errore scrivendo il saldo:', err);
          reject(err);
        }
      })
      .on('error', reject);
  });
}
