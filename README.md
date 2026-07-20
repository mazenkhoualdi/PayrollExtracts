# Extraits de salaire — version React

Application web (React + Vite) qui lit directement votre fichier `.db` (SQLite) de
pointage/salaire/avances et génère, pour chaque employé sélectionné, un extrait avec :

- un calendrier coloré jour par jour : journée complète, demi-journée, heures sup,
  journée double, absence, congé, ou jour non pointé ;
- le récapitulatif des compteurs (nombre de jours de chaque type, heures sup cumulées) ;
- le détail des avances déduites sur la période ;
- le **net à payer** ;
- un bouton de téléchargement PDF par employé, et un bouton pour tout télécharger
  en un seul PDF groupé.

Tout se passe dans le navigateur : le fichier `.db` n'est jamais envoyé sur un serveur.

## Installation

Prérequis : [Node.js](https://nodejs.org) 18 ou plus récent.

```bash
npm install
npm run dev
```

Puis ouvrez l'adresse affichée dans le terminal (en général `http://localhost:5173`).

## Build de production

```bash
npm run build
npm run preview
```

Le dossier `dist/` généré peut être déployé sur n'importe quel hébergement statique
(Netlify, Vercel, un simple serveur web interne, etc.).

## Structure du projet

```
src/
  App.jsx                     — orchestration générale (état, génération des extraits)
  index.css                   — thème visuel
  utils/payroll.js            — logique métier : classification des jours, calcul du salaire
  components/
    UploadZone.jsx            — dépôt du fichier .db
    ConfigPanel.jsx           — période et options (majoration heures sup, congé payé)
    EmployeePicker.jsx        — sélection des employés
    MonthCalendar.jsx         — calendrier mensuel coloré
    EmployeeReport.jsx        — extrait complet d'un employé + export PDF
```

## Règles de calcul (adaptées à votre base)

La classification d'une journée est déduite du champ `heures_travaillees` et du
`type_presence` de la table `pointages` :

| Cas                                             | Type          | Montant                                   |
|--------------------------------------------------|---------------|--------------------------------------------|
| `present` + `journee_complete` + 8h              | Journée complète | 1 × salaire journalier                   |
| `present` + `demi_journee`                       | Demi-journée   | 0.5 × salaire journalier                  |
| `present` + `journee_complete` + >8h              | Heures sup     | salaire journalier + heures sup × taux horaire × majoration |
| `present` + `journee_complete` + ≥16h             | Journée double | 2 × salaire journalier                    |
| `absent`                                          | Absent         | 0                                          |
| `conge`                                           | Congé          | salaire journalier si "congé payé" est coché, sinon 0 |
| Aucune ligne pour ce jour                         | Non pointé     | 0                                          |

Les **avances** (`table avances`) sont déduites automatiquement selon leur date, si
elles tombent dans la période sélectionnée.

La table **compléments** (loyer, gasoil, transport...) n'est **pas incluse** dans le
calcul : elle n'a pas de colonne `employe_id` dans votre base, donc aucun lien fiable
vers un employé précis. Si vous voulez l'intégrer un jour, ajoutez cette colonne côté
logiciel source, et une requête pourra facilement être ajoutée dans `payroll.js`.

## Personnalisation rapide

- Majoration des heures sup et "congé payé" : modifiables directement dans
  l'interface (section 2).
- Couleurs et mise en page : `src/index.css` (variables CSS en haut du fichier).
- Règles de calcul : `src/utils/payroll.js`, fonctions `classifyDay` et `dayAmount`.
