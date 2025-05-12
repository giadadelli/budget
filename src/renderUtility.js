import dotenv from 'dotenv';
import { movimentiService } from './services/movimentiService.js';
import { risparmiService } from './services/risparmiService.js';

dotenv.config();

async function calcolaSituazione(conto) {
  
  const saldo = await Promise.resolve(movimentiService.getSaldo(conto));
  if (saldo == 0) {
    return {
      saldo
    };
  } else {

    const risparmi = await Promise.resolve(risparmiService.getRisparmiTotale(conto));
    const avanzo = saldo - risparmi;
    
    return {
      saldo,
      avanzo
    };
  }
}

export const renderUtility = {
  calcolaSituazione
};
