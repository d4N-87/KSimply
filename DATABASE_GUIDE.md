# Guida all'Aggiunta di Dati al Database di KSimply

Questo documento è la guida ufficiale per aggiungere nuovi dati (GPU, Modelli AI) al sistema di KSimply. Seguire questa procedura garantisce la coerenza e l'integrità del nostro database.

## Filosofia della Gestione Dati

Il nostro sistema si basa su un principio fondamentale: la **Fonte di Verità sono i file CSV** che si trovano in `scripts/data/`. Il database SQLite (`ksimply.db`) è solo un artefatto generato da questi file.

**Il flusso di lavoro è sempre:**
1.  Modifica i file CSV.
2.  Esegui lo script `npm run db:seed` per ricostruire il database.

## Aggiungere Nuove GPU

1.  **Apri il file:** `scripts/data/gpus.csv`.
2.  **Aggiungi una nuova riga** per ogni GPU, rispettando le seguenti colonne:
    *   `name`: Il nome completo e standardizzato. **Guida di Stile:** `[Serie] [Modello] [VRAM]GB [Piattaforma]`. Esempi: `RTX 4070 Ti 12GB`, `RTX 3080 16GB Laptop`. Omettere "NVIDIA".
    *   `vram_gb`: La quantità di VRAM in Gigabyte (solo il numero).
    *   `family`: Una stringa per categorizzare la GPU. **Guida di Stile:** `[architettura]-[serie]-[piattaforma]`. Esempi: `rtx-40-desktop`, `rtx-30-pro-mobile`.
    *   `fp8_support` / `fp4_support`: Livello di supporto. Valori possibili: `native`, `software`, `none`.

## Aggiungere un Nuovo Modello AI (Procedura Completa)

Questa procedura in 3 passi garantisce che tutti i dati e le relazioni siano creati correttamente.

### Passo 1: Aggiungere le "Anagrafiche" (Definizioni Base)
Assicurati che i componenti base del modello esistano. Se sono nuovi, aggiungili ai rispettivi file:
*   `scripts/data/base_models.csv`: Aggiungi `name` e `type` (es. "Image Generation").
*   `scripts/data/text_encoders.csv`: Aggiungi il `name` del Text Encoder.
*   `scripts/data/vaes.csv`: Aggiungi il `name` del VAE.

### Passo 2: Aggiungere le "Releases" (Costi Reali)
Definisci le versioni specifiche di ogni componente con il loro peso reale.
*   `scripts/data/model_releases.csv`: Aggiungi una riga per ogni versione/quantizzazione del modello.
    *   `model_name`: Deve corrispondere **esattamente** al nome in `base_models.csv`.
    *   `quantization_name`: Deve corrispondere **esattamente** a un nome in `quantizations.csv`.
    *   `file_size_gb`: Il peso del file in Gigabyte.
*   Fai lo stesso per `text_encoder_releases.csv` e `vae_releases.csv`.
*   **Regola per i VAE:** Se non specificato, si assume che i VAE siano in formato FP16.

### Passo 3: Definire le Compatibilità
Collega i componenti tra loro.
*   `scripts/data/model_compatibilities.csv`: Aggiungi una riga per il nuovo modello.
    *   `model_name`: Deve corrispondere **esattamente** al nome in `base_models.csv`.
    *   `compatible_text_encoders`: Nomi dei Text Encoder compatibili, separati da `|` se multipli.
    *   `compatible_vaes`: Nomi dei VAE compatibili, separati da `|` se multipli.

#### Caso Speciale: Modelli "Tutto-in-Uno" (es. GGUF)
Se un modello include già il Text Encoder e/o il VAE, usa i seguenti nomi speciali nei campi di compatibilità: `(Included in Model)`.

## Sincronizzare il Database

Dopo ogni modifica ai file CSV, esegui questo comando per applicare le modifiche:

npm run db:seed


---


# KSimply Database - Data Entry Guide

This document is the official guide for adding new data (GPUs, AI Models) to the KSimply system. Following this procedure ensures the consistency and integrity of our database.

## Data Management Philosophy

Our system is built on a core principle: **the CSV files** located in `scripts/data/` **are the Single Source of Truth**. The SQLite database (`ksimply.db`) is merely an artifact generated from these files.

**The workflow is always:**
1.  Modify the CSV files.
2.  Run the `npm run db:seed` script to rebuild the database.

## Adding New GPUs

1.  **Open the file:** `scripts/data/gpus.csv`.
2.  **Add a new row** for each GPU, respecting the following columns:
    *   `name`: The full, standardized name. **Style Guide:** `[Series] [Model] [VRAM]GB [Platform]`. Examples: `RTX 4070 Ti 12GB`, `RTX 3080 16GB Laptop`. Omit "NVIDIA".
    *   `vram_gb`: The amount of VRAM in Gigabytes (number only).
    *   `family`: A string to categorize the GPU. **Style Guide:** `[architecture]-[series]-[platform]`. Examples: `rtx-40-desktop`, `rtx-30-pro-mobile`.
    *   `fp8_support` / `fp4_support`: The support level. Possible values: `native`, `software`, `none`.

## Adding a New AI Model (Full Procedure)

This 3-step procedure ensures all data and relationships are created correctly.

### Step 1: Add "Anagrafiche" (Base Definitions)
Ensure the model's base components exist. If they are new, add them to their respective files:
*   `scripts/data/base_models.csv`: Add the conceptual `name` and `type` (e.g., "Image Generation").
*   `scripts/data/text_encoders.csv`: Add the Text Encoder's `name`.
*   `scripts/data/vaes.csv`: Add the VAE's `name`.

### Step 2: Add "Releases" (Real Costs)
Define the specific versions of each component with their real file size.
*   `scripts/data/model_releases.csv`: Add a row for each version/quantization of the model.
    *   `model_name`: Must **exactly** match a name in `base_models.csv`.
    *   `quantization_name`: Must **exactly** match a name in `quantizations.csv`.
    *   `file_size_gb`: The file size in Gigabytes.
*   Do the same for `text_encoder_releases.csv` and `vae_releases.csv`.
*   **Rule for VAEs:** If not specified, VAEs are assumed to be in FP16 format.

### Step 3: Define Compatibilities
Connect the components together.
*   `scripts/data/model_compatibilities.csv`: Add a row for the new model.
    *   `model_name`: Must **exactly** match a name in `base_models.csv`.
    *   `compatible_text_encoders`: Names of compatible Text Encoders, separated by `|` if there are multiple.
    *   `compatible_vaes`: Names of compatible VAEs, separated by `|` if there are multiple.

#### Special Case: All-in-One Models (e.g., GGUF)
If a model already includes the Text Encoder and/or VAE, use the following special names in the compatibility fields: `(Included in Model)`.

## Syncing the Database

After any change to the CSV files, run this command to apply the changes:

npm run db:seed