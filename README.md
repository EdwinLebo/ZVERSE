# ZVERSE — Inside the Mainframe

ZVERSE is an independent, browser-based educational exhibition about enterprise mainframe computing. It was built as a portfolio project for a Multimedia Computing student and IBM Z Student Ambassador at Tshwane University of Technology, South Africa.

## Visit the exhibits

- **Inside the Mainframe** features an original three-rack concept cabinet, orbit and zoom controls, ten selectable components, an exploded view and an accessible 2D system map.
- **Process a Transaction** traces an ATM withdrawal, transfer, card payment, flight booking or retail batch from intake to audit. Try an insufficient balance, a visitor identity or an injected write failure.
- **Mainframe Operations Center** charts throughput, latency, processor work, resource occupancy and outcomes. Use its seed control to replay scenarios.
- **Control the Workload** changes demand, capacity and priority across five presets. Compare FIFO, priority scheduling and weighted service classes with aging.
- **Protect the Mainframe** illustrates authentication, authorization, encryption and audit. Its encryption exercise uses Web Crypto AES-GCM on a fictional record.
- **Learn the Fundamentals** contains a seven-stop tour, a searchable glossary, a comparison guide and an 18-question quiz. The browser stores quiz progress by difficulty.
- **Project notes** documents the objectives, implementation and screenshots.

## Run locally

Use Node.js 22.12 or newer and npm.

```sh
npm ci
npm run dev
```

Open the Local URL printed by Vite. To run the tests and preview the production build:

```sh
npm test
npm run build
npm run preview
```

The production site is written to `dist/`. Routes use URL fragments, so they work on a static host and support direct links.

## Configure portfolio links

Copy `.env.example` to `.env.local`. Set `VITE_GITHUB_URL` and `VITE_PORTFOLIO_URL` to your real URLs, then rebuild. The Project page shows each link once its URL is configured.

## How the simulation works

React views read snapshots from one JavaScript engine. The engine advances in 50 ms simulated steps. A seed controls synthetic job types, costs, priorities and occasional failures. For a reproducible run, apply the same seed, workload settings and actions at the same simulated times.

A manual request progresses through creation, intake checks, admission, processing and a terminal decision. Queue capacity is 160, and each step distributes a processing budget across the active workers. Each admitted job needs at least one work unit. Priority and service-class scheduling age old requests so newer requests cannot always bypass them. Background jobs exercise the scheduler and metrics without posting to the manual ledger.

The transaction lab tracks one manually submitted request at a time. It stores currency as integer cents. The commit step checks the latest account balance and applies successful debits, paired transfer credits or seat reservations together. Validation, security and failure paths preserve the ledger. Pause freezes simulated time. Reset restores the seed, clock, queues, accounts, event log and configuration to their initial state.

Throughput and average latency use a five-second simulated window of processed requests. Admission rejections contribute to outcome counts. CPU is the fraction of available work consumed in the most recent second. Memory is an illustrative measure of slot occupancy. The dashboard uses engine snapshots for both numeric readouts and charts.

## Source map

| Location | Responsibility |
| --- | --- |
| `src/App.jsx`, `src/pages/` | Navigation and exhibits |
| `src/components/` | Shared presentation, trace and diagram controls |
| `src/scenes/` | Procedural Three.js cabinet, orbit camera, connections and instanced detail |
| `src/simulation/` | Clock, transaction rules, scheduling, authorization and telemetry |
| `src/hooks/SimulationContext.jsx` | Engine lifetime and React subscriptions |
| `src/data/` | Architecture explanations, tour, glossary, quiz and references |
| `tests/simulation.test.js` | Vitest checks for the ledger, scheduler, metrics and security |
| `public/screenshots/` | Captures of the working exhibition and transaction lab |

The stack is React, Vite, JavaScript, Three.js, React Three Fiber, Drei, GSAP with ScrollTrigger, Tailwind CSS, Lucide React and Vitest. Fonts are bundled locally.

## GitHub Pages

The included workflow tests the project, builds it for the repository's Pages path and publishes the static output. In a new repository, select **GitHub Actions** under **Settings → Pages → Source**, then run the **Deploy ZVERSE to GitHub Pages** workflow.

The Pages workflow fills in the source link from the repository and uses the public portfolio URL for the return link. For a local preview of the Pages build:

```sh
npm run build -- --base /ZVERSE/
npm run preview
```

Open the URL with `/ZVERSE/` appended. For GitHub Pages setup, see the [Vite deployment guide](https://vite.dev/guide/static-deploy#github-pages).

## Firebase Hosting

Create or select a Firebase project with a Hosting site. The checked-in `firebase.json` sets the public directory to `dist` and includes a single-page rewrite.

```sh
npm ci
npm run build
npx firebase-tools login
npx firebase-tools deploy --only hosting --project YOUR_PROJECT_ID
```

Replace `YOUR_PROJECT_ID` with the Firebase project ID. See the [Firebase Hosting quickstart](https://firebase.google.com/docs/hosting/quickstart) for project and site setup.

## Educational boundaries

- The cabinet is a procedural concept. Software drawn as trays represents relationships between services.
- The engine is a teaching model. Its policies illustrate contention and do not reproduce z/OS WLM. Its metrics are fictional and are not IBM Z benchmarks.
- The local role table and encryption exercise illustrate security principles. They do not reproduce RACF profiles, TLS, IBM Z hardware cryptography or a production security boundary.
- Simulation state lives in memory. Quiz progress persists in local storage. The encryption exercise requires HTTPS or localhost. Interactive 3D requires WebGL2, and the system map and written explanations work without it.
- Browser timers may slow down in background tabs. The simulator caps catch-up on returning to the tab.

IBM, IBM Z, z/OS, CICS, Db2 and RACF are used for educational reference. ZVERSE is not affiliated with or endorsed by IBM.

## Technical reading

- [IBM mainframe overview](https://www.ibm.com/think/topics/mainframe)
- [IBM CICS transaction flow](https://www.ibm.com/docs/en/zos-basic-skills?topic=cics-how-transaction-flows)
- [IBM z/OS workload management terms](https://www.ibm.com/docs/en/cics-ts/6.x?topic=manager-terms-used-in-zos-workload-management)
- [IBM Db2 commit and rollback](https://www.ibm.com/docs/en/db2-for-zos/13.0.0?topic=consistency-commit-rollback-transactions)
- [IBM RACF identification and authorization](https://www.ibm.com/docs/en/zos/3.2.0?topic=puia-when-logon-job-initialization-processing-takes-place-why)
- [IBM Z hardware cryptography](https://www.ibm.com/docs/en/zos-connect/3.0.0?topic=connect-z-mainframe-hardware-cryptography)

