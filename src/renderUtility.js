import dotenv from 'dotenv';
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
    const ultimoAggiornamento = await Promise.resolve(sommarioService.getUltimoAggiornamento(conto));
    const ultimaSpesa = await Promise.resolve(sommarioService.getUltimaSpesa(conto));
    return {
      saldo,
      avanzo,
      infoConto,
      ultimoAggiornamento,
      ultimaSpesa
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
  return sommarioService.getAllMovimentiOrderByData(conto);
}

export const renderUtility = {
  calcolaSituazione,
  calcolaSalvadanai,
  getMovimenti
};
