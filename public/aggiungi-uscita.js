const btnUscita = document.getElementById("btn-apri-dialog-uscita");
const dialogUscita = document.getElementById('dialog-uscita');
const formUscita = document.getElementById('form-uscita');

const rowsContainer = document.getElementById("rows-container");
createNewLine();
const aggiungiUscitaRiga = document.getElementById("aggiungi-uscita-riga");
aggiungiUscitaRiga?.addEventListener('click', () => createNewLine());

btnUscita?.addEventListener('click', () => dialogUscita.showModal());
document.getElementById('btn-chiudi-dialog-uscita')?.addEventListener('click', () => dialogUscita.close());

formUscita?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const tot = [...rowsContainer.querySelectorAll('.riga-spesa')].length;
  let totOk = 0;
  let totKo = 0;
  console.log("### ", [...rowsContainer.querySelectorAll('.riga-spesa')]);
  const spese = [...rowsContainer.querySelectorAll('.riga-spesa')].map(async wrapper => {
    const data = wrapper.querySelector('input[name="data_movimento"]').value;
    const importo = parseFloat(wrapper.querySelector('input[name="importo"]').value);
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

//Utility
function createNewLine() {
  const wrapper = document.createElement('div');
  wrapper.className = "row riga-spesa";//'riga-spesa flex flex-row gap-2 items-end border-b pb-4 flex-wrap';

  const id = crypto.randomUUID(); // id univoco per gestire le select

  wrapper.innerHTML = `
   
    <div class="input-field col">
      <input type="text" class="datepicker" name="data_movimento">
      <label>Data</label>
    </div>
    <div class="input-field col">
      <input type="number" class="validate" name="importo">
      <label>Importo</label>
    </div>
    <div class="input-field col">
      <input type="text" class="validate" name="descrizione">
      <label>Descrizione</label>
    </div>

    
    <div class="input-field col">
      <div>Seleziona il salvadanaio se vuoi che i soldi vengano prelevati da qui e non dalla tua disponibilità</div>
      <select name="salvadanaio" data-id="${id}">
        <option value="" selected>Nessun salvadanaio</option>
        ${window.__SALVADANAI__
          .map(c => `<option value="${c.id}">${c.titolo}</option>`)
          .join('')}
      </select>
    </div>
    <a id="btn-rimuovi-spesa" class="waves-effect waves-light btn red"><i class="material-icons">delete</i></a>
    
  `;

  wrapper.querySelector('#btn-rimuovi-spesa')?.addEventListener('click', () => {
    wrapper.remove();
  });

  rowsContainer.appendChild(wrapper);

  M.FormSelect.init(document.querySelectorAll('select'), {});
  M.Datepicker.init(document.querySelectorAll('.datepicker'), {"autoClose": true, "format": "dd-mm-yyyy"});

}
