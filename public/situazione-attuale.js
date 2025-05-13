//Nuovo salvadanaio
const btnSalvadanaio = document.getElementById('btn-apri-dialog-salvadanaio');
const dialogSalvadanaio = document.getElementById('dialog-crea-salvadanaio');

btnSalvadanaio?.addEventListener('click', () => dialogSalvadanaio.showModal());
document.getElementById('btn-chiudi-dialog-salvadanaio')?.addEventListener('click', () => dialogSalvadanaio.close());

document.getElementById('form-salvadanaio').addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('/' + window.__CONTO__ + '/salvadanai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "titolo": document.getElementById('titolo').value,
            "obiettivo": document.getElementById('obiettivo').value,
            "iniziale": document.getElementById('iniziale').value,
            "importo_ricorrente": document.getElementById('importo_ricorrente').value
        })
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
  });

// Nuova entrata
const btnEntrata = document.getElementById('btn-apri-dialog-entrata');
const dialogEntrata = document.getElementById('dialog-entrata');

btnEntrata?.addEventListener('click', () => dialogEntrata.showModal());
document.getElementById('btn-chiudi-dialog-entrata')?.addEventListener('click', () => dialogEntrata.close());

//TODO aggiungere controllo che non venga distribuito più dell'importo dell'entrata
const formEntrata = document.getElementById('form-entrata');
formEntrata?.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = formEntrata.data.value;
  const importo = parseFloat(formEntrata.importo.value);
  const descrizione = formEntrata.descrizione.value;

  if (!data || isNaN(importo) || !descrizione) return;

  //TODO salva
  
  dialogEntrata.close();
  dialogSmistamento.showModal();
});