document.getElementById('btn-apri-dialog').addEventListener('click', () => {
    document.getElementById('dialog-spesa').showModal();
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
  