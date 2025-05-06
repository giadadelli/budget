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

app.listen(PORT, () => {
  console.log(`✅ Server avviato su http://localhost:${PORT}`);
});
