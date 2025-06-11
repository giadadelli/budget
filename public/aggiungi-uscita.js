const btnUscita = document.getElementById("btn-apri-dialog-uscita");
const dialogUscita = document.getElementById('dialog-uscita');
const formUscita = document.getElementById('form-uscita');

const rowsContainer = document.getElementById("rows-container");
const aggiungiUscitaRiga = document.getElementById("aggiungi-uscita-riga");
aggiungiUscitaRiga?.addEventListener('click', () => createNewLine());

btnUscita?.addEventListener('click', () => {
  initFormUscite();
  dialogUscita.showModal();
});
document.getElementById('btn-chiudi-dialog-uscita')?.addEventListener('click', () => dialogUscita.close());

formUscita?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const tot = [...rowsContainer.querySelectorAll('.riga-spesa')].length;
  let totOk = 0;
  let totKo = 0;
  
  const spese = [...rowsContainer.querySelectorAll('.riga-spesa')].map(async wrapper => {
    const data = wrapper.querySelector('input[name="data_movimento"]').value;
    const importo = parseFloat(wrapper.querySelector('input[name="importo-uscita"]').value);
    const descrizione = wrapper.querySelector('input[name="descrizione"]').value;
    const salvadanaio = wrapper.querySelector('select[name="salvadanaio"]').value;
    
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
        totOk++;
        if ((totOk + totKo) == tot) {
          dialogEntrata.close();
          location.reload();
        }
      } else {
        totOk++;
        if ((totOk + totKo) == tot) {
          dialogEntrata.close();
          alert('ERRORE: Alcune spese non sono state salvate');
        }
      }
    } catch (err) {
      console.error(err);
      alert('Errore durante la richiesta');
    }
    
  });
  
});

function initFormUscite() {
  document.getElementById('rows-container').innerHTML = null;
  createNewLine();

}

//Utility
function createNewLine() {
  const wrapper = document.createElement('div');
  wrapper.className = "row riga-spesa";//'riga-spesa flex flex-row gap-2 items-end border-b pb-4 flex-wrap';

  const id = crypto.randomUUID(); // id univoco per gestire le select

  wrapper.innerHTML = `
   
    <div class="input-field col">
      <input type="text" class="datepicker" name="data_movimento" id="datepicker-${id}" class="validate" required>
      <label>Data</label>
    </div>
    <div class="input-field col">
      <input type="number" class="validate" step="0.01" class="importo" name="importo-uscita" id="importo-${id}" class="validate" required placeholder="10">
      <label for="importo-${id}">Importo</label>
    </div>
    <div class="input-field col">
      <input type="text" class="validate" name="descrizione" id="descrizione-${id}" placeholder="Es. Bar">
      <label for="descrizione-${id}">Descrizione</label>
    </div>

    
    <div class="input-field col">
      <select name="salvadanaio" data-id="${id}" >
        <option value="" selected>Nessun salvadanaio</option>
        ${window.__SALVADANAI__.sort(
          (p1, p2) => (p1.name < p2.name) ? -1 : (p1.name > p2.name) ? 1 : 0)
          .map(c => `<option value="${c.id}">${c.name}</option>`)
          .join('')}
      </select>
    </div>
   
    
    
  `;
  if (rowsContainer.querySelectorAll('.riga-spesa').length > 0) {
    wrapper.innerHTML += ` <div class="input-field col">
        <a id="btn-rimuovi-spesa" class="waves-effect waves-light btn red"><i class="material-icons">delete</i></a>
    </div>`
  }
  
  wrapper.querySelector('#btn-rimuovi-spesa')?.addEventListener('click', () => {
    wrapper.remove();
  });
  wrapper.querySelector('#importo-' + id).addEventListener('change', () => {
    let sum = window.__DATA__.saldo;
    document.getElementsByName('importo-uscita').forEach(el => {
      sum -= el.value;
    });
    document.getElementById('saldo-real-time').innerHTML = sum;
  });

  rowsContainer.appendChild(wrapper);

  M.FormSelect.init(document.querySelectorAll('select'), {});
  
  M.Datepicker.init(document.getElementById('datepicker-' + id), {"autoClose": true, "format": "yyyy-mm-dd"});

}
