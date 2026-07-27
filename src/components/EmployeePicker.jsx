import { useMemo, useState } from "react";

export default function EmployeePicker({
  employees,
  selectedIds,
  setSelectedIds,
  onGenerate,
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    let result = employees;

    // Filtre par recherche
    if (term) {
      result = result.filter(
        (e) =>
          (e.nom || "").toLowerCase().includes(term) ||
          (e.prenom || "").toLowerCase().includes(term) ||
          (e.poste || "").toLowerCase().includes(term),
      );
    }

    return result;
  }, [employees, search]);

  const stats = useMemo(() => {
    const total = employees.length;
    const selected = selectedIds.size;
    return { total, selected };
  }, [employees, selectedIds]);

  function toggle(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelectedIds(new Set(employees.map((e) => e.id)));
  }

  function selectNone() {
    setSelectedIds(new Set());
  }

  return (
    <div className="card employee-picker">
      <h2>
        <span className="num">3</span>
        Sélection des employés
        <span className="badge">{stats.selected} sélectionné(s)</span>
      </h2>

      {/* Barre d'outils améliorée */}
      <div className="emp-toolbar">
        <div className="toolbar-left">
          <div className="btn-group">
            <button
              type="button"
              className="toolbar-btn select-all"
              onClick={selectAll}
              title="Sélectionner tous les employés"
            >
              <span className="icon">✅</span> Tout
            </button>
            <button
              type="button"
              className="toolbar-btn select-none"
              onClick={selectNone}
              title="Désélectionner tous les employés"
            >
              <span className="icon">❌</span> Aucun
            </button>
          </div>
        </div>

        <div className="toolbar-right">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-box"
              placeholder="Rechercher un employé..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="search-clear"
                onClick={() => setSearch("")}
                title="Effacer la recherche"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Résultats de recherche */}
      {search && (
        <div className="search-results-info">
          <span className="icon">🔍</span>
          {filtered.length === 0 ? (
            <span>
              Aucun employé ne correspond à "<strong>{search}</strong>"
            </span>
          ) : (
            <span>
              <strong>{filtered.length}</strong> employé(s) correspondent à "
              <strong>{search}</strong>"
            </span>
          )}
        </div>
      )}

      {/* Grille des employés */}
      <div className="emp-grid">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">👥</span>
            <p>Aucun employé à afficher</p>
            <small>Modifiez vos critères de recherche ou de filtrage</small>
          </div>
        ) : (
          filtered.map((emp) => (
            <div
              key={emp.id}
              className={`emp-item ${selectedIds.has(emp.id) ? "checked" : ""}`}
              onClick={() => toggle(emp.id)}
            >
              <div className="emp-checkbox">
                <input
                  type="checkbox"
                  checked={selectedIds.has(emp.id)}
                  onChange={() => toggle(emp.id)}
                  onClick={(e) => e.stopPropagation()}
                />
                {selectedIds.has(emp.id) && (
                  <span className="check-mark">✓</span>
                )}
              </div>
              <div className="emp-avatar">
                {emp.prenom ? emp.prenom[0] : emp.nom[0]}
              </div>
              <div className="who">
                <b>
                  {emp.nom} {emp.prenom || ""}
                </b>
                <span>{emp.poste || "—"}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Barre d'actions */}
      <div className="actions-bar">
        <button className="btn generate-btn" onClick={onGenerate}>
          <span className="icon">📄</span> Générer les extraits
        </button>
        <div className="actions-right">
          <span className="selection-info">
            <span className="count">{selectedIds.size}</span>
            <span className="label">employé(s) sélectionné(s)</span>
          </span>
          <span className="progress-bar">
            <span
              className="progress-fill"
              style={{
                width: `${employees.length > 0 ? (selectedIds.size / employees.length) * 100 : 0}%`,
              }}
            />
          </span>
        </div>
      </div>

      <style>{`
        .employee-picker {
          position: relative;
        }

        .badge {
          margin-left: auto;
          font-size: 11px;
          background: var(--brand);
          color: white;
          padding: 2px 12px;
          border-radius: 20px;
          font-weight: 600;
        }

        .emp-toolbar {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
        }

        .toolbar-left {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .btn-group {
          display: flex;
          gap: 4px;
          background: #f1f3f5;
          padding: 3px;
          border-radius: 8px;
        }

        .toolbar-btn {
          padding: 6px 14px;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          background: transparent;
          color: var(--ink-soft);
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .toolbar-btn .icon {
          font-size: 13px;
        }

        .toolbar-btn:hover {
          background: rgba(44, 74, 82, 0.08);
          color: var(--brand);
        }

        .toolbar-btn.select-all {
          color: var(--ok);
        }

        .toolbar-btn.select-all:hover {
          background: var(--ok-bg);
        }

        .toolbar-btn.select-none {
          color: var(--absent);
        }

        .toolbar-btn.select-none:hover {
          background: var(--absent-bg);
        }

        .toolbar-right {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          align-items: center;
        }

        .search-wrapper {
          position: relative;
          flex: 1;
          min-width: 200px;
        }

        .search-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 14px;
          opacity: 0.5;
        }

        .search-box {
          width: 100%;
          padding: 8px 12px 8px 34px;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 13px;
          transition: all 0.2s ease;
          background: white;
        }

        .search-box:focus {
          outline: none;
          border-color: var(--brand);
          box-shadow: 0 0 0 3px rgba(44, 74, 82, 0.1);
        }

        .search-clear {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--ink-soft);
          padding: 4px 8px;
          font-size: 12px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .search-clear:hover {
          background: #f1f3f5;
          color: var(--ink);
        }

        .search-results-info {
          padding: 8px 12px;
          background: #f8f9fa;
          border-radius: 6px;
          font-size: 12px;
          color: var(--ink-soft);
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .search-results-info .icon {
          font-size: 14px;
        }

        .search-results-info strong {
          color: var(--ink);
        }

        .emp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 8px;
          max-height: 400px;
          overflow-y: auto;
          padding: 4px 2px 12px 2px;
        }

        .emp-grid::-webkit-scrollbar {
          width: 6px;
        }

        .emp-grid::-webkit-scrollbar-track {
          background: #f1f3f5;
          border-radius: 3px;
        }

        .emp-grid::-webkit-scrollbar-thumb {
          background: var(--brand-2);
          border-radius: 3px;
        }

        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 40px 20px;
          color: var(--ink-soft);
        }

        .empty-icon {
          font-size: 48px;
          display: block;
          margin-bottom: 12px;
        }

        .empty-state p {
          margin: 0;
          font-weight: 500;
          font-size: 16px;
        }

        .empty-state small {
          font-size: 12px;
          opacity: 0.7;
        }

        .emp-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border: 2px solid #e9ecef;
          border-radius: 10px;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .emp-item:hover {
          border-color: var(--brand-2);
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }

        .emp-item.checked {
          background: var(--ok-bg);
          border-color: var(--ok);
        }

        .emp-checkbox {
          position: relative;
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        .emp-checkbox input[type="checkbox"] {
          width: 20px;
          height: 20px;
          cursor: pointer;
          appearance: none;
          -webkit-appearance: none;
          border: 2px solid #dee2e6;
          border-radius: 4px;
          transition: all 0.2s ease;
          background: white;
          position: relative;
        }

        .emp-checkbox input[type="checkbox"]:checked {
          background: var(--ok);
          border-color: var(--ok);
        }

        .emp-checkbox input[type="checkbox"]:checked + .check-mark {
          opacity: 1;
        }

        .check-mark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 12px;
          font-weight: 700;
          opacity: 0;
          transition: all 0.2s ease;
          pointer-events: none;
        }

        .emp-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--brand-2);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 600;
          flex-shrink: 0;
          text-transform: uppercase;
        }

        .emp-item.checked .emp-avatar {
          background: var(--ok);
        }

        .who {
          flex: 1;
          min-width: 0;
        }

        .who b {
          display: block;
          font-size: 13.5px;
          color: var(--ink);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .who span {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          color: var(--ink-soft);
          flex-wrap: wrap;
        }

        .actions-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #e9ecef;
          flex-wrap: wrap;
          gap: 12px;
        }

        .generate-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 28px;
          font-size: 15px;
        }

        .generate-btn .icon {
          font-size: 18px;
        }

        .actions-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .selection-info {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }

        .selection-info .count {
          font-size: 20px;
          font-weight: 700;
          color: var(--brand);
        }

        .selection-info .label {
          font-size: 12px;
          color: var(--ink-soft);
        }

        .progress-bar {
          width: 100px;
          height: 4px;
          background: #e9ecef;
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: var(--brand);
          border-radius: 2px;
          transition: width 0.3s ease;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .toolbar-right {
            flex-direction: column;
            width: 100%;
          }

          .search-wrapper {
            width: 100%;
          }

          .emp-grid {
            grid-template-columns: 1fr;
            max-height: 300px;
          }

          .actions-bar {
            flex-direction: column;
            align-items: stretch;
          }

          .generate-btn {
            justify-content: center;
          }

          .actions-right {
            justify-content: center;
          }

          .badge {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .btn-group {
            flex-wrap: wrap;
          }

          .toolbar-btn {
            flex: 1;
            justify-content: center;
            padding: 6px 10px;
            font-size: 11px;
          }

        }
      `}</style>
    </div>
  );
}
