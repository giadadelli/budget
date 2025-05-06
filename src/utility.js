import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const rootPath = path.resolve(__dirname, '..');

function leggiAccantonamenti() {
  const filePath = path.join(rootPath, process.env.ACCANTONAMENTI_PATH);
  const raw = fs.readFileSync(filePath);
  return JSON.parse(raw);
}

function leggiMovimenti() {
  const filePath = path.join(rootPath, process.env.MOVIMENTI_PATH);
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        const importo = parseFloat(data.importo);
        if (!isNaN(importo)) {
          results.push({ ...data, importo });
        }
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

function leggiSaldo() {
  const filePath = path.join(rootPath, process.env.SALDO_PATH);
  return new Promise((resolve, reject) => {
    const records = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        const data = row.data?.trim();
        const importo = parseFloat(row.importo);
        if (data && !isNaN(importo)) {
          records.push({ data, importo });
        }
      })
      .on('end', () => {
        if (records.length === 0) return resolve(0);
        records.sort((a, b) => new Date(b.data) - new Date(a.data));
        resolve(records[0].importo);
      })
      .on('error', reject);
  });
}

async function calcolaSituazione() {
  const [accantonamenti, movimenti, saldo] = await Promise.all([
    leggiAccantonamenti(),
    leggiMovimenti(),
    leggiSaldo()
  ]);

  const fondi = [];
  const buste = [];
  const sommePerCategoria = {};

  movimenti.forEach(mov => {
    const categoria = mov.categoria;
    if (!accantonamenti[categoria]) {
      console.log(`⚠️ Categoria sconosciuta nel movimento: ${categoria}`);
      return;
    }

    sommePerCategoria[categoria] = (sommePerCategoria[categoria] || 0) + mov.importo;
  });

  for (const [categoria, valore] of Object.entries(sommePerCategoria)) {
    const info = accantonamenti[categoria];
    const voce = {
      nome: categoria,
      attuale: valore,
      ...info
    };
    if (info.tipo === 'fondo') fondi.push(voce);
    if (info.tipo === 'busta') buste.push(voce);
  }

  const totaleFondi = fondi.reduce((sum, f) => sum + f.attuale, 0);
  const totaleBuste = buste.reduce((sum, b) => sum + b.attuale, 0);
  const avanzo = saldo - totaleFondi - totaleBuste;

  return {
    saldo,
    fondi,
    buste,
    avanzo
  };
}

export const utility = {
  leggiAccantonamenti,
  leggiMovimenti,
  leggiSaldo,
  calcolaSituazione
};
