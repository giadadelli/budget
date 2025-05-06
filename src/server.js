import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { calcolaSituazione } from './utility.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.resolve(__dirname, '..', 'public')));
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, '..', 'views'));

app.get('/', async (req, res) => {
  try {
    const data = await calcolaSituazione();
    res.render('index', { data });
  } catch (error) {
    console.error('❌ Errore nel calcolo della situazione:', error);
    res.status(500).send('Errore interno del server');
  }
});

import bodyParser from 'body-parser';
app.use(bodyParser.json());

import fs from 'fs';

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
    res.status(500).send('Errore interno');
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server avviato su http://localhost:${PORT}`);
});
