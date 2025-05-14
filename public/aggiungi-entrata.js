const btnEntrata = document.getElementById('btn-apri-dialog-entrata');
const dialogEntrata = document.getElementById('dialog-entrata');

btnEntrata?.addEventListener('click', () => dialogEntrata.showModal());
document.getElementById('btn-chiudi-dialog-entrata')?.addEventListener('click', () => dialogEntrata.close());

const formEntrata = document.getElementById('form-entrata');
const inputs = document.querySelectorAll('.importo_da_accantonare');
const totaleNonAccantonato = document.getElementById('totale_non_accantonato');
const importoInput = document.getElementById('importo');

inputs?.forEach(input => {
  input.addEventListener('change', () => {
    updateTotaleNonAccantonato(); 
  });
});

importoInput?.addEventListener('change', () => {
  updateTotaleNonAccantonato(); 
});

updateTotaleNonAccantonato();

formEntrata?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = formEntrata.data_movimento.value;
  const importo = parseFloat(formEntrata.importo.value);
  const descrizione = formEntrata.descrizione.value;

  if (!data || isNaN(importo) || !descrizione) return;

  try {
    const res = await fetch('/' + window.__CONTO__ + '/movimenti', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
          data: data,
          importo: importo,
          categoria: null,
          sottocategoria: null,
          descrizione: "Stipendio (" + descrizione + ")"
        })
    });

    if (res.ok) {

      const daAccantonare = document.querySelectorAll('.importo_da_accantonare');
      daAccantonare.forEach(async a => {
        //TODO salvare accantonamenti
        console.log("## ", a);
        const res = await fetch('/' + window.__CONTO__ + '/accantonamenti', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              data: data,
              importo: a.value,
              salvadanaioId: a.name,
              descrizione: "Accantonamento da stipendio (" + descrizione + ")"
            })
        });
    
        if (res.ok) {
          location.reload();
        } else {
          alert('Errore durante il salvataggio');
        }
      });
      
    } else {
      alert('Errore durante il salvataggio');
    }
  } catch (err) {
    console.error(err);
    alert('Errore durante la richiesta');
  }
  
  dialogEntrata.close();
});

//Utility

function updateTotaleNonAccantonato() {
  const val = (importoInput.value? parseFloat(importoInput.value) : 0) - getTotaleAccantonato();
  totaleNonAccantonato.innerHTML = val;
  const formEntrataSaveBtn = document.getElementById('form-entrata_save_btn');
  if (val < 0) {
    formEntrataSaveBtn.disabled = true;
    totaleNonAccantonato.className = 'red-text';
  } else {
    formEntrataSaveBtn.disabled = false;
    totaleNonAccantonato.className = 'black-text';
  }
}

function getTotaleAccantonato() {
  let totaleAccantonatoValue = 0;
  inputs?.forEach(input => {
    totaleAccantonatoValue += parseFloat(input.value);
  });
  return totaleAccantonatoValue;
}