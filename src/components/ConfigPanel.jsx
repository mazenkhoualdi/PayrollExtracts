export default function ConfigPanel({ config, setConfig }) {
  function update(field, value) {
    setConfig(prev => ({ ...prev, [field]: value }));
  }

  return (
    <div className="card">
      <h2>
        <span className="num">2</span>
        Période et options de calcul
      </h2>
      
      <div className="config-grid">
        {/* Section Dates */}
        <div className="config-section">
          <div className="section-label">
            <span className="icon">📅</span>
            Période de calcul
          </div>
          <div className="date-row">
            <div className="field">
              <label>
                <span className="label-icon">📅</span>
                Date de début
              </label>
              <input 
                type="date" 
                value={config.start} 
                onChange={e => update('start', e.target.value)} 
                className="date-input"
              />
            </div>
            <div className="date-arrow">→</div>
            <div className="field">
              <label>
                <span className="label-icon">📅</span>
                Date de fin
              </label>
              <input 
                type="date" 
                value={config.end} 
                onChange={e => update('end', e.target.value)} 
                className="date-input"
              />
            </div>
          </div>
        </div>

        {/* Section Options */}
        <div className="config-section">
          <div className="section-label">
            <span className="icon">⚙️</span>
            Options de calcul
          </div>
          <div className="options-row">
            <div className="field">
              <label>
                <span className="label-icon">⏱️</span>
                Majoration heures sup
              </label>
              <div className="input-with-suffix">
                <input
                  type="number" 
                  step="0.1" 
                  min="1"
                  value={config.overtimeMult}
                  onChange={e => update('overtimeMult', parseFloat(e.target.value) || 1)}
                  className="number-input"
                />
                <span className="input-suffix">×</span>
              </div>
              <small className="field-hint">Ex: 1.5 = 50% de majoration</small>
            </div>

            <div className="field toggle-field">
              <label className="toggle-label">
                <span className="label-icon">🏖️</span>
                Congé rémunéré
              </label>
              <div className="toggle-container">
                <input
                  type="checkbox"
                  id="congePaye"
                  checked={config.congePaye}
                  onChange={e => update('congePaye', e.target.checked)}
                  className="toggle-input"
                />
                <label htmlFor="congePaye" className="toggle-slider">
                  <span className="toggle-off">❌</span>
                  <span className="toggle-on">✅</span>
                </label>
                <span className="toggle-status">
                  {config.congePaye ? 'Payé' : 'Non payé'}
                </span>
              </div>
              <small className="field-hint">
                Les jours de congé sont-ils rémunérés ?
              </small>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .config-grid {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .config-section {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 16px 20px;
          border: 1px solid #e9ecef;
          transition: all 0.2s ease;
        }

        .config-section:hover {
          border-color: var(--brand-2);
          background: #f8faf9;
        }

        .section-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--brand);
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .section-label .icon {
          font-size: 16px;
        }

        .date-row {
          display: flex;
          align-items: flex-end;
          gap: 16px;
          flex-wrap: wrap;
        }

        .date-arrow {
          font-size: 20px;
          color: var(--brand-2);
          padding-bottom: 8px;
          font-weight: 300;
        }

        .field {
          flex: 1;
          min-width: 160px;
        }

        .field label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--ink-soft);
          margin-bottom: 6px;
        }

        .label-icon {
          font-size: 14px;
        }

        .date-input,
        .number-input {
          width: 100%;
          padding: 10px 12px;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 14px;
          font-family: inherit;
          background: white;
          transition: all 0.2s ease;
          color: var(--ink);
        }

        .date-input:hover,
        .number-input:hover {
          border-color: var(--brand-2);
        }

        .date-input:focus,
        .number-input:focus {
          outline: none;
          border-color: var(--brand);
          box-shadow: 0 0 0 3px rgba(44, 74, 82, 0.1);
        }

        .input-with-suffix {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-with-suffix .number-input {
          padding-right: 40px;
        }

        .input-suffix {
          position: absolute;
          right: 12px;
          font-size: 16px;
          font-weight: 600;
          color: var(--brand);
          pointer-events: none;
        }

        .field-hint {
          display: block;
          font-size: 11px;
          color: var(--ink-soft);
          margin-top: 4px;
          opacity: 0.7;
        }

        .options-row {
          display: flex;
          gap: 32px;
          flex-wrap: wrap;
          align-items: flex-start;
        }

        .toggle-field {
          flex: 1;
          min-width: 200px;
        }

        .toggle-container {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-top: 2px;
        }

        .toggle-input {
          display: none;
        }

        .toggle-slider {
          position: relative;
          width: 52px;
          height: 28px;
          background: #dee2e6;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          padding: 0 4px;
          flex-shrink: 0;
        }

        .toggle-input:checked + .toggle-slider {
          background: var(--ok);
        }

        .toggle-slider .toggle-off,
        .toggle-slider .toggle-on {
          font-size: 14px;
          transition: all 0.3s ease;
          position: absolute;
        }

        .toggle-slider .toggle-off {
          opacity: 1;
          transform: translateX(0);
        }

        .toggle-slider .toggle-on {
          opacity: 0;
          transform: translateX(20px);
        }

        .toggle-input:checked + .toggle-slider .toggle-off {
          opacity: 0;
          transform: translateX(-20px);
        }

        .toggle-input:checked + .toggle-slider .toggle-on {
          opacity: 1;
          transform: translateX(0);
        }

        .toggle-slider::after {
          content: '';
          position: absolute;
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          left: 4px;
        }

        .toggle-input:checked + .toggle-slider::after {
          transform: translateX(24px);
        }

        .toggle-status {
          font-size: 13px;
          font-weight: 600;
          color: var(--ink);
          min-width: 70px;
        }

        .toggle-status:has(+ .toggle-input:checked) {
          color: var(--ok);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .date-row {
            flex-direction: column;
            align-items: stretch;
          }

          .date-arrow {
            text-align: center;
            padding: 4px 0;
            transform: rotate(90deg);
          }

          .options-row {
            flex-direction: column;
            gap: 16px;
          }

          .config-section {
            padding: 14px 16px;
          }
        }

        @media (max-width: 480px) {
          .field {
            min-width: 100%;
          }

          .toggle-container {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
}