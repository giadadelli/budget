import dotenv from 'dotenv';
import { movimentiService } from './services/movimentiService.js';
import { risparmiService } from './services/risparmiService.js';
import { contiService } from './services/contiService.js';

dotenv.config();

async function calcolaSituazione(conto) {
  const infoConto = contiService.getConto(conto);
  
  const saldo = await Promise.resolve(movimentiService.getSaldo(conto));
  if (saldo == 0) {
    return {
      saldo,
      infoConto
    };
  } else {

    const risparmi = await Promise.resolve(risparmiService.getAccantonatoTotale(conto));
    const avanzo = saldo - risparmi;
    
    return {
      saldo,
      avanzo,
      infoConto
    };
  }
}

function calcolaSalvadanai(salvadanai) {
  //mappa -> id: etichetta, valore: array di salvadanai
  let salvadanaiMap = {};
  salvadanai.forEach(sd => {
    if (sd.etichetta) {
      if (!salvadanaiMap[sd.etichetta]) {
        salvadanaiMap[sd.etichetta] = [];
      }
      salvadanaiMap[sd.etichetta].push(sd);
    } else {
      salvadanaiMap[sd.titolo] = [sd];
    }
  });

  return salvadanaiMap;
}

export const renderUtility = {
  calcolaSituazione,
  calcolaSalvadanai
};
