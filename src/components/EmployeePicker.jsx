import { useMemo, useState } from 'react';

export default function EmployeePicker({ employees, selectedIds, setSelectedIds, onGenerate }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return employees;
    return employees.filter(e =>
      (e.nom || '').toLowerCase().includes(term) ||
      (e.prenom || '').toLowerCase().includes(term) ||
      (e.poste || '').toLowerCase().includes(term)
    );
  }, [employees, search]);

  function toggle(id) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelectedIds(new Set(employees.map(e => e.id)));
  }
  function selectNone() {
    setSelectedIds(new Set());
  }

  return (
    <div className="card">
      <h2><span className="num">3</span>Sélection des employés</h2>
      <div className="emp-toolbar">
        <div className="links">
          <button type="button" onClick={selectAll}>Tout sélectionner</button>
          <button type="button" onClick={selectNone}>Tout désélectionner</button>
        </div>
        <input
          type="text" className="search-box" placeholder="Rechercher un employé..."
          value={search} onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="emp-grid">
        {filtered.map(emp => (
          <div
            key={emp.id}
            className={`emp-item ${selectedIds.has(emp.id) ? 'checked' : ''} ${emp.actif ? '' : 'inactive'}`}
            onClick={() => toggle(emp.id)}
          >
            <input type="checkbox" checked={selectedIds.has(emp.id)} onChange={() => toggle(emp.id)} onClick={e => e.stopPropagation()} />
            <div className="who">
              <b>{emp.nom} {emp.prenom || ''}</b>
              <span>{emp.poste || '—'}{emp.actif ? '' : ' · inactif'}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="actions-bar">
        <button className="btn" onClick={onGenerate}>Générer les extraits</button>
        <span className="hint">{selectedIds.size} employé(s) sélectionné(s)</span>
      </div>
    </div>
  );
}
