Per ogni conto che vuoi gestire, crea una cartella che rappresenta il DB del conto e configura i path di queste cartelle nella variabile 
CONTI=["path1", "path2"]
dentro il file .env nella root del progetto (da creare)


Nella cartella che rappresenta il DB aggingi il file info.json in questo modo:

{
    "key": "<chiave>",
    "titolo": "<Titolo>",
    "descrizione": "<descrizione>"
}
