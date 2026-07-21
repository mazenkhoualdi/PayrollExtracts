import { DOW, MONTHS, groupDaysByMonth, fmtMoney } from '../utils/payroll';

export default function MonthCalendar({ days }) {
  const months = groupDaysByMonth(days);
  const keys = Object.keys(months).sort();

  return (
    <>
      {keys.map(key => {
        const [y, m] = key.split('-').map(Number);
        const monthDays = months[key];
        const firstDow = (new Date(y, m - 1, 1).getDay() + 6) % 7; // Lundi = 0

        return (
          <div className="month-block" key={key}>
            <div className="month-title">{MONTHS[m - 1]} {y}</div>
            <div className="cal-grid">
              {DOW.map(d => <div className="cal-dow" key={d}>{d}</div>)}
              {Array.from({ length: firstDow }).map((_, i) => (
                <div className="cal-cell empty" key={'e' + i}></div>
              ))}
              {monthDays.map(d => {
                const dayNum = parseInt(d.date.slice(8, 10), 10);
                return (
                  <div
                    className={`cal-cell type-${d.type}`}
                    key={d.date}
                    title={`${d.date} — ${d.label}`}
                  >
                    <div className="d-num">{dayNum}</div>
                    <div className="d-label">{d.label}</div>
                    <div className="d-amount">{d.montant > 0 ? fmtMoney(d.montant) : ''}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}
