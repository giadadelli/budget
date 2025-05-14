import { movimentiService } from './movimentiService.js';
import { risparmiService } from './risparmiService.js';

async function getRisparmiSpesi(conto) {
    //somma di tutti gli accantonamenti negativi
    const movimenti = await Promise.resolve(risparmiService.getMovimenti(conto));
    return movimenti
    .filter(currentValue => currentValue.importo < 0)
    .reduce(
        (accumulator, currentValue) => accumulator + Math.abs(currentValue.importo),
        0,
    );
}

async function getRisparmi(conto) {
    //somma di tutti gli accantonamenti positivi
    const movimenti = await Promise.resolve(risparmiService.getMovimenti(conto));
    return movimenti
    .filter(currentValue => currentValue.importo > 0)
    .reduce(
        (accumulator, currentValue) => accumulator + currentValue.importo,
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

export const sommarioService = {
    getRisparmiSpesi,
    getRisparmi,
    getSaldo,
    getDisponibilita
};
