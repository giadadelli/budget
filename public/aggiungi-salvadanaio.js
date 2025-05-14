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