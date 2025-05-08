const sottocategorie = window.__SOTTOCATEGORIE__ || [];

const selectCategoria = document.querySelector('select[name="categoria"]');
const selectSottocategoria = document.querySelector('select[name="sottocategoria"]');
const sottocategoriaWrapper = document.getElementById('sottocategoria-wrapper');

const speseContainer = document.getElementById('spese-container');
const btnAggiungiRiga = document.getElementById('aggiungi-riga-spesa');

selectCategoria?.addEventListener('change', () => {
  if (selectCategoria.value === 'altro') {
    sottocategoriaWrapper.style.visibility = 'visible';
    sottocategoriaWrapper.style.position = 'static';
    selectSottocategoria.innerHTML = sottocategorie
      .map(s => `<option value="${s.chiave}">${s.titolo}</option>`)
      .join('');
  } else {
    sottocategoriaWrapper.style.visibility = 'hidden';
    sottocategoriaWrapper.style.position = 'absolute';
    selectSottocategoria.innerHTML = '';
  }
});


document.getElementById('btn-apri-dialog').addEventListener('click', () => {
  speseContainer.innerHTML = ''; // reset
  creaRigaSpesa(); // prima riga
  document.getElementById('dialog-spesa').showModal();
});

btnAggiungiRiga.addEventListener('click', () => creaRigaSpesa());

  
document.getElementById('btn-chiudi-dialog').addEventListener('click', () => {
  document.getElementById('dialog-spesa').close();
});

