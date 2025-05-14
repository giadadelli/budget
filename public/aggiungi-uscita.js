const btnUscita = document.getElementById("btn-apri-dialog-uscita");
const dialogUscita = document.getElementById('dialog-uscita');

btnUscita?.addEventListener('click', () => dialogUscita.showModal());
document.getElementById('btn-chiudi-dialog-uscita')?.addEventListener('click', () => dialogUscita.close());



