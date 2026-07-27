import { useRef, useState } from "react";
import html2pdf from "html2pdf.js";
import MonthCalendar from "./MonthCalendar";
import { LEGEND, fmtMoney, formatPeriodLabel } from "../utils/payroll";

const LEGEND_COLORS = {
  normal: "var(--ok)",
  demi: "var(--half)",
  heures_sup: "var(--sup)",
  double: "var(--double)",
  absent: "var(--absent)",
  conge: "var(--conge)",
  autre: "var(--autre)",
  dimanche: "var(--dimanche)",
  sans_donnee: "#b3b1a8",
};

export default function EmployeeReport({ report, start, end }) {
  const ref = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const {
    emp,
    days,
    counts,
    heuresSupTotal,
    brut,
    avances,
    totalAvances,
    net,
  } = report;
  const periodLabel = formatPeriodLabel(start, end);

  // Calcul des statistiques supplémentaires
  const totalDays = days.length;
  const workedDays =
    counts.normal + counts.demi + counts.heures_sup + counts.double;
  const absenceDays = counts.absent + counts.sans_donnee;
  const workRate =
    totalDays > 0 ? Math.round((workedDays / totalDays) * 100) : 0;

  function downloadPdf() {
    const el = ref.current;
    if (!el) return;

    setIsDownloading(true);
    const noPrintEls = el.querySelectorAll(".no-print");
    noPrintEls.forEach((n) => (n.style.visibility = "hidden"));

    const marginMM = 6;
    const A4_WIDTH_MM = 210;

    const opt = {
      margin: marginMM,
      filename:
        `extrait_salaire_${emp.nom}_${emp.prenom || ""}`.replace(/\s+/g, "_") +
        ".pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        letterRendering: true,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
      pagebreak: { mode: ["avoid-all"] },
    };

    const finish = () => {
      noPrintEls.forEach((n) => (n.style.visibility = "visible"));
      setIsDownloading(false);
    };

    html2pdf()
      .set(opt)
      .from(el)
      .toContainer()
      .toCanvas()
      .then(function () {
        // html2pdf clone l'élément dans un conteneur dont IL force la largeur
        // (celle de la page PDF). On mesure donc la hauteur de page nécessaire
        // sur le canvas réellement produit (après ce redimensionnement interne),
        // et non sur la largeur de l'écran : c'est la seule façon de garantir
        // que la page ait exactement la hauteur du contenu, sans 2e page.
        const canvas = this.prop.canvas;
        const contentWidthMM = A4_WIDTH_MM - marginMM * 2;
        const contentHeightMM = (canvas.height / canvas.width) * contentWidthMM;
        const pageHeightMM = contentHeightMM + marginMM * 2;
        return this.set({
          jsPDF: {
            unit: "mm",
            format: [A4_WIDTH_MM, pageHeightMM],
            orientation: "portrait",
          },
        });
      })
      .toPdf()
      .save()
      .then(finish)
      .catch(finish);
  }

  return (
    <div className="employee-report-wrapper">
      <div className="employee-report" ref={ref}>
        {/* En-tête amélioré */}
        <div className="rep-head">
          <div className="rep-head-left">
            <div className="company-logo">
              <span className="logo-icon">🏢</span>
              <span className="company-name">Extrait de salaire</span>
            </div>
            <div className="employee-info">
              <h3>
                {emp.nom} {emp.prenom || ""}
              </h3>
              <div className="employee-meta">
                <span className="meta-item">
                  <span className="meta-icon">💼</span>
                  {emp.poste || "Poste non spécifié"}
                </span>
                <span className="meta-divider">·</span>
                <span className="meta-item">
                  <span className="meta-icon">💰</span>
                  Salaire journalier : {fmtMoney(emp.salaire_journalier)}
                </span>
              </div>
            </div>
          </div>
          <div className="rep-head-right">
            <div className="period-box">
              <span className="period-label">📅 Période</span>
              <span className="period-date">{periodLabel}</span>
            </div>
            <button
              className={`btn small rep-download no-print ${isDownloading ? "loading" : ""}`}
              onClick={downloadPdf}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <span className="spinner" />
                  Téléchargement...
                </>
              ) : (
                <>⬇ Télécharger PDF</>
              )}
            </button>
          </div>
        </div>

        {/* Légende améliorée */}
        <div className="legend-section">
          <div className="legend">
            {LEGEND.map((l) => (
              <div className="lg-item" key={l.type}>
                <span
                  className="lg-swatch"
                  style={{ background: LEGEND_COLORS[l.type] }}
                ></span>
                {l.label}
              </div>
            ))}
          </div>
        </div>

        {/* Calendrier */}
        <MonthCalendar days={days} />

        {/* Statistiques améliorées */}
        <div className="stats-section">
          <div className="stats-header">
            <span className="stats-title">📊 Récapitulatif de la période</span>
            <span className="stats-subtitle">{totalDays} jours</span>
          </div>
          <div className="recap">
            <div className="stat stat-normal">
              <div className="stat-value">{counts.normal}</div>
              <div className="stat-label">Journées complètes</div>
              <div className="stat-icon">✅</div>
            </div>
            <div className="stat stat-demi">
              <div className="stat-value">{counts.demi}</div>
              <div className="stat-label">Demi-journées</div>
              <div className="stat-icon">🌓</div>
            </div>
            <div className="stat stat-sup">
              <div className="stat-value">{counts.heures_sup}</div>
              <div className="stat-label">Heures sup</div>
              <div className="stat-sub">{heuresSupTotal}h total</div>
              <div className="stat-icon">⏱️</div>
            </div>
            <div className="stat stat-double">
              <div className="stat-value">{counts.double}</div>
              <div className="stat-label">Journées doubles</div>
              <div className="stat-icon">🔁</div>
            </div>
            <div className="stat stat-absent">
              <div className="stat-value">{counts.absent}</div>
              <div className="stat-label">Absences</div>
              <div className="stat-icon">🚫</div>
            </div>
            <div className="stat stat-conge">
              <div className="stat-value">{counts.conge}</div>
              <div className="stat-label">Congés</div>
              <div className="stat-icon">🏖️</div>
            </div>
            <div className="stat stat-dimanche">
              <div className="stat-value">{counts.dimanche}</div>
              <div className="stat-label">Dimanches (repos)</div>
              <div className="stat-icon">😴</div>
            </div>
          </div>
        </div>

        {/* Tableau des montants amélioré */}
        <div className="finance-section">
          <div className="finance-header">
            <span className="finance-title">💰 Détail des montants</span>
          </div>
          <table className="detail">
            <thead>
              <tr>
                <th>Détail</th>
                <th style={{ textAlign: "right" }}>Montant</th>
              </tr>
            </thead>
            <tbody>
              <tr className="detail-row">
                <td>
                  <span className="detail-label">Salaire brut</span>
                  <span className="detail-sub">
                    {totalDays} jours de la période
                  </span>
                </td>
                <td style={{ textAlign: "right" }} className="amount-positive">
                  {fmtMoney(brut)}
                </td>
              </tr>

              {avances.length > 0 && (
                <>
                  <tr className="detail-divider">
                    <td colSpan="2">
                      <span className="divider-text">Avances</span>
                      <span className="divider-count">
                        {avances.length} avance(s)
                      </span>
                    </td>
                  </tr>
                  {avances.map((a, index) => (
                    <tr key={a.id} className="detail-row advance-row">
                      <td>
                        <span className="detail-label">
                          <span className="advance-number">#{index + 1}</span>
                          {a.date_avance}
                        </span>
                        <span className="detail-sub">
                          {a.description || "Avance"}
                        </span>
                      </td>
                      <td
                        style={{ textAlign: "right" }}
                        className="amount-negative"
                      >
                        - {fmtMoney(a.montant)}
                      </td>
                    </tr>
                  ))}
                </>
              )}

              <tr className="detail-total">
                <td>
                  <span className="total-label">Total avances</span>
                </td>
                <td style={{ textAlign: "right" }} className="amount-negative">
                  - {fmtMoney(totalAvances)}
                </td>
              </tr>

              <tr className="detail-net">
                <td>
                  <span className="net-label">💰 NET À PAYER</span>
                </td>
                <td style={{ textAlign: "right" }} className="net-amount">
                  {fmtMoney(net)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Résumé rapide des montants */}
          <div className="amount-summary">
            <div className="summary-item">
              <span className="summary-label">Brut</span>
              <span className="summary-value">{fmtMoney(brut)}</span>
            </div>
            <div className="summary-divider">−</div>
            <div className="summary-item">
              <span className="summary-label">Avances</span>
              <span className="summary-value negative">
                {fmtMoney(totalAvances)}
              </span>
            </div>
            <div className="summary-divider">=</div>
            <div className="summary-item net">
              <span className="summary-label">Net</span>
              <span className="summary-value">{fmtMoney(net)}</span>
            </div>
          </div>
        </div>

        {/* Signatures améliorées */}
        <div className="signature-section">
          <div className="signature-line">
            <div className="signature-box">
              <div className="signature-label">Signature de l'employé</div>
              <div className="signature-line-dash"></div>
            </div>
            <div className="signature-box">
              <div className="signature-label">Signature responsable</div>
              <div className="signature-line-dash"></div>
            </div>
          </div>
          <div className="signature-footer">
            <span className="footer-date">
              {new Date().toLocaleDateString("fr-FR")}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        .employee-report-wrapper {
          margin-bottom: 30px;
        }

        .employee-report {
          background: white;
          border-radius: 12px;
          padding: 16px 20px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          border: 1px solid #e9ecef;
        }

        /* En-tête */
        .rep-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid var(--brand);
          padding-bottom: 8px;
          margin-bottom: 10px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .rep-head-left {
          flex: 1;
        }

        .company-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 3px;
        }

        .logo-icon {
          font-size: 15px;
        }

        .company-name {
          font-size: 10px;
          font-weight: 700;
          color: var(--brand);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .employee-info h3 {
          margin: 0;
          font-size: 16px;
          color: var(--brand);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .employee-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 2px;
          font-size: 11px;
          color: var(--ink-soft);
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .meta-icon {
          font-size: 12px;
        }

        .meta-divider {
          color: #dee2e6;
        }

        .rep-head-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 10px;
          flex-shrink: 0;
        }

        .period-box {
          background: #f8f9fa;
          padding: 5px 12px;
          border-radius: 8px;
          text-align: right;
          border: 1px solid #e9ecef;
        }

        .period-label {
          font-size: 9px;
          font-weight: 600;
          color: var(--ink-soft);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: block;
        }

        .period-date {
          font-size: 12px;
          font-weight: 600;
          color: var(--brand);
        }

        .rep-download {
          min-width: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.3s ease;
        }

        .rep-download.loading {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
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

        /* Légende */
        .legend-section {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 6px 10px;
          margin-bottom: 10px;
        }

        .legend {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .lg-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 9px;
          color: var(--ink-soft);
        }

        .lg-swatch {
          width: 9px;
          height: 9px;
          border-radius: 3px;
          flex-shrink: 0;
          border: 1px solid rgba(0,0,0,0.05);
        }

        /* Statistiques */
        .stats-section {
          margin: 10px 0;
        }

        .stats-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .stats-title {
          font-size: 12.5px;
          font-weight: 700;
          color: var(--brand);
        }

        .stats-subtitle {
          font-size: 10px;
          color: var(--ink-soft);
          background: #f8f9fa;
          padding: 2px 10px;
          border-radius: 12px;
        }

        .recap {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
          gap: 6px;
        }

        .stat {
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 6px 8px;
          text-align: center;
          position: relative;
          background: #fafbfc;
          transition: all 0.2s ease;
        }

        .stat:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
        }

        .stat-value {
          font-size: 15px;
          font-weight: 700;
          color: var(--ink);
        }

        .stat-label {
          font-size: 8px;
          color: var(--ink-soft);
          margin-top: 1px;
        }

        .stat-sub {
          font-size: 7px;
          color: var(--ink-soft);
          opacity: 0.7;
        }

        .stat-icon {
          font-size: 12px;
          margin-top: 2px;
        }

        .stat-normal { border-left: 3px solid var(--ok); }
        .stat-demi { border-left: 3px solid var(--half); }
        .stat-sup { border-left: 3px solid var(--sup); }
        .stat-double { border-left: 3px solid var(--double); }
        .stat-absent { border-left: 3px solid var(--absent); }
        .stat-conge { border-left: 3px solid var(--conge); }
        .stat-dimanche { border-left: 3px solid var(--dimanche); }
        .stat-none { border-left: 3px solid #b3b1a8; }

       

        .presence-rate-label {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          font-weight: 600;
          color: var(--ink-soft);
          margin-bottom: 6px;
        }

        .presence-rate-value {
          color: var(--brand);
          font-size: 15px;
        }

        .presence-rate-bar {
          height: 8px;
          background: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
        }

        .presence-rate-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 1s ease;
        }

        .presence-rate-details {
          display: flex;
          justify-content: space-between;
          margin-top: 6px;
          font-size: 11px;
          color: var(--ink-soft);
        }

        /* Finance */
        .finance-section {
          margin: 10px 0;
        }

        .finance-header {
          margin-bottom: 8px;
        }

        .finance-title {
          font-size: 12.5px;
          font-weight: 700;
          color: var(--brand);
        }

        .detail {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
        }

        .detail thead th {
          text-align: left;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--ink-soft);
          padding: 4px 8px;
          border-bottom: 2px solid #e9ecef;
        }

        .detail tbody td {
          padding: 5px 8px;
          border-bottom: 1px solid #f1f3f5;
        }

        .detail-row td {
          padding: 5px 8px;
        }

        .detail-label {
          display: block;
          font-weight: 600;
          color: var(--ink);
        }

        .detail-sub {
          font-size: 9.5px;
          color: var(--ink-soft);
        }

        .amount-positive {
          color: var(--ok);
          font-weight: 600;
        }

        .amount-negative {
          color: var(--absent);
          font-weight: 600;
        }

        .detail-divider td {
          padding: 8px 8px 4px 8px;
          border-bottom: none;
        }

        .divider-text {
          font-weight: 600;
          color: var(--ink-soft);
          font-size: 11px;
        }

        .divider-count {
          font-size: 9.5px;
          color: var(--ink-soft);
          margin-left: 8px;
          background: #f8f9fa;
          padding: 1px 8px;
          border-radius: 10px;
        }

        .advance-row td {
          padding: 3px 8px;
        }

        .advance-number {
          display: inline-block;
          background: #f8f9fa;
          padding: 0 6px;
          border-radius: 4px;
          font-size: 9px;
          color: var(--ink-soft);
          margin-right: 6px;
        }

        .detail-total td {
          padding: 6px 8px;
          border-top: 2px solid #e9ecef;
          font-weight: 600;
        }

        .total-label {
          font-size: 12px;
          color: var(--ink);
        }

        .detail-net td {
          padding: 8px 8px;
          border-top: 3px solid var(--brand);
          background: #f8f9fa;
        }

        .net-label {
          font-size: 13px;
          font-weight: 700;
          color: var(--brand);
        }

        .net-amount {
          font-size: 16px;
          font-weight: 700;
          color: var(--brand);
        }

        /* Résumé des montants */
        .amount-summary {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 8px;
          padding: 8px 12px;
          background: #f8f9fa;
          border-radius: 10px;
          flex-wrap: wrap;
        }

        .summary-item {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }

        .summary-item.net {
          background: var(--brand);
          padding: 6px 16px;
          border-radius: 8px;
          color: white;
        }

        .summary-item.net .summary-label,
        .summary-item.net .summary-value {
          color: white;
        }

        .summary-label {
          font-size: 10px;
          color: var(--ink-soft);
          font-weight: 500;
        }

        .summary-value {
          font-size: 12px;
          font-weight: 700;
          color: var(--ink);
        }

        .summary-value.negative {
          color: var(--absent);
        }

        .summary-divider {
          font-size: 18px;
          color: #dee2e6;
          font-weight: 300;
        }

        /* Signatures */
        .signature-section {
          margin-top: 14px;
          padding-top: 10px;
          border-top: 2px solid #e9ecef;
        }

        .signature-line {
          display: flex;
          justify-content: space-between;
          gap: 40px;
        }

        .signature-box {
          flex: 1;
          text-align: center;
        }

        .signature-label {
          font-size: 10px;
          font-weight: 600;
          color: var(--ink-soft);
          margin-bottom: 16px;
        }

        .signature-line-dash {
          border-top: 1px dashed #dee2e6;
          margin: 0 10px;
          height: 16px;
        }

        .signature-date {
          font-size: 10px;
          color: var(--ink-soft);
          margin-top: 4px;
        }

        .signature-footer {
          display: flex;
          justify-content: space-between;
          margin-top: 8px;
          padding-top: 6px;
          border-top: 1px solid #f1f3f5;
          font-size: 9px;
          color: var(--ink-soft);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .employee-report {
            padding: 20px;
          }

          .rep-head {
            flex-direction: column;
          }

          .rep-head-right {
            align-items: stretch;
            width: 100%;
          }

          .period-box {
            text-align: center;
          }

          .rep-download {
            width: 100%;
          }

          .recap {
            grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
          }

          .signature-line {
            flex-direction: column;
            gap: 20px;
          }

          .amount-summary {
            flex-direction: column;
            gap: 8px;
          }

          .summary-divider {
            transform: rotate(90deg);
          }

          .employee-meta {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }

          .meta-divider {
            display: none;
          }
        }

        @media print {
          .employee-report {
            box-shadow: none;
            border: none;
            padding: 10px 14px;
          }

          .rep-download {
            display: none !important;
          }

          .stat:hover {
            transform: none;
          }

          .presence-rate-fill {
            transition: none;
          }
        }

        /* Version compacte du calendrier mensuel, pour que l'ensemble
           du rapport tienne sur une seule page à l'impression/PDF. */
        .month-calendar-wrapper { gap: 12px; }
        .month-block { padding: 10px; }
        .month-header { margin-bottom: 8px; padding-bottom: 6px; }
        .month-title { font-size: 13px; }
        .month-icon { font-size: 15px; }
        .month-stats { gap: 8px; font-size: 10px; }
        .month-stat { padding: 2px 8px; }
        .cal-grid { gap: 3px; }
        .cal-dow { padding: 3px 2px 4px 2px; font-size: 9px; }
        .cal-cell { min-height: 38px; padding: 3px 4px; }
        .cal-cell.empty { min-height: 14px; }
        .d-num { font-size: 10.5px; }
        .d-amount { font-size: 7.5px; padding: 0 4px; }
        .d-icon { font-size: 9px; }
        .d-label { font-size: 6.5px; }
        .month-legend { margin-top: 8px; padding-top: 6px; }
        .legend-item { font-size: 8px; padding: 1px 6px; }
      `}</style>
    </div>
  );
}
