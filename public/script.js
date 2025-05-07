const sottocategorie = window.__SOTTOCATEGORIE__ || [];

const selectCategoria = document.querySelector('select[name="categoria"]');
const selectSottocategoria = document.querySelector('select[name="sottocategoria"]');
const sottocategoriaWrapper = document.getElementById('sottocategoria-wrapper');

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
    document.getElementById('dialog-spesa').showModal();
    selectCategoria.value = 'altro';
    sottocategoriaWrapper.style.visibility = 'visible';
    sottocategoriaWrapper.style.position = 'static';
    selectSottocategoria.innerHTML = sottocategorie
      .map(s => `<option value="${s.chiave}">${s.titolo}</option>`)
      .join('');

  });
  
  document.getElementById('btn-chiudi-dialog').addEventListener('click', () => {
    document.getElementById('dialog-spesa').close();
  });
  
  document.getElementById('form-spesa').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const payload = {
      data: form.data.value,
      importo: parseFloat(form.importo.value),
      categoria: form.categoria.value,
      sottocategoria: form.categoria.value === 'altro' ? form.sottocategoria.value : null,
      descrizione: form.descrizione.value
    };
    
  
    try {
      const res = await fetch('/aggiungi-spesa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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
const smistamentoBody = document.getElementById('smistamento-body');
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

  if (righe.length === 0) {
    alert('Nessun importo accantonato');
    return;
  }

  try {
    const res = await fetch('/aggiungi-accantonamenti', {
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
  smistamentoBody.innerHTML = "";
  
  const acc = window.__ACC__;
  const categorie = Object.entries(acc).map(([nome, info]) => ({
    nome,
    ...info
  }));

  let somma = 0;

  categorie.forEach((cat, idx) => {
    const id = `input-${idx}`;

    let valoreDefault = 0;
    
    const attuale = window.__DATA__.attuali?.[cat.nome] ?? 0;

    if (cat.frequenza === 'mensile') {
      if (cat.tipo === 'fondo') {
        valoreDefault = attuale >= cat.obiettivo ? 0 : cat.importo;
      } else if (cat.tipo === 'busta') {
        valoreDefault = cat.importo;
      }
    }
    

    somma += valoreDefault;

    let label = cat.titolo;
    if (cat.tipo === 'fondo') {
      label += ` (${attuale}/${cat.obiettivo})`;
    }

    const colore = (cat.tipo === 'fondo' && attuale >= cat.obiettivo) ? 'green' : (cat.tipo === 'fondo' ? 'red' : 'inherit');

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="color: ${colore}">${label}</td>
      <td class="text-right">
        <input type="number" value="${valoreDefault}" step="0.01" class="input-smistamento text-right border px-1 rounded" data-nome="${cat.nome}" style="width: 80px" />
      </td>
    `;

    
    smistamentoBody.appendChild(tr);
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

  const resto = (importoTotale - totaleAccantonato).toFixed(2);
  nonAccantonatoOutput.textContent = `${resto} €`;
}
