const btnSalvadanaio = document.getElementById('btn-apri-dialog-salvadanaio');
const dialogSalvadanaio = document.getElementById('dialog-crea-salvadanaio');

btnSalvadanaio?.addEventListener('click', () => {
  initFormSalvadanaio();
  dialogSalvadanaio.showModal();
});
document.getElementById('btn-chiudi-dialog-salvadanaio')?.addEventListener('click', () => dialogSalvadanaio.close());

const titolo = document.getElementById('titolo');
const obiettivo = document.getElementById('obiettivo');
const iniziale = document.getElementById('iniziale');

document.getElementById('form-salvadanaio').addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('/' + window.__CONTO__ + '/salvadanai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "titolo": titolo.value,
            "obiettivo": obiettivo.value,
            "iniziale": iniziale.value
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

function initFormSalvadanaio() {
  titolo.value = null;
  obiettivo.value = null;
  iniziale.value = null;
}