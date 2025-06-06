import { movimentiService } from './movimentiService.js';
import { risparmiService } from './risparmiService.js';
import { dateUtility } from './util/dateUtils.js';

async function getRisparmiSpesi(conto) {
    //somma di tutti gli accantonamenti negativi
    const movimenti = await Promise.resolve(risparmiService.getMovimenti(conto));
    return movimenti
    .filter(currentValue => currentValue.amount < 0)
    .reduce(
        (accumulator, currentValue) => accumulator + Math.abs(currentValue.amount),
        0,
    );
}

async function getRisparmi(conto) {
    //somma di tutti gli accantonamenti positivi
    const movimenti = await Promise.resolve(risparmiService.getMovimenti(conto));
    return movimenti
    .filter(currentValue => currentValue.amount > 0)
    .reduce(
        (accumulator, currentValue) => accumulator + currentValue.amount,
        0,
    );
}

async function getSaldo(conto) {
    //somma di tutti i movimenti - risparmiSpesi
    const movimenti = await Promise.resolve(movimentiService.getSaldo(conto));
    const risparmiSpesi = await Promise.resolve(sommarioService.getRisparmiSpesi(conto));

    return movimenti - risparmiSpesi;
}

async function getDisponibilita(conto) {
    //somma di tutti i movimenti - Risparmi
    const movimenti = await Promise.resolve(movimentiService.getSaldo(conto));
    const risparmi = await Promise.resolve(sommarioService.getRisparmi(conto));

    return movimenti - risparmi;
}

async function getAllMovimentiOrderByData(conto) {
    let result = [];
    const movements = await Promise.resolve(movimentiService.getMovimenti(conto));
    result.push(...movements);

    const speseDaRisparmi = await Promise.resolve(risparmiService.getSpese(conto));
    result.push(...speseDaRisparmi);
    result.sort((a, b) => dateUtility.compare(a.date, b.date));

    return result;
}

async function getUltimoAggiornamento(conto) {
    const result = await Promise.resolve(sommarioService.getAllMovimentiOrderByData(conto));

    return result.length > 0 ? result[0].date : null;
}

async function getUltimaSpesa(conto) {
    const all = await Promise.resolve(sommarioService.getAllMovimentiOrderByData(conto));
    const spese = all.filter(r => r.amount < 0);
    return spese.length > 0 ? spese[0].date : null;
}

export const sommarioService = {
    getRisparmiSpesi,
    getRisparmi,
    getSaldo,
    getDisponibilita,
    getAllMovimentiOrderByData,
    getUltimoAggiornamento,
    getUltimaSpesa
};
