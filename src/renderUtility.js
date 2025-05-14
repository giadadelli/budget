import dotenv from 'dotenv';
import { movimentiService } from './services/movimentiService.js';
import { risparmiService } from './services/risparmiService.js';
import { contiService } from './services/contiService.js';
import { sommarioService } from './services/sommarioService.js';

dotenv.config();

async function calcolaSituazione(conto) {
  const infoConto = contiService.getConto(conto);
  
  const saldo = await Promise.resolve(sommarioService.getSaldo(conto));
  if (saldo == 0) {
    return {
      saldo,
      infoConto
    };
  } else {
    const avanzo = await Promise.resolve(sommarioService.getDisponibilita(conto));
    
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

async function getMovimenti(conto) {
  let result = [];
  const movimenti = await Promise.resolve(movimentiService.getMovimenti(conto));
  result.push(...movimenti);

  const speseDaRisparmi = await Promise.resolve(risparmiService.getSpese(conto));
  result.push(...speseDaRisparmi);

  result.sort((a, b) => {
    const dateA = Date.parse(a.data);
    const dateB = Date.parse(b.data);
    if (dateA < dateB) {
      return 1;
    }
    if (dateA > dateB) {
      return -1;
    }
  
    // names must be equal
    return 0;
  });

  return result;
}

export const renderUtility = {
  calcolaSituazione,
  calcolaSalvadanai,
  getMovimenti
};
