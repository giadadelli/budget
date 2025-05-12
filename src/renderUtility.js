import dotenv from 'dotenv';
import { movimentiService } from './services/movimentiService.js';

dotenv.config();

async function calcolaSituazione(conto) {
  const saldo = await Promise.resolve(movimentiService.getSaldo(conto));
  if (saldo == 0) {
    return {
      saldo
    };
  } else {

    const [movimenti] = await Promise.all([
      movimentiService.getMovimenti(conto)
    ]);
  
   
    const avanzo = 0;// TODO saldo - totaleFondi - totaleBuste;
  
    return {
      saldo,
      avanzo
    };
  }
}

export const renderUtility = {
  calcolaSituazione
};
