import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { renderUtility } from './renderUtility.js';
import { movimentiService } from './services/movimentiService.js';
import { accantonamentiService } from './services/accantonamentiService.js';
import { sottocategorieService } from './services/sottocategorieService.js';

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
    const data = await renderUtility.calcolaSituazione();
    const accantonamenti = await accantonamentiService.getAccantonamenti();
    const sottocategorie = await sottocategorieService.getSottocategorie();

    res.render('index', { data, accantonamenti, sottocategorie });
  } catch (error) {
    console.error('❌ Errore nel calcolo della situazione:', error);
    if (!res.headersSent) {
      res.status(500).send('Errore interno del server');
    }
  }
});



app.post('/aggiungi-spesa', async (req, res) => {
  try {
    await movimentiService.addSpese(req.body.spese);
    res.status(200).send('OK');
  } catch (err) {
    console.error('❌ Errore salvataggio spese:', err.message);
    res.status(500).send('Errore durante il salvataggio');
  }
});


app.post('/aggiungi-accantonamenti', async (req, res) => {
  try {
    await movimentiService.addEntrate(req.body);
    res.status(200).send('OK');
  } catch (err) {
    console.error('❌ Errore accantonamento:', err.message);
    res.status(500).send('Errore durante il salvataggio');
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server avviato su http://localhost:${PORT}`);
});