document.getElementById('form-spesa').addEventListener('submit', async (e) => {
  e.preventDefault();

  const spese = [...speseContainer.querySelectorAll('.riga-spesa')].map(wrapper => {
    const data = wrapper.querySelector('input[name="data"]').value;
    const importo = parseFloat(wrapper.querySelector('input[name="importo"]').value);
    const categoria = wrapper.querySelector('select[name="categoria"]').value;
    const descrizione = wrapper.querySelector('input[name="descrizione"]').value;
    const sottocategoriaEl = wrapper.querySelector('select[name="sottocategoria"]');
    const sottocategoria = categoria === 'altro' ? sottocategoriaEl.value : null;

    return { data, importo, categoria, descrizione, sottocategoria };
  });

  try {
    const res = await fetch('/' + window.__CONTO__ + '/aggiungi-spesa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spese })
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


const btnEntrata = document.getElementById('btn-apri-dialog-entrata');
const dialogEntrata = document.getElementById('dialog-entrata');
const dialogSmistamento = document.getElementById('dialog-smistamento');
const formEntrata = document.getElementById('form-entrata');
const smistamentoFondiBody = document.getElementById('smistamento-fondi-body');
const smistamentoBusteBody = document.getElementById('smistamento-buste-body');
const nonAccantonatoOutput = document.getElementById('non-accantonato');
const btnChiudiSmistamento = document.getElementById('btn-chiudi-smistamento');

btnEntrata?.addEventListener('click', () => dialogEntrata.showModal());
document.getElementById('btn-chiudi-dialog-entrata')?.addEventListener('click', () => dialogEntrata.close());
btnChiudiSmistamento?.addEventListener('click', () => dialogSmistamento.close());

formEntrata?.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = formEntrata.data.value;
  const importo = parseFloat(formEntrata.importo.value);
  const descrizione = formEntrata.descrizione.value;

  if (!data || isNaN(importo) || !descrizione) return;

  generaDialogSmistamento(importo);
  dialogEntrata.close();
  dialogSmistamento.showModal();
});

document.getElementById('btn-salva-smistamento')?.addEventListener('click', async () => {
  const data = formEntrata.data.value;
  const descrizioneBase = formEntrata.descrizione.value;

  const inputs = document.querySelectorAll('.input-smistamento');
  const righe = [];

  inputs.forEach(input => {
    const valore = parseFloat(input.value);
    if (!isNaN(valore) && valore > 0) {
      righe.push({
        data,
        importo: valore,
        categoria: input.dataset.nome,
        descrizione: `Accantonamento da ${descrizioneBase}`
      });
    }
  });

  const disponibile = document.getElementById('non-accantonato');
  righe.push({
    data,
    importo: parseFloat(disponibile.value),
    categoria: null,
    descrizione: `Residuo dopo accantonamento da ${descrizioneBase}`
  });

  if (righe.length === 0) {
    alert('Nessun importo accantonato');
    return;
  }

  try {
    const res = await fetch("/" + window.__CONTO__ + '/aggiungi-accantonamenti', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        movimenti: righe,
        incremento: parseFloat(formEntrata.importo.value),
        data: formEntrata.data.value
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


function generaDialogSmistamento(importoTotale) {
  smistamentoFondiBody.innerHTML = "";
  
  const acc = window.__ACC__;
  const categorie = Object.entries(acc).map(([nome, info]) => ({
    nome,
    ...info
  }));

  let somma = 0;

  //FONDO
  const fondoContainer = document.createElement('div');
  fondoContainer.className = "row";
  smistamentoFondiBody.appendChild(fondoContainer);
  categorie.filter((cat) => cat.tipo === 'fondo').forEach((cat, idx) => {
    const id = `input-${idx}`;

    let valoreDefault = 0;
    
    const attuale = window.__DATA__.attuali?.[cat.nome] ?? 0;

    if (cat.frequenza === 'mensile') {
      valoreDefault = attuale >= cat.obiettivo ? 0 : cat.importo;
    }

    somma += valoreDefault;

    let label = cat.titolo + ` (${attuale}/${cat.obiettivo})`;
    const colore = attuale >= cat.obiettivo ? 'green' : (cat.tipo === 'fondo' ? 'red' : 'inherit');

    const col = document.createElement('div');
    col.className = "col";
    col.innerHTML = `
      <p style="color: ${colore}">${label}</p>
      <input type="number" value="${valoreDefault}" step="1" class="input-smistamento text-right border px-1 rounded" data-nome="${cat.nome}" />
    `;
    fondoContainer.appendChild(col);
  });

  
  //BUSTA
  const bustaContainer = document.createElement('div');
  bustaContainer.className = "row";
  smistamentoBusteBody.appendChild(bustaContainer);
  categorie.filter((cat) => cat.tipo === 'busta').forEach((cat, idx) => {
    const id = `input-${idx}`;

    let valoreDefault = cat.frequenza === 'mensile' ? cat.importo : 0;
    
    const attuale = window.__DATA__.attuali?.[cat.nome] ?? 0;

    somma += valoreDefault;

    let label = cat.titolo;

    const col = document.createElement('div');//<div class="col s1">1</div>
    col.className = "col";
    col.innerHTML = `
      <p>${label}</p>
      <input type="number" value="${valoreDefault}" step="1" class="input-smistamento text-right border px-1 rounded" data-nome="${cat.nome}" />
    `;
    bustaContainer.appendChild(col);
  });

  aggiornaNonAccantonato(importoTotale);

  document.querySelectorAll('.input-smistamento').forEach(input => {
    input.addEventListener('input', () => aggiornaNonAccantonato(importoTotale));
  });
}

function aggiornaNonAccantonato(importoTotale) {
  const inputs = document.querySelectorAll('.input-smistamento');
  let totaleAccantonato = 0;

  inputs.forEach(input => {
    const val = parseFloat(input.value);
    if (!isNaN(val)) totaleAccantonato += val;
  });

  const resto = importoTotale - totaleAccantonato;
  nonAccantonatoOutput.value = resto;
}

function creaRigaSpesa(defaultCategoria = 'altro') {
  const wrapper = document.createElement('div');
  wrapper.className = "row riga-spesa";//'riga-spesa flex flex-row gap-2 items-end border-b pb-4 flex-wrap';

  const id = crypto.randomUUID(); // id univoco per gestire le select

  wrapper.innerHTML = `
   
    <div class="input-field col">
      <input type="text" name="data" class="datepicker">
      <label>Data</label>
    </div>
  

    <div class="input-field col">
      <input type="number" name="importo" step="0.01" required class="border p-1 rounded w-full" />
      <label>Importo</label>
    </div>

    
    <div class="input-field col">
      <select name="categoria" data-id="${id}" required class="border p-1 rounded w-full">
        ${[...window.__DATA__.fondi, ...window.__DATA__.buste]
          .map(c => `<option value="${c.nome}">${c.titolo}</option>`)
          .join('')}
        <option value="altro"${defaultCategoria === 'altro' ? ' selected' : ''}>Altro</option>
      </select>
      <label>Categoria</label>
    </div>

    <div class="col input-field" style="visibility: hidden; position: absolute;" data-sottocategoria="${id}">
      <select name="sottocategoria" ></select>
    </div>

    <div class="input-field col">
      <input type="text" name="descrizione" required class="border p-1 rounded w-full" />
      <label>Descrizione</label>
    </div>
    <a id="btn-rimuovi-spesa" class="waves-effect waves-light btn red"><i class="material-icons">delete</i></a>
    
  `;

  wrapper.querySelector('#btn-rimuovi-spesa')?.addEventListener('click', () => {
    wrapper.remove();
  });


  speseContainer.appendChild(wrapper);

  M.FormSelect.init(document.querySelectorAll('select'), {});
  M.Datepicker.init(document.querySelectorAll('.datepicker'), {"autoClose": true, "format": "dd-mm-yyyy"});

  const categoriaSelect = wrapper.querySelector(`select[name="categoria"]`);
  const sottocategoriaWrapper = wrapper.querySelector(`[data-sottocategoria="${id}"]`);
  const sottocategoriaSelect = sottocategoriaWrapper.querySelector('select');

  function aggiornaSottocategoria() {
    if (categoriaSelect.value === 'altro') {
      sottocategoriaWrapper.style.visibility = 'visible';
      sottocategoriaWrapper.style.position = 'static';
      sottocategoriaSelect.innerHTML = window.__SOTTOCATEGORIE__
        .map(s => `<option value="${s.chiave}">${s.titolo}</option>`)
        .join('');
    } else {
      sottocategoriaWrapper.style.visibility = 'hidden';
      sottocategoriaWrapper.style.position = 'absolute';
      sottocategoriaSelect.innerHTML = '';
    }
  }

  categoriaSelect.addEventListener('change', aggiornaSottocategoria);
  aggiornaSottocategoria(); // iniziale
}
