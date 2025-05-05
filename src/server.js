import express from 'express';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

// Percorsi assoluti gestiti correttamente anche da dentro /src
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Calcolo il path assoluto del file JSON usando quello relativo da .env
const jsonPath = path.resolve(__dirname, '..', process.env.JSON_PATH);

const app = express();
const PORT = process.env.PORT || 3000;

// Static files e view engine
app.use(express.static(path.resolve(__dirname, '..', 'public')));
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, '..', 'views'));

// Funzione per leggere il file JSON ogni volta che si accede alla root
const readJson = () => {
  const raw = fs.readFileSync(jsonPath);
  return JSON.parse(raw);
};

// Rotta principale
app.get('/', (req, res) => {
  try {
    const data = readJson();
    res.render('index', { data });
  } catch (error) {
    console.error('Errore lettura JSON:', error);
    res.status(500).send('Errore nella lettura del file JSON.');
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server avviato su http://localhost:${PORT}`);
});
