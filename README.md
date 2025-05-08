Per ogni conto che vuoi gestire, crea una cartella che rappresenta il DB del conto e configura i path di queste cartelle nella variabile 
CONTI=["path1", "path2"]
dentro il file .env nella root del progetto (da creare)

Nella cartella che rappresenta il DB aggingi 3 file:
- movimenti.csv
    che contiene:
    data,importo,categoria,sottocategoria,descrizione,inserito

- accantonamenti.json
    Gli accantonamenti possono essere di tipo fondo (che ha un obiettivo) o busta (che non ha un obiettivo) e la frequenza può essere mensile o annuale.
    Quando viene inserita un'entrata viene proposta dal sistema una suddivisione dei soldi tra fondi e buste, con questa logica:
    - per ogni fondo se non ha raggiunto l'obiettivo viene proposto un accantonamento pare al valore dell'importo se la frequenza è mensile, altrimenti 0
    - per ogni busta viene proposto un accantonamento pare al valore dell'importo se la frequenza è mensile, altrimenti 0

    {
        "salute": {
            "titolo": "Salute",
            "tipo": "fondo",
            "obiettivo": 500,
            "frequenza": "mensile",
            "importo": 100
        },
        "vacanze": {
            "titolo": "Vacanze",
            "tipo": "fondo",
            "obiettivo": 2400,
            "frequenza": "mensile",
            "importo": 300
        },
        "regali": {
            "titolo": "Regali",
            "tipo": "busta",
            "frequenza": "annuale",
            "importo": 1500
        },
        "spese-comuni": {
            "titolo": "Spese casa",
            "tipo": "busta",
            "frequenza": "mensile",
            "importo": 1300
        },
        "iliad": {
            "titolo": "Iliad",
            "tipo": "busta",
            "frequenza": "mensile",
            "importo": 8
        }
    }
    
- sottocategorie.json
    Usato in fase di inserimento spesa per popolare la select sottocategoria qualora non si selezioni un fondo o busta esistente ma la voce "Altro"
    Esempio di file sottocategorie.json

    {
        "sottocategorie": [
            {
                "chiave": "vestiti",
                "titolo": "Vestiti"
            }
        ]
    }
