export const DOW = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
export const MONTHS = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

export const LEGEND = [
  { type: "normal", label: "Journée complète" },
  { type: "demi", label: "Demi-journée" },
  { type: "heures_sup", label: "Heures sup" },
  { type: "double", label: "Journée double" },
  { type: "absent", label: "Absent" },
  { type: "conge", label: "Congé" },
  { type: "autre", label: "Autre" },
  { type: "dimanche", label: "Dimanche (repos)" },
  { type: "sans_donnee", label: "Non pointé" },
];

/**
 * Détermine le type d'une journée à partir de la ligne "pointages" correspondante.
 * Règles déduites des données réelles :
 *   8h  + journee_complete -> journée normale
 *   4h  + demi_journee     -> demi-journée
 *   10h + journee_complete -> heures sup (8h de base + 2h sup)
 *   16h + journee_complete -> journée double
 *   absent                 -> absent (0 DT)
 *   conge                  -> congé (payé ou non selon l'option congePaye)
 */
export function classifyDay(row, date) {
  if (!row) {
    // Un dimanche sans pointage est un jour de repos normal, pas une anomalie :
    // on ne le marque "Non pointé" que si l'employé a effectivement pu travailler.
    // Si l'employé a travaillé un dimanche, une ligne "pointages" existe pour cette
    // date et ce cas n'est donc jamais atteint (voir branche statut === 'present' ci-dessous).
    if (date && isSunday(date)) {
      return { type: "dimanche", label: "Dimanche", heures: 0 };
    }
    return { type: "sans_donnee", label: "Non pointé", heures: 0 };
  }
  const { statut, type_presence, heures_travaillees } = row;
  const heures = heures_travaillees || 0;

  if (statut === "absent")
    return { type: "absent", label: "Absent", heures: 0 };
  if (statut === "conge") return { type: "conge", label: "Congé", heures };

  if (statut === "present") {
    if (type_presence === "demi_journee")
      return { type: "demi", label: "Demi-journée", heures };
    if (heures >= 16)
      return { type: "double", label: "Journée double", heures };
    if (heures > 8)
      return { type: "heures_sup", label: `+${heures - 8}h sup`, heures };
    if (heures === 8)
      return { type: "normal", label: "Journée complète", heures };
    if (heures === 0)
      return { type: "autre", label: "Présent (0h notée)", heures };
    return { type: "autre", label: `${heures}h`, heures };
  }

  return { type: "autre", label: statut || "—", heures };
}

/** Vrai si la date (YYYY-MM-DD) tombe un dimanche. */
function isSunday(dateStr) {
  return new Date(dateStr + "T00:00:00").getDay() === 0;
}

/** Calcule le montant dû pour une journée classifiée. */
export function dayAmount(dayType, salaireJournalier, overtimeMult, congePaye) {
  const hourly = salaireJournalier / 8;
  switch (dayType.type) {
    case "normal":
      return salaireJournalier;
    case "demi":
      return salaireJournalier * 0.5;
    case "double":
      return salaireJournalier * 2;
    case "heures_sup": {
      const extra = dayType.heures - 8;
      return salaireJournalier + extra * hourly * overtimeMult;
    }
    case "conge":
      return congePaye ? salaireJournalier : 0;
    case "autre":
      return dayType.heures > 0 ? dayType.heures * hourly : 0;
    case "absent":
    case "sans_donnee":
    case "dimanche":
    default:
      return 0;
  }
}

/** Formate une Date en YYYY-MM-DD à partir de ses composantes locales (évite le décalage UTC de toISOString). */
function toLocalISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Liste des dates (YYYY-MM-DD) entre start et end inclus. */
export function dateRangeArray(start, end) {
  const dates = [];
  let cur = new Date(start + "T00:00:00");
  const last = new Date(end + "T00:00:00");
  while (cur <= last) {
    dates.push(toLocalISODate(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

export function groupDaysByMonth(days) {
  const months = {};
  days.forEach((d) => {
    const key = d.date.slice(0, 7);
    if (!months[key]) months[key] = [];
    months[key].push(d);
  });
  return months;
}

export function formatPeriodLabel(start, end) {
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  const f = (d) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  return `${f(s)} — ${f(e)}`;
}

/**
 * Construit l'extrait complet d'un employé sur une période donnée.
 * @param {object} db - instance sql.js
 * @param {object} emp - ligne "employes"
 * @param {string} start - YYYY-MM-DD
 * @param {string} end - YYYY-MM-DD
 * @param {number} overtimeMult - majoration des heures sup (ex: 1.5)
 * @param {boolean} congePaye - si le congé est rémunéré
 */
export function buildEmployeeReport(
  db,
  emp,
  start,
  end,
  overtimeMult,
  congePaye
) {
  const pointages = queryAll(
    db,
    "SELECT * FROM pointages WHERE employe_id = ? AND date_pointage >= ? AND date_pointage <= ?",
    [emp.id, start, end]
  );
  const byDate = {};
  pointages.forEach((p) => {
    byDate[p.date_pointage] = p;
  });

  const avances = queryAll(
    db,
    "SELECT * FROM avances WHERE employe_id = ? AND date_avance >= ? AND date_avance <= ? ORDER BY date_avance",
    [emp.id, start, end]
  );

  const days = dateRangeArray(start, end).map((d) => {
    const row = byDate[d];
    const dt = classifyDay(row, d);
    const montant = dayAmount(
      dt,
      emp.salaire_journalier,
      overtimeMult,
      congePaye
    );
    return { date: d, ...dt, montant };
  });

  const counts = {
    normal: 0,
    demi: 0,
    heures_sup: 0,
    double: 0,
    absent: 0,
    conge: 0,
    autre: 0,
    dimanche: 0,
    sans_donnee: 0,
  };
  let heuresSupTotal = 0;
  let brut = 0;
  days.forEach((d) => {
    counts[d.type] = (counts[d.type] || 0) + 1;
    if (d.type === "heures_sup") heuresSupTotal += d.heures - 8;
    brut += d.montant;
  });

  const totalAvances = avances.reduce((s, a) => s + a.montant, 0);
  const net = brut - totalAvances;

  return {
    emp,
    days,
    counts,
    heuresSupTotal,
    brut,
    avances,
    totalAvances,
    net,
  };
}

/** Petit helper pour exécuter une requête paramétrée et récupérer un tableau d'objets. */
export function queryAll(db, sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

export function fmtMoney(n) {
  return (
    (Math.round(n * 1000) / 1000).toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 3,
    }) + " DT"
  );
}
