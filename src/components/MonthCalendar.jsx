import { DOW, MONTHS, groupDaysByMonth, fmtMoney } from '../utils/payroll';

const TYPE_ICONS = {
  normal: '✅',
  demi: '🌓',
  heures_sup: '⏱️',
  double: '🔁',
  absent: '🚫',
  conge: '🏖️',
  autre: '📌',
  dimanche: '😴',
  sans_donnee: '❓'
};

const TYPE_LABELS = {
  normal: 'Journée complète',
  demi: 'Demi-journée',
  heures_sup: 'Heures sup',
  double: 'Journée double',
  absent: 'Absent',
  conge: 'Congé',
  autre: 'Autre',
  dimanche: 'Dimanche',
  sans_donnee: 'Non pointé'
};

export default function MonthCalendar({ days }) {
  const months = groupDaysByMonth(days);
  const keys = Object.keys(months).sort();

  return (
    <div className="month-calendar-wrapper">
      {keys.map(key => {
        const [y, m] = key.split('-').map(Number);
        const monthDays = months[key];
        const firstDow = (new Date(y, m - 1, 1).getDay() + 6) % 7; // Lundi = 0
        const lastDay = new Date(y, m, 0).getDate();
        const totalDays = monthDays.length;
        const totalAmount = monthDays.reduce((sum, d) => sum + d.montant, 0);

        return (
          <div className="month-block" key={key}>
            {/* En-tête du mois */}
            <div className="month-header">
              <div className="month-title">
                <span className="month-icon">📅</span>
                {MONTHS[m - 1]} {y}
              </div>
              <div className="month-stats">
                <span className="month-stat">
                  <span className="stat-icon">📊</span>
                  {totalDays} jours
                </span>
                <span className="month-stat">
                  <span className="stat-icon">💰</span>
                  {fmtMoney(totalAmount)}
                </span>
              </div>
            </div>

            {/* Grille du calendrier */}
            <div className="cal-grid">
              {/* Jours de la semaine */}
              {DOW.map(d => (
                <div className={`cal-dow ${d === 'Sam' || d === 'Dim' ? 'weekend' : ''}`} key={d}>
                  {d}
                </div>
              ))}

              {/* Jours vides avant le début du mois */}
              {Array.from({ length: firstDow }).map((_, i) => (
                <div className="cal-cell empty" key={'e' + i}>
                  <span className="empty-dot">•</span>
                </div>
              ))}

              {/* Jours du mois */}
              {monthDays.map((d, index) => {
                const dayNum = parseInt(d.date.slice(8, 10), 10);
                const isWeekend = (dayNum + firstDow) % 7 === 5 || (dayNum + firstDow) % 7 === 6;
                const dayOfWeek = (dayNum + firstDow - 1) % 7;

                return (
                  <div
                    className={`cal-cell type-${d.type} ${isWeekend ? 'weekend' : ''} ${d.montant > 0 ? 'has-amount' : ''}`}
                    key={d.date}
                    title={`${d.date} — ${TYPE_LABELS[d.type] || d.label}`}
                  >
                    <div className="cal-cell-content">
                      <div className="cal-cell-top">
                        <div className="d-num">{dayNum}</div>
                        {d.montant > 0 && (
                          <div className="d-amount">{fmtMoney(d.montant)}</div>
                        )}
                      </div>
                      <div className="cal-cell-bottom">
                        <span className="d-icon">{TYPE_ICONS[d.type] || '📌'}</span>
                        <span className="d-label">{d.label}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Légende du mois */}
            <div className="month-legend">
              <div className="month-legend-stats">
                {Object.entries(TYPE_ICONS).map(([type, icon]) => {
                  const count = monthDays.filter(d => d.type === type).length;
                  if (count === 0) return null;
                  return (
                    <span key={type} className={`legend-item type-${type}`}>
                      {icon} {count}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}

      <style>{`
        .month-calendar-wrapper {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .month-block {
          background: white;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #e9ecef;
          transition: all 0.2s ease;
        }

        .month-block:hover {
          border-color: var(--brand-2);
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        /* En-tête du mois */
        .month-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 2px solid #f1f3f5;
          flex-wrap: wrap;
          gap: 8px;
        }

        .month-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--brand);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .month-icon {
          font-size: 20px;
        }

        .month-stats {
          display: flex;
          gap: 16px;
          font-size: 13px;
          color: var(--ink-soft);
        }

        .month-stat {
          display: flex;
          align-items: center;
          gap: 4px;
          background: #f8f9fa;
          padding: 4px 12px;
          border-radius: 6px;
        }

        .stat-icon {
          font-size: 14px;
        }

        /* Grille du calendrier */
        .cal-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 6px;
        }

        .cal-dow {
          font-size: 11px;
          text-align: center;
          color: var(--ink-soft);
          font-weight: 600;
          padding: 6px 4px 8px 4px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .cal-dow.weekend {
          color: var(--absent);
        }

        /* Cellules */
        .cal-cell {
          border-radius: 8px;
          min-height: 72px;
          padding: 6px 8px;
          background: #fafbfc;
          border: 1px solid #f1f3f5;
          transition: all 0.2s ease;
          position: relative;
        }

        .cal-cell:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          z-index: 1;
        }

        .cal-cell.empty {
          background: transparent;
          border: none;
          min-height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cal-cell.empty:hover {
          transform: none;
          box-shadow: none;
        }

        .empty-dot {
          color: #dee2e6;
          font-size: 8px;
        }

        .cal-cell.weekend {
          opacity: 0.85;
        }

        .cal-cell.has-amount {
          border-width: 2px;
        }

        .cal-cell-content {
          display: flex;
          flex-direction: column;
          height: 100%;
          gap: 4px;
        }

        .cal-cell-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .d-num {
          font-weight: 700;
          font-size: 14px;
          color: var(--ink);
          line-height: 1.2;
        }

        .d-amount {
          font-size: 10px;
          font-weight: 600;
          color: var(--brand);
          background: rgba(44, 74, 82, 0.08);
          padding: 1px 6px;
          border-radius: 4px;
          white-space: nowrap;
        }

        .cal-cell-bottom {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: auto;
        }

        .d-icon {
          font-size: 12px;
          line-height: 1;
        }

        .d-label {
          font-size: 8.5px;
          line-height: 1.2;
          color: var(--ink-soft);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
        }

        /* Types de cellules */
        .cal-cell.type-normal {
          background: var(--ok-bg);
          border-color: rgba(74, 124, 89, 0.2);
        }
        .cal-cell.type-normal .d-num { color: var(--ok); }

        .cal-cell.type-demi {
          background: var(--half-bg);
          border-color: rgba(181, 138, 46, 0.2);
        }
        .cal-cell.type-demi .d-num { color: var(--half); }

        .cal-cell.type-heures_sup {
          background: var(--sup-bg);
          border-color: rgba(47, 102, 144, 0.2);
        }
        .cal-cell.type-heures_sup .d-num { color: var(--sup); }

        .cal-cell.type-double {
          background: var(--double-bg);
          border-color: rgba(123, 74, 143, 0.2);
        }
        .cal-cell.type-double .d-num { color: var(--double); }

        .cal-cell.type-absent {
          background: var(--absent-bg);
          border-color: rgba(168, 62, 62, 0.2);
        }
        .cal-cell.type-absent .d-num { color: var(--absent); }

        .cal-cell.type-conge {
          background: var(--conge-bg);
          border-color: rgba(107, 107, 107, 0.2);
        }
        .cal-cell.type-conge .d-num { color: var(--conge); }

        .cal-cell.type-autre {
          background: var(--autre-bg);
          border-color: rgba(166, 122, 58, 0.2);
        }
        .cal-cell.type-autre .d-num { color: var(--autre); }

        .cal-cell.type-dimanche {
          background: var(--dimanche-bg);
          border-color: rgba(90, 110, 150, 0.2);
        }
        .cal-cell.type-dimanche .d-num { color: var(--dimanche); }

        .cal-cell.type-sans_donnee {
          background: var(--none-bg);
          border-color: rgba(179, 177, 168, 0.2);
        }
        .cal-cell.type-sans_donnee .d-num { color: #b3b1a8; }

        /* Légende du mois */
        .month-legend {
          margin-top: 14px;
          padding-top: 12px;
          border-top: 1px solid #f1f3f5;
        }

        .month-legend-stats {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .legend-item {
          font-size: 11px;
          color: var(--ink-soft);
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 2px 10px;
          border-radius: 12px;
          background: #f8f9fa;
        }

        .legend-item.type-normal { background: var(--ok-bg); color: var(--ok); }
        .legend-item.type-demi { background: var(--half-bg); color: var(--half); }
        .legend-item.type-heures_sup { background: var(--sup-bg); color: var(--sup); }
        .legend-item.type-double { background: var(--double-bg); color: var(--double); }
        .legend-item.type-absent { background: var(--absent-bg); color: var(--absent); }
        .legend-item.type-conge { background: var(--conge-bg); color: var(--conge); }
        .legend-item.type-autre { background: var(--autre-bg); color: var(--autre); }
        .legend-item.type-dimanche { background: var(--dimanche-bg); color: var(--dimanche); }
        .legend-item.type-sans_donnee { background: var(--none-bg); color: #b3b1a8; }

        /* Responsive */
        @media (max-width: 768px) {
          .month-block {
            padding: 14px;
          }

          .month-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .month-stats {
            width: 100%;
            justify-content: flex-start;
          }

          .cal-grid {
            gap: 4px;
          }

          .cal-cell {
            min-height: 60px;
            padding: 4px 6px;
          }

          .d-num {
            font-size: 12px;
          }

          .d-amount {
            font-size: 8px;
            padding: 1px 4px;
          }

          .d-icon {
            font-size: 10px;
          }

          .d-label {
            font-size: 7px;
          }

          .month-legend-stats {
            gap: 6px;
          }

          .legend-item {
            font-size: 9px;
            padding: 1px 8px;
          }
        }

        @media (max-width: 480px) {
          .cal-cell {
            min-height: 50px;
            padding: 3px 4px;
          }

          .cal-grid {
            gap: 3px;
          }

          .d-num {
            font-size: 10px;
          }

          .d-amount {
            font-size: 7px;
            padding: 0 3px;
          }

          .cal-dow {
            font-size: 9px;
            padding: 4px 2px;
          }

          .month-title {
            font-size: 15px;
          }

          .month-stat {
            font-size: 11px;
            padding: 2px 8px;
          }
        }

        @media print {
          .month-block {
            border: none;
            padding: 10px 0;
            page-break-inside: avoid;
          }

          .month-block:hover {
            box-shadow: none;
          }

          .cal-cell:hover {
            transform: none;
            box-shadow: none;
          }
        }
      `}</style>
    </div>
  );
}
