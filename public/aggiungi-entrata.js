const btnEntrata = document.getElementById('btn-apri-dialog-entrata');
const dialogEntrata = document.getElementById('dialog-entrata');

btnEntrata?.addEventListener('click', () => dialogEntrata.showModal());
document.getElementById('btn-chiudi-dialog-entrata')?.addEventListener('click', () => dialogEntrata.close());

const formEntrata = document.getElementById('form-entrata');
const inputs = document.querySelectorAll('.importo_da_accantonare');
const totaleNonAccantonato = document.getElementById('totale_non_accantonato');
const importoInput = document.getElementById('importo');

inputs?.forEach(input => {
  input.value = 0;
  input.addEventListener('change', () => {
    updateTotaleNonAccantonato(); 
  });
});

const salvaDistribuzioneBtn = document.getElementById('salva-distribuzione');
const nomeDistribuzione = document.getElementById('nome-distribuzione');
nomeDistribuzione.hidden = !salvaDistribuzioneBtn.checked;
salvaDistribuzioneBtn?.addEventListener('change', () => {
  nomeDistribuzione.hidden = !salvaDistribuzioneBtn.checked;
});

const scegliDistribuzione = document.getElementById("scegli-distribuzione");
scegliDistribuzione?.addEventListener('change', () => {
  applicaDistribuzione();
});
applicaDistribuzione();


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
      //Salvo gli accantonamenti
      let error = false;
      let distribuzioni = [];
      const daAccantonare = document.querySelectorAll('.importo_da_accantonare');
      daAccantonare.forEach(async a => {

        if (parseFloat(a.value) > 0) {

          distribuzioni.push({
            salvadanaioId: a.name,
            importo: a.value
          });

          const res = await fetch('/' + window.__CONTO__ + '/accantonamenti', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                data: data,
                importo: a.value,
                salvadanaioId: a.name,
                descrizione: "Accantonamento da " + descrizione
              })
          });
      
          if (!res.ok) {
            error = true;
            alert('Errore durante il salvataggio');
          }
        }
      });

      //Salvo la distribuzione
      if (salvaDistribuzioneBtn.checked && nomeDistribuzione.value) {
        const res = await fetch('/' + window.__CONTO__ + '/distribuzioni', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              nome: nomeDistribuzione.value,
              distribuzioni: distribuzioni
            })
        });
      }


      if (!error) {
        location.reload();
      }
      
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
    totaleAccantonatoValue += input.value? parseFloat(input.value) : 0;
  });
  return totaleAccantonatoValue;
}

function applicaDistribuzione() {
  inputs?.forEach(input => {
    input.value = 0;
  });
  if (window.__DISTRIBUZIONI__[scegliDistribuzione.value]) {
    window.__DISTRIBUZIONI__[scegliDistribuzione.value].salvadanai.forEach(sd => {
      document.getElementById(sd.salvadanaioId).value = sd.importo;
    });
    salvaDistribuzioneBtn.disabled = true;
    salvaDistribuzioneBtn.checked = false;
    nomeDistribuzione.hidden = true;
  } else {
    salvaDistribuzioneBtn.disabled = false;
  }
}