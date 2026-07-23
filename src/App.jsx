import { useRef, useState } from 'react';
import initSqlJs from 'sql.js';
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import html2pdf from 'html2pdf.js';

import UploadZone from './components/UploadZone';
import ConfigPanel from './components/ConfigPanel';
import EmployeePicker from './components/EmployeePicker';
import EmployeeReport from './components/EmployeeReport';
import { buildEmployeeReport, queryAll } from './utils/payroll';

let sqlPromise = null;
function getSql() {
  if (!sqlPromise) {
    sqlPromise = initSqlJs({ locateFile: () => sqlWasmUrl });
  }
  return sqlPromise;
}

export default function App() {
  const [status, setStatus] = useState(null);
  const [db, setDb] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [config, setConfig] = useState({ start: '', end: '', overtimeMult: 1.5, congePaye: true });
  const [reports, setReports] = useState(null); // null = not generated yet
  const reportsRef = useRef(null);

  async function handleFile(file) {
    setStatus({ msg: 'Lecture du fichier...', kind: '' });
    try {
      const buffer = await file.arrayBuffer();
      const SQL = await getSql();
      const database = new SQL.Database(new Uint8Array(buffer));

      const emps = queryAll(database, 'SELECT * FROM employes ORDER BY actif DESC, nom, prenom');
      const range = queryAll(database, 'SELECT MIN(date_pointage) AS mn, MAX(date_pointage) AS mx FROM pointages')[0];

      setDb(database);
      setEmployees(emps);
      setConfig(prev => ({ ...prev, start: range?.mn || prev.start, end: range?.mx || prev.end }));
      setStatus({
        msg: `Base chargée : ${emps.length} employé(s), pointages disponibles du ${range?.mn || '?'} au ${range?.mx || '?'}.`,
        kind: 'ok',
      });
      setReports(null);
    } catch (err) {
      setStatus({ msg: `Impossible de lire ce fichier comme base SQLite : ${err.message}`, kind: 'err' });
    }
  }

  function handleGenerate() {
    if (!config.start || !config.end) { alert('Merci de choisir une date de début et de fin.'); return; }
    if (config.start > config.end) { alert('La date de début doit précéder la date de fin.'); return; }
    if (selectedIds.size === 0) { alert('Sélectionnez au moins un employé.'); return; }

    const selectedEmployees = employees.filter(e => selectedIds.has(e.id));
    const built = selectedEmployees.map(emp =>
      buildEmployeeReport(db, emp, config.start, config.end, config.overtimeMult, config.congePaye)
    );
    setReports(built);
    setTimeout(() => reportsRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }

  function downloadAllPdf() {
    const el = reportsRef.current;
    if (!el) return;
    const noPrintEls = el.querySelectorAll('.no-print');
    noPrintEls.forEach(n => (n.style.visibility = 'hidden'));
    const opt = {
      margin: 8,
      filename: 'extraits_salaire_groupe.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'], after: '.employee-report' },
    };
    html2pdf().set(opt).from(el).save().then(() => {
      noPrintEls.forEach(n => (n.style.visibility = 'visible'));
    });
  }

  return (
    <div className="wrap">
      <header className="app-header">
        <div className="logo">RH</div>
        <div>
          <h1>Générateur d'extraits de salaire</h1>
          <p>À partir de la base de pointage — calendrier détaillé, calcul du salaire, avances déduites</p>
        </div>
      </header>

      <UploadZone onFile={handleFile} status={status} />

      {employees.length > 0 && (
        <>
          <ConfigPanel config={config} setConfig={setConfig} />
          <EmployeePicker
            employees={employees}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            onGenerate={handleGenerate}
          />
        </>
      )}

      {reports && (
        <div>
          <div className="actions-bar no-print" style={{ marginBottom: 16 }}>
            <button className="btn secondary" onClick={downloadAllPdf}>Télécharger tout en un seul PDF</button>
            <button className="btn secondary" onClick={() => window.print()}>Imprimer</button>
            <span className="hint">Chaque extrait a aussi son propre bouton de téléchargement.</span>
          </div>
          <div id="reports" ref={reportsRef}>
            {reports.map(r => (
              <EmployeeReport key={r.emp.id} report={r} start={config.start} end={config.end} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
