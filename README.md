# Payroll Extracts 

A web application (React + Vite) that reads your `.db` (SQLite) file of
attendance/payroll/advances directly and generates, for each selected employee,
a payslip-style extract with:

- a color-coded day-by-day calendar: full day, half day, overtime,
  double day, absence, leave, or unrecorded day;
- a summary of counters (number of days of each type, cumulative overtime);
- the detail of advances deducted over the period;
- the **net amount payable**;
- a PDF download button per employee, and a button to download everything
  as a single combined PDF.

Everything happens in the browser: the `.db` file is never sent to a server.

## Installation

Requirement: [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install
npm run dev
```

Then open the address shown in the terminal (usually `http://localhost:5173`).

## Production build

```bash
npm run build
npm run preview
```

The generated `dist/` folder can be deployed to any static hosting
(Netlify, Vercel, a simple internal web server, etc.).

## Project structure

```
src/
  App.jsx                     — general orchestration (state, extract generation)
  index.css                   — visual theme
  utils/payroll.js            — business logic: day classification, salary calculation
  components/
    UploadZone.jsx            — .db file drop zone
    ConfigPanel.jsx           — period and options (overtime premium, paid leave)
    EmployeePicker.jsx        — employee selection
    MonthCalendar.jsx         — color-coded monthly calendar
    EmployeeReport.jsx        — full employee extract + PDF export
```

## Calculation rules (adapted to your database)

The classification of a day is derived from the `heures_travaillees`
(hours worked) field and the `type_presence` (attendance type) field of the
`pointages` (attendance) table:

| Case                                              | Type          | Amount                                       |
|--------------------------------------------------|---------------|-----------------------------------------------|
| `present` + `journee_complete` + 8h              | Full day      | 1 × daily salary                              |
| `present` + `demi_journee`                       | Half day      | 0.5 × daily salary                            |
| `present` + `journee_complete` + >8h              | Overtime      | daily salary + overtime hours × hourly rate × premium |
| `present` + `journee_complete` + ≥16h             | Double day    | 2 × daily salary                              |
| `absent`                                          | Absent        | 0                                              |
| `conge`                                           | Leave         | daily salary if "paid leave" is checked, otherwise 0 |
| No row for that day                               | Not recorded  | 0                                              |

**Advances** (`avances` table) are automatically deducted according to their
date, if they fall within the selected period.

The **compléments** table (rent, fuel, transport...) is **not included** in
the calculation: it has no `employe_id` column in your database, so there is
no reliable link to a specific employee. If you ever want to include it, add
that column on the source software side, and a query can easily be added to
`payroll.js`.

## Electron version (desktop application)

This project is now also packaged to run as a real desktop application, with
Electron, on Windows / macOS / Linux — no browser or server needed anymore.

### Run in development mode

```bash
npm install
npm run electron:dev
```

This starts the Vite dev server and automatically opens an Electron window
pointing to it (with hot-reload).

### Generate the installer / final executable

```bash
npm run dist
```

This command builds the React app (`vite build`) then generates an installer
with `electron-builder` in the `release/` folder:
- `.exe` (NSIS) on Windows
- `.dmg` on macOS
- `.AppImage` on Linux

### How it works technically

- `electron/main.cjs` — Electron main process. It registers a custom
  `app://` protocol to serve the files from the `dist/` folder once the app
  is packaged. This is necessary because `sql.js` loads its `.wasm` binary
  via `fetch()`, and `fetch()` on `file://` URLs is blocked by Chromium —
  the `app://` protocol works around this cleanly.
- `electron/preload.cjs` — preload script, `contextIsolation` enabled, no
  Node API is exposed to the renderer (the `.db` file is read via a plain
  `<input type="file">`, which works natively).
- `vite.config.js` — `base: './'` so the built assets use relative paths
  (required for `app://bundle/...` to work).

Everything else in the project (React, business logic, PDF generation) is
unchanged.

## Quick customization

- Overtime premium and "paid leave": editable directly in the
  interface (section 2).
- Colors and layout: `src/index.css` (CSS variables at the top of the file).
- Calculation rules: `src/utils/payroll.js`, functions `classifyDay` and
  `dayAmount`.
