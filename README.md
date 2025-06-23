<h1 align="center">MemeMuseum - istruzioni dettagliate su come eseguire il progetto</h1>

<p align="center">
    Progetto sviluppato per il corso di <i>Tecnologie Web</i> dell'<i>Università degli studi di Napoli Federico II</i> nell'anno accademico 2024-2025.
</p>
<p>
    <strong>Autore</strong>
    <ul align="left">
        <li><a href="https://github.com/giuseppedima">Giuseppe DI MARTINO - N86004948</a></li>
    </ul>
    <strong>Docente</strong>
    <ul align="left">
        <li><a href="https://www.docenti.unina.it/luigiliberolucio.starace">Luigi Libero Lucio STARACE</a></li>
    </ul>
</p>

## Requisiti
Assicurarsi di aver installato 
- [Node.js](https://nodejs.org/en/download) e il package manager `npm`.
- [Angular CLI](https://angular.dev/installation#install-angular-cli) globalmente utilizzando il comando
```bash
npm install -g @angular/cli@19.2.13
```
- [TypeScript](https://www.typescriptlang.org/download/) globalmente utilizzando il comando
```bash
npm install -g typescript@5.8.3
```
# Backend
1. Aprire un terminale e navigare nella cartella `backend`.
2. Eseguire il seguente comando per installare tutte le dipendenze: 
```bash
npm install
```
3. Avviare il server eseguendo il comando:
```bash
npm run dev
```
Il server si avvierà all'indirizzo http://localhost:3000

## Frontend

1. Aprire un terminale e navigare nella cartella `frontend`.
2. Eseguire il seguente comando per installare tutte le dipendenze:
```bash
npm install
```
3. L'applicazione sarà visitabile all'indirizzo http://localhost:4200 e la documentazione delle API sarà visibile all'indirizzo http://localhost:3000/api-docs/

## Test end-to-end automatici

1. Aprire un terminale e navigare nella cartella `e2e`.
2. Eseguire il seguente comando per installare tutte le dipendenze:
```bash
npm install
```
3. Per eseguire i test automatici utilizzare il comando:
```bash
npx playwright test
```