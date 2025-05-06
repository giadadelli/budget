// Tutti gli import vanno all'inizio
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';
import bodyParser from 'body-parser';
import { utility } from './utility.js';
import csv from 'csv-parser';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.resolve(__dirname, '..', 'public')));
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, '..', 'views'));

app.get('/', async (req, res) => {
  try {
    const data = await utility.calcolaSituazione();
    const accantonamenti = await utility.leggiAccantonamenti();

    res.render('index', { data, accantonamenti });
  } catch (error) {
    console.error('❌ Errore nel calcolo della situazione:', error);
    if (!res.headersSent) {
      res.status(500).send('Errore interno del server');
    }
  }
});

app.post('/aggiungi-spesa', async (req, res) => {
  const { data, importo, categoria, descrizione } = req.body;

  if (!data || isNaN(importo) || !categoria || !descrizione) {
    return res.status(400).send('Campi mancanti');
  }

  const filePath = path.resolve(__dirname, '..', process.env.MOVIMENTI_PATH);
  const riga = `\n${data},-${importo},${categoria},"${descrizione.replace(/"/g, '""')}"`;

  try {
    fs.appendFileSync(filePath, riga, 'utf8');
    res.status(200).send('OK');
  } catch (err) {
    console.error('Errore durante scrittura:', err);
    if (!res.headersSent) {
      res.status(500).send('Errore interno');
    }
  }
});

app.post('/aggiungi-accantonamenti', async (req, res) => {
  const { movimenti, incremento, data } = req.body;

  if (!Array.isArray(movimenti) || movimenti.length === 0 || isNaN(incremento) || !data) {
    return res.status(400).send('Dati non validi');
  }  

  const movimentiPath = path.resolve(__dirname, '..', process.env.MOVIMENTI_PATH);
  const saldoPath = path.resolve(__dirname, '..', process.env.SALDO_PATH);

  let dataInput;
  // Salva i movimenti
  const righe = movimenti.map(m => {
    const descrizione = m.descrizione.replace(/"/g, '""');
    return `\n${m.data},${m.importo},${m.categoria},"${descrizione}"`;
  }).join('');

  try {
    fs.appendFileSync(movimentiPath, righe, 'utf8');
  } catch (err) {
    console.error('❌ Errore scrivendo i movimenti:', err);
    return res.status(500).send('Errore scrittura movimenti');
  }

  // Leggi saldo più recente
  let ultimoSaldo = 0;
  try {
    const records = [];
    let dataInput;
    fs.createReadStream(saldoPath)
      .pipe(csv())
      .on('data', (row) => {
        const data = row.data?.trim();
        const importo = parseFloat(row.importo);
        if (data && !isNaN(importo)) {
          records.push({ data, importo });
        }
      })
      .on('end', () => {
        if (records.length > 0) {
          records.sort((a, b) => new Date(b.data) - new Date(a.data));
          ultimoSaldo = records[0].importo;
        }

        // Calcola nuovo saldo e scrivi su saldo.csv
        const nuovoSaldo = ultimoSaldo + incremento;
        const nuovaRiga = `\n${data},${nuovoSaldo}`;

        try {
          fs.appendFileSync(saldoPath, nuovaRiga, 'utf8');
          res.status(200).send('OK');
        } catch (err) {
          console.error('❌ Errore scrivendo il saldo:', err);
          res.status(500).send('Errore scrittura saldo');
        }
      })
      .on('error', err => {
        console.error('❌ Errore leggendo il saldo:', err);
        res.status(500).send('Errore lettura saldo');
      });

  } catch (err) {
    console.error('❌ Errore generico:', err);
    res.status(500).send('Errore interno');
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server avviato su http://localhost:${PORT}`);
});
