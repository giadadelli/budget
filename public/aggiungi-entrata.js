//Variabili che servono a tutti
const importoInput = document.getElementById('importo');
const inputsImportiEsatti = document.querySelectorAll('.input-importi-esatti');
const inputsPercentuale = document.querySelectorAll('.input-percentuale');
const totaleNonAccantonato = document.getElementById('totale_non_accantonato');
const scegliDistribuzione = document.getElementById("scegli-distribuzione");
const salvaDistribuzioneBtn = document.getElementById('salva-distribuzione');
const nomeDistribuzione = document.getElementById('nome-distribuzione');
const tipoDistribuzione = document.getElementById('tipo-distribuzione');
const radios = document.querySelectorAll('input[type="radio"]');

//Gestione dialog
const btnEntrata = document.getElementById('btn-apri-dialog-entrata');
const dialogEntrata = document.getElementById('dialog-entrata');

btnEntrata?.addEventListener('click', () => {
  initForm();
  dialogEntrata.showModal();
});
document.getElementById('btn-chiudi-dialog-entrata')?.addEventListener('click', () => dialogEntrata.close());
//Fine gestione dialog


//Listener
scegliDistribuzione?.addEventListener('change', () => {
  applicaDistribuzione();
  updateTotaleNonAccantonato();
});

salvaDistribuzioneBtn?.addEventListener('change', () => {
  nomeDistribuzione.hidden = !salvaDistribuzioneBtn.checked;
  tipoDistribuzione.hidden = !salvaDistribuzioneBtn.checked;
});

inputsPercentuale?.forEach(input => {
  input.addEventListener('change', () => {
    updateImportiEsatti();
    updateTotaleNonAccantonato(); 
  });
});

inputsImportiEsatti?.forEach(input => {
  input.addEventListener('change', () => {
    updatePercentuali();
    updateTotaleNonAccantonato(); 
  });
});

importoInput?.addEventListener('change', () => {
  updateTotaleNonAccantonato(); 
  updatePercentuali();
});

radios.forEach(r => {
  r?.addEventListener('change', () => {
    radios.forEach(radio => {
      if (radio.checked) {
        const isPercentuale = radio.value == 'percentuale';
        inputsPercentuale.forEach(inputP => inputP.disabled = !isPercentuale);
        inputsImportiEsatti.forEach(input => input.disabled = isPercentuale);
      }
    });
  });
});

//Salva tutto
const formEntrata = document.getElementById('form-entrata');
formEntrata?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = formEntrata.data_movimento.value;
  const importo = parseFloat(formEntrata.importo.value);
  const descrizione = formEntrata.descrizione.value;

  if (!data || isNaN(importo)) return;

  try {
    const res = await fetch('/' + window.__CONTO__ + '/movimenti', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
          data: data,
          importo: importo,
          categoria: null,
          sottocategoria: null,
          descrizione: descrizione
        })
    });

    if (res.ok) {
      //Calcolo il tipo di distribuzione
      let tipoDistribuzione = "importi-esatti";
      radios?.forEach(radio => {
        if (radio.checked) {
          tipoDistribuzione = radio.value;
        }
      })
      
      //Salvo gli accantonamenti
      let error = false;
      let distribuzioni = [];
      const daAccantonare = document.querySelectorAll('.input-importi-esatti');
      for(let i=0; i<daAccantonare.length; i++) {
        let a = daAccantonare[i];

        if (parseFloat(a.value) > 0) {

          distribuzioni.push({
            salvadanaioId: a.name,
            importo: tipoDistribuzione == 'importi-esatti' ? a.value : document.getElementById(a.id + '-p').value
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
      }

      //Salvo la distribuzione
      if (salvaDistribuzioneBtn.checked && nomeDistribuzione.value) {
        
        const res = await fetch('/' + window.__CONTO__ + '/distribuzioni', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              nome: nomeDistribuzione.value,
              distribuzioni: distribuzioni,
              tipoDistribuzione: tipoDistribuzione
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

function initForm() {
  importoInput.value = 0;
  document.getElementById("descrizione_entrata").value = null;
  document.getElementById("data_entrata").value = null;
  salvaDistribuzioneBtn.checked = false;
  nomeDistribuzione.hidden = true;
  tipoDistribuzione.hidden = true;
  updateTotaleNonAccantonato();

  inputsImportiEsatti?.forEach(input => {
    input.value = 0;
  });
  inputsPercentuale?.forEach(input => {
    input.value = 0;
    input.disabled = true;
  });
  document.querySelectorAll('#scegli-distribuzione option').forEach(o => {
    o.selected = o.value === ""
  });
  document.querySelectorAll('input[value="importi-esatti"]')[0].checked = true
  updateTotaleNonAccantonato();
}

function updateTotaleNonAccantonato() {
  const val = ((importoInput.value? parseFloat(importoInput.value) : 0) - getTotaleAccantonato());

  totaleNonAccantonato.innerHTML = val;
  const formEntrataSaveBtn = document.getElementById('form-entrata_save_btn');
  if (val < 0) {
    formEntrataSaveBtn.disabled = true;
    totaleNonAccantonato.className = 'red-text';
  } else {
    formEntrataSaveBtn.disabled = false;
    totaleNonAccantonato.className = 'black-text';
  }

  let valP = 100;
  inputsPercentuale.forEach(i => {
    valP = valP - parseFloat(i.value)

  });
  document.getElementById('totale_non_accantonato_p').innerHTML = ' (' + valP + '%)';
}

function updateImportiEsatti() {
  inputsPercentuale?.forEach(input => {
    
    const p = importoInput.value * input.value / 100;
    document.getElementById(input.id.substring(0, input.id.indexOf('-p'))).value = p.toFixed(2);
  });
}

function updatePercentuali() {
  inputsImportiEsatti?.forEach(input => {
    const p = (parseFloat(input.value) * 100 / parseFloat(importoInput.value)).toFixed(2);
    document.getElementById(input.id + '-p').value = p;
  });
}

function getTotaleAccantonato() {
  let totaleAccantonatoValue = 0;
  inputsImportiEsatti?.forEach(input => {
    totaleAccantonatoValue += input.value? parseFloat(input.value) : 0;
  });
  return totaleAccantonatoValue;
}

function applicaDistribuzione() {
  if (scegliDistribuzione) {

    inputsImportiEsatti?.forEach(input => {
      input.value = 0;
    });
    inputsPercentuale?.forEach(input => {
      input.value = 0;
    });
    
    if (window.__DISTRIBUZIONI__.filter(d => d.id == scegliDistribuzione.value).length == 1) {
      const selected = window.__DISTRIBUZIONI__.filter(d => d.id == scegliDistribuzione.value)[0];
      if (selected.type == 'importi-esatti') {
        selected.moneyBoxAllocations.forEach(sd => {
          document.getElementById(sd.moneyBoxId).value = sd.amount;
          document.getElementById(sd.moneyBoxId + '-p').value = (sd.amount * 100 / parseFloat(importoInput.value)).toFixed(2);
        });
      } else {
        selected.moneyBoxAllocations.forEach(sd => {
          document.getElementById(sd.moneyBoxId).value = (importoInput.value * sd.amount / 100).toFixed(2);//TODO l'ultimo va calcolato come differenza
          document.getElementById(sd.moneyBoxId + '-p').value = sd.amount;
        });
      }
      salvaDistribuzioneBtn.disabled = true;
      salvaDistribuzioneBtn.checked = false;
      nomeDistribuzione.hidden = true;
      tipoDistribuzione.hidden = true;

    } else {
      salvaDistribuzioneBtn.disabled = false;
    }
  }
}