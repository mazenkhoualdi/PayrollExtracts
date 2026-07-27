# Payroll Extracts — React Version

A React + Vite web application that directly reads your `.db` (SQLite) payroll database
(attendance, salaries, and advances) and generates a payroll extract for each selected employee, including:

- a color-coded daily calendar showing: full day, half day, overtime,
  double day, absence, leave, or unrecorded day;
- a summary of attendance counters (number of days for each category and total overtime hours);
- a detailed list of salary advances deducted during the selected period;
- the **net salary payable**;
- a button to download an individual PDF for each employee, and another button to download
  all selected employees as a single combined PDF.

Everything runs directly in the browser: the `.db` file is never uploaded to a server.

## Installation

Prerequisite: [Node.js](https://nodejs.org) version 18 or later.

```bash
npm install
npm run dev
```

Then open the URL displayed in the terminal (usually `http://localhost:5173`).

## Production Build

```bash
npm run build
npm run preview
```

The generated `dist/` folder can be deployed to any static hosting service
(Netlify, Vercel, or any internal web server).

## Project Structure

```
src/
  App.jsx                     — main application orchestration (state management and payroll generation)
  index.css                   — visual theme
  utils/payroll.js            — business logic: day classification and payroll calculations
  components/
    UploadZone.jsx            — SQLite database upload
    ConfigPanel.jsx           — period selection and calculation options (overtime multiplier, paid leave)
    EmployeePicker.jsx        — employee selection
    MonthCalendar.jsx         — color-coded monthly calendar
    EmployeeReport.jsx        — complete employee payroll extract with PDF export
```

## Calculation Rules (Adapted to Your Database)

Each day's classification is determined from the `heures_travaillees` (worked hours)
and `type_presence` fields in the `pointages` table.

| Condition | Classification | Amount |
|-----------|----------------|--------|
| `present` + `journee_complete` + 8h | Full Day | 1 × daily salary |
| `present` + `demi_journee` | Half Day | 0.5 × daily salary |
| `present` + `journee_complete` + >8h | Overtime | Daily salary + overtime hours × hourly rate × overtime multiplier |
| `present` + `journee_complete` + ≥16h | Double Day | 2 × daily salary |
| `absent` | Absent | 0 |
| `conge` | Leave | Daily salary if **Paid Leave** is enabled, otherwise 0 |
| No attendance record for the day | Unrecorded Day | 0 |

Salary **advances** (from the `avances` table) are automatically deducted if their date
falls within the selected period.

The **complements** table (housing, fuel, transportation, etc.) is **not included** in the payroll calculation because it does not contain an `employe_id` column, making it impossible to reliably associate records with a specific employee.

If you want to include these complements in the future, simply add an `employe_id` column in the source application. The corresponding query can then be easily implemented in `payroll.js`.

## Quick Customization

- Overtime multiplier and **Paid Leave** option: configurable directly from the user interface (Section 2).
- Colors and layout: `src/index.css` (CSS variables at the top of the file).
- Payroll calculation rules: `src/utils/payroll.js`, particularly the `classifyDay` and `dayAmount` functions.
