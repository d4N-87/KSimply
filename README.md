<div align="center">
  <img src="https://raw.githubusercontent.com/d4N-87/KSimply/main/static/logo.png" alt="KSimply Logo" width="200"/>
  <h1>KSimply v1.0</h1>
  <p><strong>🇮🇹 Un analizzatore di potenziale AI che consiglia modelli open source in base all'hardware dell'utente.</strong></p>
  <p><strong>🇬🇧 An AI Potential Analyzer that recommends open-source models based on user hardware.</strong></p>
</div>

<div align="center">

[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

</div>

<div align="center">

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fd4N-87%2FKSimply)

### ✨ [Prova la Demo Live! / Try the Live Demo!](https://ksimply.vercel.app/) ✨

</div>

---

## 🖼️ Anteprima / Preview

| 🇮🇹 Form di Input / 🇬🇧 Input Form | 🇮🇹 Analisi / 🇬🇧 Analyses | 🇮🇹 Filtri / 🇬🇧 Filters |
| :---: | :---: | :---: |
| <img src="https://raw.githubusercontent.com/d4N-87/KSimply/main/.github/assets/screenshot_01.png" alt="Schermata di input" width="100%"> | <img src="https://raw.githubusercontent.com/d4N-87/KSimply/main/.github/assets/screenshot_02.png" alt="Schermata dei risultati" width="100%"> | <img src="https://raw.githubusercontent.com/d4N-87/KSimply/main/.github/assets/screenshot_03.png" alt="Filtri e lista modelli" width="100%"> |

---

## 🚀 Cos'è KSimply? / What is KSimply?

🇮🇹 KSimply è un'applicazione web progettata per rispondere a una domanda semplice ma cruciale per chi si avvicina all'IA generativa: **"Quali modelli AI open source posso far girare sul mio PC?"**

L'utente inserisce la propria GPU e la quantità di RAM di sistema, e KSimply interroga un database curato di modelli AI per fornire una lista di raccomandazioni dettagliate.

🇬🇧 KSimply is a web application designed to answer a simple but crucial question for newcomers to generative AI: **"Which open-source AI models can I run on my PC?"**

The user inputs their GPU and system RAM, and KSimply queries a curated database of AI models to provide a list of detailed recommendations.

### 🧠 Il Motore di Analisi / The Analysis Engine

🇮🇹 A differenza di una semplice lista, il cuore di KSimply è un motore di analisi che simula il carico di memoria per ogni possibile "ricetta" di modello. Il calcolo è cucito su misura per la tua configurazione e considera **tutte le combinazioni possibili** tra:

*   **Modello Base:** Il componente principale.
*   **Precisioni di Calcolo:** Analizza diverse quantizzazioni come `FP16`, `FP8`, e formati popolari come `GGUF`.
*   **Componenti Aggiuntivi:** Valuta l'impatto di Text Encoders e VAE opzionali.

Per ogni combinazione, il motore valuta:

*   **VRAM della GPU:** Calcola se tutti i componenti possono risiedere nella VRAM per performance **ottimali**.
*   **Offload su RAM:** Se la VRAM non è sufficiente, simula lo spostamento ("offload") di alcuni componenti sulla RAM di sistema, valutando se l'operazione è **possibile** e avvisando l'utente sull'impatto prestazionale.
*   **Requisiti di Sistema:** Verifica che la RAM totale del sistema sia sufficiente per gestire sia il modello che l'eventuale offload.

🇬🇧 Unlike a simple checklist, the core of KSimply is an analysis engine that simulates the memory load for every possible model "recipe". The calculation is tailored to your setup and considers **all possible combinations** of:

*   **Base Model:** The main component.
*   **Computational Precisions:** It analyzes different quantizations like `FP16`, `FP8`, and popular formats such as `GGUF`.
*   **Additional Components:** It assesses the impact of optional Text Encoders and VAEs.

For each combination, the engine evaluates:

*   **GPU VRAM:** It calculates if all components can reside in VRAM for **optimal** performance.
*   **RAM Offloading:** If VRAM is insufficient, it simulates moving ("offloading") some components to the system RAM, assessing if the operation is **possible** and warning the user about the performance impact.
*   **System Requirements:** It verifies that the total system RAM is sufficient to handle both the model and any potential offloading.

---

## 🛠️ Stack Tecnologico / Tech Stack

*   **🚀 Framework**: [SvelteKit](https://kit.svelte.dev/)
*   **💻 Language**: [TypeScript](https://www.typescriptlang.org/)
*   **🎨 Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **🌐 Internationalization (i18n)**: [Paraglide JS](https://inlang.com/m/gerre3r/library-inlang-paraglideJs)
*   **💾 Database**: [SQLite](https://www.sqlite.org/index.html) (Local) & [Turso](https://turso.tech/) (Production)
*   **☁️ Hosting**: [Vercel](https://vercel.com/)
*   **✏️ Icons**: [Lucide Icons](https://lucide.dev/)

---

## 💻 Installazione Locale / Local Installation

### 🇮🇹 Italiano

Per eseguire KSimply sul tuo computer locale, segui questi passaggi:

1.  **Clona il repository:**
    ```bash
    git clone https://github.com/d4N-87/KSimply.git
    cd KSimply
    ```
2.  **Installa le dipendenze:** `npm install`
3.  **Crea e popola il database locale:** `npm run db:seed`
4.  **Avvia il server di sviluppo:** `npm run dev`

L'applicazione sarà disponibile su `http://localhost:5173`.

### 🇬🇧 English

To run KSimply on your local machine, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/d4N-87/KSimply.git
    cd KSimply
    ```
2.  **Install dependencies:** `npm install`
3.  **Create and seed the local database:** `npm run db:seed`
4.  **Start the development server:** `npm run dev`

The application will now be available at `http://localhost:5173`.

---

## 📈 Aggiornamenti Futuri / Future Updates

<p>🇮🇹 Il database di KSimply verrà aggiornato periodicamente con nuove schede video e nuovi modelli AI.</p>
<p>🇬🇧 KSimply's database will be periodically updated with new graphics cards and AI models.</p>

---

## ❤️ Supporta il Progetto / Support the Project

<p>🇮🇹 Se KSimply ti è stato utile, considera di supportare il progetto. Ogni contributo aiuta a mantenere il sito attivo e a finanziare lo sviluppo di nuove funzionalità!</p>
<p>🇬🇧 If you found KSimply useful, please consider supporting the project. Every contribution helps keep the site running and funds the development of new features!</p>

[![Donate with PayPal](https://raw.githubusercontent.com/stefan-niedermann/paypal-donate-button/master/paypal-donate-button.png)](https://paypal.me/d4n87?country.x=IT&locale.x=it_IT)

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=d4N-87/KSimply&type=Date)](https://www.star-history.com/#d4N-87/KSimply&Date)

---

## 📄 Licenza / License

<p>🇮🇹 Questo progetto è rilasciato sotto la Licenza MIT.</p>
<p>🇬🇧 This project is released under the MIT License.</p>

<!-- Link di Riferimento per i Badge (vanno alla fine del file) -->
[stars-shield]: https://img.shields.io/github/stars/d4N-87/KSimply?style=for-the-badge
[stars-url]: https://github.com/d4N-87/KSimply/stargazers
[issues-shield]: https://img.shields.io/github/issues/d4N-87/KSimply?style=for-the-badge
[issues-url]: https://github.com/d4N-87/KSimply/issues
[license-shield]: https://img.shields.io/github/license/d4N-87/KSimply?style=for-the-badge
[license-url]: https://github.com/d4N-87/KSimply/blob/main/LICENSE
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/danielenofi
