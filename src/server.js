import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { utility } from './utility.js';
import { salvaAccantonamenti } from './services/accantonamentoService.js';
import { salvaSpesa } from './services/spesaService.js';

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
  try {
    await salvaSpesa(req.body);
    res.status(200).send('OK');
  } catch (err) {
    console.error('❌ Errore salvataggio spesa:', err.message);
    res.status(500).send('Errore durante il salvataggio');
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
