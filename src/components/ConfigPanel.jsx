export default function ConfigPanel({ config, setConfig }) {
  function update(field, value) {
    setConfig(prev => ({ ...prev, [field]: value }));
  }

  return (
    <div className="card">
      <h2><span className="num">2</span>Période et options de calcul</h2>
      <div className="row">
        <div className="field">
          <label>Du</label>
          <input type="date" value={config.start} onChange={e => update('start', e.target.value)} />
        </div>
        <div className="field">
          <label>Au</label>
          <input type="date" value={config.end} onChange={e => update('end', e.target.value)} />
        </div>
        <div className="field">
          <label>Majoration heures sup (×)</label>
          <input
            type="number" step="0.1" min="1"
            value={config.overtimeMult}
            onChange={e => update('overtimeMult', parseFloat(e.target.value) || 1)}
          />
        </div>
        <div className="field" style={{ display: 'flex', alignItems: 'flex-end' }}>
          <div className="checkbox-field">
            <input
              type="checkbox" id="congePaye"
              checked={config.congePaye}
              onChange={e => update('congePaye', e.target.checked)}
            />
            <label htmlFor="congePaye">Congé rémunéré (journée payée)</label>
          </div>
        </div>
      </div>
    
    </div>
  );
}
