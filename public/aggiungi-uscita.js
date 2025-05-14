const btnUscita = document.getElementById("btn-apri-dialog-uscita");
const dialogUscita = document.getElementById('dialog-uscita');
const formUscita = document.getElementById('form-uscita');

btnUscita?.addEventListener('click', () => dialogUscita.showModal());
document.getElementById('btn-chiudi-dialog-uscita')?.addEventListener('click', () => dialogUscita.close());

formUscita?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = formUscita.data_movimento.value;
  const importo = parseFloat(formUscita.importo.value);
  const descrizione = formUscita.descrizione.value;
  const salvadanaio = formUscita.salvadanaio.value;

  if (!data || isNaN(importo) || !descrizione) return;

  let path = "/movimenti";
  let body = JSON.stringify({
    data: data,
    importo: -importo,
    categoria: null,
    sottocategoria: null,
    descrizione: descrizione
  });

  if (salvadanaio && salvadanaio.length > 0 ) {
    console.log("accantonamento negativo");
    path = "/accantonamenti";
    body = JSON.stringify({
      data: data,
      importo: -importo,
      salvadanaioId: salvadanaio,
      descrizione: descrizione
    })
  } else {
    console.log("movimento negativo");
  }

  try {
    const res = await fetch('/' + window.__CONTO__ + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body
    });

    if (res.ok) {
      location.reload();
    } else {
      alert('Errore durante il salvataggio');
    }
  } catch (err) {
    console.error(err);
    alert('Errore durante la richiesta');
  }
  
  dialogEntrata.close();
  
});

