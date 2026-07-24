import { useRef } from 'react';
import html2pdf from 'html2pdf.js';
import MonthCalendar from './MonthCalendar';
import { LEGEND, fmtMoney, formatPeriodLabel } from '../utils/payroll';

const LEGEND_COLORS = {
  normal: 'var(--ok)',
  demi: 'var(--half)',
  heures_sup: 'var(--sup)',
  double: 'var(--double)',
  absent: 'var(--absent)',
  conge: 'var(--conge)',
  autre: 'var(--autre)',
  sans_donnee: '#b3b1a8',
};

export default function EmployeeReport({ report, start, end }) {
  const ref = useRef(null);
  const { emp, days, counts, heuresSupTotal, brut, avances, totalAvances, net } = report;
  const periodLabel = formatPeriodLabel(start, end);

  function downloadPdf() {
    const el = ref.current;
    const noPrintEls = el.querySelectorAll('.no-print');
    noPrintEls.forEach(n => (n.style.visibility = 'hidden'));
    const opt = {
      margin: 8,
      filename: `extrait_salaire_${emp.nom}_${emp.prenom || ''}`.replace(/\s+/g, '_') + '.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };
    html2pdf().set(opt).from(el).save().then(() => {
      noPrintEls.forEach(n => (n.style.visibility = 'visible'));
    });
  }

  return (
    <div className="employee-report" ref={ref}>
      <div className="rep-head">
        <div>
          <div className="company">Extrait de salaire</div>
          <h3>{emp.nom} {emp.prenom || ''}</h3>
          <div className="poste">{emp.poste || ''} · Salaire journalier de base : {fmtMoney(emp.salaire_journalier)}</div>
        </div>
        <div className="periode">
          Période<b>{periodLabel}</b>
          <button className="btn small rep-download no-print" onClick={downloadPdf}>⬇ Télécharger PDF</button>
        </div>
      </div>

      <div className="legend">
        {LEGEND.map(l => (
          <div className="lg-item" key={l.type}>
            <span className="lg-swatch" style={{ background: LEGEND_COLORS[l.type] }}></span>
            {l.label}
          </div>
        ))}
      </div>

      <MonthCalendar days={days} />

      <div className="recap">
        <div className="stat"><div className="n">{counts.normal}</div><div className="l">Journées complètes</div></div>
        <div className="stat"><div className="n">{counts.demi}</div><div className="l">Demi-journées</div></div>
        <div className="stat"><div className="n">{counts.heures_sup}</div><div className="l">Jours avec heures sup ({heuresSupTotal}h)</div></div>
        <div className="stat"><div className="n">{counts.double}</div><div className="l">Journées doubles</div></div>
        <div className="stat"><div className="n">{counts.absent}</div><div className="l">Absences</div></div>
        <div className="stat"><div className="n">{counts.conge}</div><div className="l">Congés</div></div>
        <div className="stat"><div className="n">{counts.sans_donnee}</div><div className="l">Jours non pointés</div></div>
      </div>

      <table className="detail">
        <thead>
          <tr><th>Date</th><th>Détail</th><th style={{ textAlign: 'right' }}>Montant</th></tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={2}>Salaire brut calculé ({days.length} jours de la période)</td>
            <td style={{ textAlign: 'right' }}>{fmtMoney(brut)}</td>
          </tr>
          <tr>
            <td colSpan={3} style={{ paddingTop: 14, fontWeight: 700, borderBottom: 'none' }}>
              Avances déduites sur la période
            </td>
          </tr>
          {avances.length === 0 ? (
            <tr><td colSpan={3} style={{ color: 'var(--ink-soft)' }}>Aucune avance sur la période</td></tr>
          ) : (
            avances.map(a => (
              <tr key={a.id}>
                <td>{a.date_avance}</td>
                <td>{a.description || 'Avance'}</td>
                <td style={{ textAlign: 'right' }}>{fmtMoney(a.montant)}</td>
              </tr>
            ))
          )}
          <tr className="total-row">
            <td colSpan={2}>Total avances</td>
            <td style={{ textAlign: 'right' }}>- {fmtMoney(totalAvances)}</td>
          </tr>
          <tr className="net-row">
            <td colSpan={2}>NET À PAYER</td>
            <td style={{ textAlign: 'right' }}>{fmtMoney(net)}</td>
          </tr>
        </tbody>
      </table>

      <div className="signature-line">
        <div><div className="sig-box">Signature de l'employé</div></div>
        <div><div className="sig-box">Signature responsable RH</div></div>
      </div>
    </div>
  );
}
