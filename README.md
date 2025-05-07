Aggiungere nella root del progetto il file di configurazione .env con le seguenti variabili:

MOVIMENTI_PATH=path del file che contiene i movimenti (come fosse una tabella, viene aggiornato dall'applicazione)
SALDO_PATH=path del file che contiene il saldo (come fosse una tabella, viene aggiornato dall'applicazione)
ACCANTONAMENTI_PATH=path del file che contiene la configurazione degli accantonamenti
SOTTOCATEGORIE_PATH=path del file che contiene la configurazione delle sottocategorie (usato in fase di inserimento spesa per popolare la select sottocategoria qualora non si selezioni un fondo o busta esistente ma la voce "Altro")

Esempio di file movimenti.csv

data,importo,categoria,sottocategoria,descrizione,inserito
06-05-2025,1700,"emergenza",null,"iniziale",06-05-2025
06-05-2025,500,"salute",null,"iniziale",06-05-2025


Esempio di file saldo.csv

data,importo,inserito
01-06-2025,6000,01-05-2025


Esempio di file sottocategorie.json

{
    "sottocategorie": [
        {
            "chiave": "vestiti",
            "titolo": "Vestiti"
        }
    ]
}

Esempio di file accantonamenti.json
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