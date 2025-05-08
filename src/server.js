import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { renderUtility } from './renderUtility.js';
import { movimentiService } from './services/movimentiService.js';
import { accantonamentiService } from './services/accantonamentiService.js';
import { sottocategorieService } from './services/sottocategorieService.js';
import { contiService } from './services/contiService.js';

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
    const conti = contiService.getConti();

    res.render('index', { conti });
  } catch (error) {
    console.error('❌ Errore nel calcolo della situazione:', error);
    if (!res.headersSent) {
      res.status(500).send('Errore interno del server');
    }
  }
 
});

app.get('/:conto/situazione-attuale', async (req, res) => {
  try {
    const conto = req.params.conto;
    const data = await renderUtility.calcolaSituazione(conto);
    const accantonamenti = await accantonamentiService.getAccantonamenti(conto);
    const sottocategorie = await sottocategorieService.getSottocategorie(conto);

    res.render('situazione-attuale', { data, accantonamenti, sottocategorie, conto });
  } catch (error) {
    console.error('❌ Errore nel calcolo della situazione:', error);
    if (!res.headersSent) {
      res.status(500).send('Errore interno del server');
    }
  }
});

app.post('/:conto/aggiungi-spesa', async (req, res) => {
  try {
    const conto = req.params.conto;
    await movimentiService.addSpese(conto, req.body.spese);
    res.status(200).send('OK');
  } catch (err) {
    console.error('❌ Errore salvataggio spese:', err.message);
    res.status(500).send('Errore durante il salvataggio');
  }
});


app.post('/:conto/aggiungi-accantonamenti', async (req, res) => {
  try {
    const conto = req.params.conto;
    await movimentiService.addEntrate(conto, req.body);
    res.status(200).send('OK');
  } catch (err) {
    console.error('❌ Errore accantonamento:', err.message);
    res.status(500).send('Errore durante il salvataggio');
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server avviato su http://localhost:${PORT}`);
});
