import dotenv from 'dotenv';
import { movimentiService } from './services/movimentiService.js';
import { accantonamentiService } from './services/accantonamentiService.js';


dotenv.config();

async function calcolaSituazione(conto) {
  const [accantonamenti, movimenti, saldo] = await Promise.all([
    accantonamentiService.getAccantonamenti(conto),
    movimentiService.getMovimenti(conto),
    movimentiService.getSaldo(conto)
  ]);

  const fondi = [];
  const buste = [];
  const sommePerCategoria = {};

  movimenti.forEach(mov => {
    const categoria = mov.categoria;
    if (!accantonamenti[categoria]) {
      //console.log(`⚠️ Categoria sconosciuta nel movimento: ${categoria}`);
      return;
    }

    sommePerCategoria[categoria] = (sommePerCategoria[categoria] || 0) + mov.importo;
  });

  for (const [categoria, info] of Object.entries(accantonamenti)) {
    const valore = sommePerCategoria[categoria] || 0;
  
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

export const renderUtility = {
  calcolaSituazione
};
