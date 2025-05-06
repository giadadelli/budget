// Tutti gli import vanno all'inizio
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';
import bodyParser from 'body-parser';
import { utility } from './utility.js';
import csv from 'csv-parser';
import { salvaAccantonamenti } from './services/accantonamentoService.js';

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
  try {
    await salvaAccantonamenti(req.body);
    res.status(200).send('OK');
  } catch (err) {
    console.error('❌ Errore accantonamento:', err.message);
    res.status(500).send('Errore durante il salvataggio');
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server avviato su http://localhost:${PORT}`);
});
