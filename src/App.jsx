import { useRef, useState, useEffect } from "react";
import initSqlJs from "sql.js/dist/sql-wasm.js";
import sqlWasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import html2pdf from "html2pdf.js";

import UploadZone from "./components/UploadZone";
import ConfigPanel from "./components/ConfigPanel";
import EmployeePicker from "./components/EmployeePicker";
import EmployeeReport from "./components/EmployeeReport";
import { buildEmployeeReport, queryAll } from "./utils/payroll";

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
  const [config, setConfig] = useState({
    start: "",
    end: "",
    overtimeMult: 1.5,
    congePaye: true,
  });
  const [reports, setReports] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [employeeCount, setEmployeeCount] = useState(0);
  const reportsRef = useRef(null);
  const topRef = useRef(null);

  // Statistiques sur les employés
  useEffect(() => {
    if (employees.length > 0) {
      const active = employees.filter((e) => e.actif).length;
      setEmployeeCount({
        total: employees.length,
        active,
        inactive: employees.length - active,
      });
    }
  }, [employees]);

  async function handleFile(file) {
    setStatus({ msg: "Lecture du fichier...", kind: "loading" });
    try {
      const buffer = await file.arrayBuffer();
      const SQL = await getSql();
      const database = new SQL.Database(new Uint8Array(buffer));

      const emps = queryAll(
        database,
        "SELECT * FROM employes ORDER BY actif DESC, nom, prenom",
      );
      const range = queryAll(
        database,
        "SELECT MIN(date_pointage) AS mn, MAX(date_pointage) AS mx FROM pointages",
      )[0];

      setDb(database);
      setEmployees(emps);
      setConfig((prev) => ({
        ...prev,
        start: range?.mn || prev.start,
        end: range?.mx || prev.end,
      }));
      setStatus({
        msg: `Base chargée : pointages du ${range?.mn || "?"} au ${range?.mx || "?"}.`,
        kind: "ok",
      });
      setReports(null);
      setSelectedIds(new Set(emps.filter((e) => e.actif).map((e) => e.id)));
    } catch (err) {
      setStatus({
        msg: `❌ Impossible de lire ce fichier comme base SQLite : ${err.message}`,
        kind: "err",
      });
    }
  }

  function handleGenerate() {
    if (!config.start || !config.end) {
      alert("📅 Merci de choisir une date de début et de fin.");
      return;
    }
    if (config.start > config.end) {
      alert("⚠️ La date de début doit précéder la date de fin.");
      return;
    }
    if (selectedIds.size === 0) {
      alert("👥 Sélectionnez au moins un employé.");
      return;
    }

    setIsGenerating(true);
    setStatus({
      msg: `⏳ Génération des extraits pour ${selectedIds.size} employé(s)...`,
      kind: "loading",
    });

    setTimeout(() => {
      const selectedEmployees = employees.filter((e) => selectedIds.has(e.id));
      const built = selectedEmployees.map((emp) =>
        buildEmployeeReport(
          db,
          emp,
          config.start,
          config.end,
          config.overtimeMult,
          config.congePaye,
        ),
      );
      setReports(built);
      setIsGenerating(false);
      setStatus({
        msg: `✅ ${built.length} extrait(s) généré(s) avec succès !`,
        kind: "ok",
      });
      setTimeout(
        () => reportsRef.current?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    }, 500);
  }

  function downloadAllPdf() {
    const el = reportsRef.current;
    if (!el) return;

    setIsDownloadingAll(true);
    const noPrintEls = el.querySelectorAll(".no-print");
    noPrintEls.forEach((n) => (n.style.visibility = "hidden"));

    const opt = {
      margin: 8,
      filename: "extraits_salaire_groupe.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"], after: ".employee-report" },
    };

    html2pdf()
      .set(opt)
      .from(el)
      .save()
      .then(() => {
        noPrintEls.forEach((n) => (n.style.visibility = "visible"));
        setIsDownloadingAll(false);
        setStatus({
          msg: `✅ Tous les extraits ont été téléchargés avec succès !`,
          kind: "ok",
        });
      })
      .catch(() => {
        noPrintEls.forEach((n) => (n.style.visibility = "visible"));
        setIsDownloadingAll(false);
        setStatus({
          msg: `❌ Erreur lors du téléchargement du PDF.`,
          kind: "err",
        });
      });
  }

  function scrollToTop() {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="app-container" ref={topRef}>
      {/* En-tête amélioré */}
      <header className="app-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">🏢</span>
          </div>
          <div className="header-title">
            <h1>Générateur d'extraits de salaire</h1>
            <p>
              À partir de la base de pointage — calendrier détaillé, calcul du
              salaire, avances déduites
            </p>
          </div>
        </div>
        {employees.length > 0 && (
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-number">{employees.length}</span>
              <span className="stat-label">Employés</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{employeeCount.active || 0}</span>
              <span className="stat-label">Actifs</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{selectedIds.size}</span>
              <span className="stat-label">Sélectionnés</span>
            </div>
          </div>
        )}
      </header>

      {/* Contenu principal */}
      <div className="app-content">
        <UploadZone onFile={handleFile} status={status} />

        {employees.length > 0 && (
          <>
            <ConfigPanel config={config} setConfig={setConfig} />
            <EmployeePicker
              employees={employees}
              selectedIds={selectedIds}
              setSelectedIds={setSelectedIds}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          </>
        )}

        {reports && (
          <div className="reports-section">
            <div className="reports-header no-print">
              <div className="reports-header-left">
                <h2>
                  <span className="icon">📄</span>
                  Extraits générés
                  <span className="badge">{reports.length}</span>
                </h2>
                <span className="reports-period">
                  Période : {config.start} → {config.end}
                </span>
              </div>
              <div className="reports-header-right">
                <button
                  className="btn secondary"
                  onClick={downloadAllPdf}
                  disabled={isDownloadingAll}
                >
                  {isDownloadingAll ? (
                    <>
                      <span className="spinner" />
                      Téléchargement...
                    </>
                  ) : (
                    <>📥 Télécharger tout en PDF</>
                  )}
                </button>
                <button
                  className="btn secondary"
                  onClick={() => window.print()}
                >
                  🖨️ Imprimer
                </button>
                <button className="btn secondary" onClick={scrollToTop}>
                  ⬆️ Haut
                </button>
              </div>
            </div>
            <div className="reports-hint no-print">
              <span className="hint-icon">💡</span>
              Chaque extrait a son propre bouton de téléchargement individuel.
            </div>
            <div id="reports" ref={reportsRef}>
              {reports.map((r, index) => (
                <div key={r.emp.id} className="report-wrapper">
                  <div className="report-number">#{index + 1}</div>
                  <EmployeeReport
                    report={r}
                    start={config.start}
                    end={config.end}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .app-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          background: var(--paper);
          min-height: 100vh;
        }

        /* En-tête */
        .app-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 28px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          margin-bottom: 28px;
          border: 1px solid #e9ecef;
          flex-wrap: wrap;
          gap: 16px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--brand);
          padding: 8px 16px 8px 12px;
          border-radius: 10px;
          color: white;
          flex-shrink: 0;
        }

        .logo-icon {
          font-size: 24px;
        }

        .logo-text {
          font-size: 20px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .header-title h1 {
          margin: 0;
          font-size: 22px;
          color: var(--brand);
          font-weight: 700;
        }

        .header-title p {
          margin: 4px 0 0;
          font-size: 14px;
          color: var(--ink-soft);
        }

        .header-stats {
          display: flex;
          gap: 24px;
          flex-shrink: 0;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: #f8f9fa;
          padding: 6px 16px;
          border-radius: 8px;
          min-width: 60px;
        }

        .stat-number {
          font-size: 20px;
          font-weight: 700;
          color: var(--brand);
          line-height: 1.2;
        }

        .stat-label {
          font-size: 10px;
          color: var(--ink-soft);
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        /* Contenu */
        .app-content {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        /* Reports section */
        .reports-section {
          margin-top: 32px;
        }

        .reports-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          background: white;
          border-radius: 12px 12px 0 0;
          border: 1px solid #e9ecef;
          border-bottom: none;
          flex-wrap: wrap;
          gap: 12px;
        }

        .reports-header-left {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .reports-header-left h2 {
          margin: 0;
          font-size: 18px;
          color: var(--brand);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .reports-header-left .icon {
          font-size: 20px;
        }

        .badge {
          background: var(--brand);
          color: white;
          padding: 1px 12px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
        }

        .reports-period {
          font-size: 13px;
          color: var(--ink-soft);
          background: #f8f9fa;
          padding: 4px 12px;
          border-radius: 6px;
        }

        .reports-header-right {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .reports-header-right .btn {
          font-size: 13px;
          padding: 8px 16px;
        }

        .reports-header-right .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .reports-hint {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: #f8f9fa;
          border-left: 1px solid #e9ecef;
          border-right: 1px solid #e9ecef;
          font-size: 13px;
          color: var(--ink-soft);
        }

        .hint-icon {
          font-size: 16px;
        }

        #reports {
          border: 1px solid #e9ecef;
          border-radius: 0 0 12px 12px;
          background: white;
          padding: 20px;
        }

        .report-wrapper {
          position: relative;
          margin-bottom: 24px;
        }

        .report-wrapper:last-child {
          margin-bottom: 0;
        }

        .report-number {
          position: absolute;
          top: -10px;
          left: -10px;
          background: var(--brand);
          color: white;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          z-index: 10;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .app-container {
            padding: 12px;
          }

          .app-header {
            flex-direction: column;
            align-items: stretch;
            padding: 16px 20px;
          }

          .header-left {
            flex-direction: column;
            align-items: flex-start;
          }

          .logo {
            align-self: flex-start;
          }

          .header-title h1 {
            font-size: 18px;
          }

          .header-stats {
            justify-content: space-around;
            width: 100%;
          }

          .reports-header {
            flex-direction: column;
            align-items: stretch;
          }

          .reports-header-right {
            justify-content: stretch;
          }

          .reports-header-right .btn {
            flex: 1;
            justify-content: center;
          }

          #reports {
            padding: 12px;
          }

          .report-number {
            top: -8px;
            left: -8px;
            width: 24px;
            height: 24px;
            font-size: 10px;
          }
        }

        @media (max-width: 480px) {
          .app-header {
            padding: 12px 16px;
          }

          .header-title h1 {
            font-size: 16px;
          }

          .header-title p {
            font-size: 12px;
          }

          .stat-item {
            padding: 4px 10px;
            min-width: 50px;
          }

          .stat-number {
            font-size: 16px;
          }

          .reports-header-left h2 {
            font-size: 15px;
          }

          .reports-period {
            font-size: 11px;
          }

          .reports-header-right .btn {
            font-size: 11px;
            padding: 6px 12px;
          }

          #reports {
            padding: 8px;
          }
        }

        @media print {
          .app-header {
            display: none !important;
          }

          .no-print {
            display: none !important;
          }

          .reports-header {
            display: none !important;
          }

          .reports-hint {
            display: none !important;
          }

          .report-number {
            display: none !important;
          }

          #reports {
            border: none;
            padding: 0;
          }

          .report-wrapper {
            margin-bottom: 0;
          }
        }
      `}</style>
    </div>
  );
}
