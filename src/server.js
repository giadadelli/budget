import express from 'express';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const movimentiPath = path.resolve(__dirname, '..', process.env.MOVIMENTI_PATH);
const accantonamentiPath = path.resolve(__dirname, '..', process.env.ACCANTONAMENTI_PATH);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.resolve(__dirname, '..', 'public')));
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, '..', 'views'));

function leggiAccantonamenti() {
  const raw = fs.readFileSync(accantonamentiPath);
  return JSON.parse(raw);
}

function leggiMovimenti() {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(movimentiPath)
      .pipe(csv())
      .on('data', (data) => {
        // conversione robusta
        const importo = parseFloat(data.importo);
        if (!isNaN(importo)) {
          results.push({
            ...data,
            importo
          });
        }
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

app.get('/', async (req, res) => {
  try {
    const accantonamenti = leggiAccantonamenti();
    const movimenti = await leggiMovimenti();

    const fondi = [];
    const buste = [];
    let saldo = 0;

    const sommePerCategoria = {};

    let valoreAvanzoEsplicito = 0;

    movimenti.forEach(mov => {
      const categoria = mov.categoria;
      if (categoria == 'avanzo') {
        valoreAvanzoEsplicito += mov.importo;
        saldo += mov.importo;
        return;
      }
    
      if (!accantonamenti[categoria]) {
        console.log(`⚠️ Categoria sconosciuta nel movimento: ${categoria}`);
        return;
      }
    
      saldo += mov.importo;
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

    res.render('index', {
      data: {
        saldo,
        fondi,
        buste,
        avanzo
      }
    });
  } catch (error) {
    console.error('❌ Errore:', error);
    res.status(500).send('Errore nel calcolo dei dati.');
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server avviato su http://localhost:${PORT}`);
});
