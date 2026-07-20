import { useRef, useState } from 'react';

export default function UploadZone({ onFile, status }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState(null);

  function handleFiles(files) {
    if (!files || !files.length) return;
    setFileName(files[0].name);
    onFile(files[0]);
  }

  return (
    <div className="card">
      <h2><span className="num">1</span>Charger la base de données</h2>
      <div
        className={`drop-zone ${fileName ? 'has-file' : ''}`}
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
        style={dragging ? { background: '#f1f5f2' } : undefined}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".db,.sqlite,.sqlite3"
          style={{ display: 'none' }}
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="dz-title">{fileName ? `✓ ${fileName}` : 'Cliquez ou déposez ici le fichier .db'}</div>
        <div className="dz-sub">Ex : rh_backup.db — tout reste dans votre navigateur, rien n'est envoyé sur internet.</div>
      </div>
      {status && (
        <div className={`status-line ${status.kind || ''}`}>{status.msg}</div>
      )}
    </div>
  );
}
