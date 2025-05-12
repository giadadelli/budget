document.getElementById('saldo-iniziale').addEventListener('submit', async (e) => {
    e.preventDefault();
    //data,importo,categoria,sottocategoria,descrizione,inserito
    const today = new Date().toISOString().slice(0, 10);
   
    try {
      const res = await fetch('/' + window.__CONTO__ + '/movimenti', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            data: today,
            importo: document.getElementById('saldo').value,
            categoria: null,
            sottocategoria: null,
            descrizione: "Saldo iniziale"
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