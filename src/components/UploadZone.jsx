import { useRef, useState } from "react";

export default function UploadZone({ onFile, status }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState(null);
  const [fileSize, setFileSize] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  function handleFiles(files) {
    if (!files || !files.length) return;
    const file = files[0];

    // Vérification de la taille du fichier (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert("Le fichier est trop volumineux. Taille maximum : 50MB");
      return;
    }

    setFileName(file.name);
    setFileSize(file.size);

    // Simulation de progression
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    onFile(file);
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  function handleRemoveFile(e) {
    e.stopPropagation();
    setFileName(null);
    setFileSize(null);
    setUploadProgress(0);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="upload-zone-wrapper">
      <div className="card upload-card">
        <h2>
          <span className="num">1</span>
          Charger la base de données
          {status?.kind === "ok" && (
            <span className="status-badge success">✓ Chargé</span>
          )}
          {status?.kind === "err" && (
            <span className="status-badge error">✗ Erreur</span>
          )}
        </h2>

        <div
          className={`drop-zone ${fileName ? "has-file" : ""} ${dragging ? "dragging" : ""} ${status?.kind === "err" ? "error" : ""}`}
          onClick={() => inputRef.current.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".db,.sqlite,.sqlite3"
            style={{ display: "none" }}
            onChange={(e) => handleFiles(e.target.files)}
          />

          {!fileName ? (
            // État initial
            <div className="dz-content">
              <div className="dz-icon">📁</div>
              <div className="dz-title">
                <span className="dz-main">
                  Cliquez ou déposez ici le fichier
                </span>
                <span className="dz-extensions">.db · .sqlite · .sqlite3</span>
              </div>
              <div className="dz-sub">
                <span className="dz-security">🔒</span>
              </div>
            </div>
          ) : (
            // Fichier chargé
            <div className="dz-file-info">
              <div className="dz-file-header">
                <span className="dz-file-icon">📄</span>
                <div className="dz-file-details">
                  <span className="dz-file-name">{fileName}</span>
                  <span className="dz-file-size">
                    {formatFileSize(fileSize)}
                  </span>
                </div>
                <button
                  className="dz-remove-btn"
                  onClick={handleRemoveFile}
                  title="Supprimer le fichier"
                >
                  ✕
                </button>
              </div>

              {uploadProgress < 100 && (
                <div className="dz-progress">
                  <div
                    className="dz-progress-bar"
                    style={{ width: `${uploadProgress}%` }}
                  />
                  <span className="dz-progress-text">{uploadProgress}%</span>
                </div>
              )}

              {uploadProgress === 100 && (
                <div className="dz-success">
                  <span className="dz-success-icon">✅</span>
                  <span className="dz-success-text">
                    Fichier chargé avec succès
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {status && (
          <div className={`status-line ${status.kind || ""}`}>
            <span className="status-icon">
              {status.kind === "ok" && "✅"}
              {status.kind === "err" && "❌"}
              {!status.kind && "ℹ️"}
            </span>
            {status.msg}
          </div>
        )}

        <div className="upload-footer">
          <div className="upload-features"></div>
        </div>
      </div>

      <style>{`
        .upload-zone-wrapper {
          margin-bottom: 24px;
        }

        .upload-card {
          position: relative;
          transition: all 0.3s ease;
        }

        .status-badge {
          margin-left: auto;
          font-size: 11px;
          padding: 2px 14px;
          border-radius: 20px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .status-badge.success {
          background: var(--ok-bg);
          color: var(--ok);
        }

        .status-badge.error {
          background: var(--absent-bg);
          color: var(--absent);
        }

        .drop-zone {
          border: 2px dashed #ced4da;
          border-radius: 12px;
          padding: 40px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: #fafbfc;
          position: relative;
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .drop-zone:hover {
          border-color: var(--brand-2);
          background: #f8f9fa;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.04);
        }

        .drop-zone.dragging {
          border-color: var(--brand);
          background: rgba(44, 74, 82, 0.05);
          transform: scale(1.02);
          box-shadow: 0 0 0 4px rgba(44, 74, 82, 0.1);
        }

        .drop-zone.has-file {
          border-style: solid;
          border-color: var(--ok);
          background: var(--ok-bg);
          padding: 24px 20px;
          min-height: 120px;
        }

        .drop-zone.has-file:hover {
          border-color: var(--ok);
          background: var(--ok-bg);
        }

        .drop-zone.error {
          border-color: var(--absent);
          background: var(--absent-bg);
        }

        /* État initial */
        .dz-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .dz-icon {
          font-size: 48px;
          opacity: 0.6;
          transition: all 0.3s ease;
        }

        .drop-zone:hover .dz-icon {
          opacity: 1;
          transform: scale(1.1);
        }

        .dz-title {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .dz-main {
          font-size: 18px;
          font-weight: 600;
          color: var(--brand);
        }

        .dz-extensions {
          font-size: 13px;
          color: var(--ink-soft);
          font-weight: 400;
        }

        .dz-sub {
          font-size: 13px;
          color: var(--ink-soft);
          display: flex;
          align-items: center;
          gap: 6px;
          background: #f8f9fa;
          padding: 6px 16px;
          border-radius: 20px;
          margin-top: 4px;
        }

        .dz-security {
          font-size: 14px;
        }

        /* État fichier chargé */
        .dz-file-info {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .dz-file-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .dz-file-icon {
          font-size: 32px;
        }

        .dz-file-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 2px;
        }

        .dz-file-name {
          font-size: 15px;
          font-weight: 600;
          color: var(--ink);
          word-break: break-all;
          text-align: left;
        }

        .dz-file-size {
          font-size: 12px;
          color: var(--ink-soft);
        }

        .dz-remove-btn {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 50%;
          background: rgba(168, 62, 62, 0.1);
          color: var(--absent);
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .dz-remove-btn:hover {
          background: var(--absent);
          color: white;
          transform: rotate(90deg);
        }

        /* Progression */
        .dz-progress {
          width: 100%;
          height: 6px;
          background: #e9ecef;
          border-radius: 3px;
          overflow: hidden;
          position: relative;
        }

        .dz-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, var(--brand), var(--brand-2));
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .dz-progress-text {
          position: absolute;
          right: 0;
          top: -18px;
          font-size: 10px;
          font-weight: 600;
          color: var(--brand);
        }

        /* Succès */
        .dz-success {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: rgba(74, 124, 89, 0.1);
          border-radius: 8px;
          border: 1px solid var(--ok);
        }

        .dz-success-icon {
          font-size: 18px;
        }

        .dz-success-text {
          font-size: 13px;
          font-weight: 500;
          color: var(--ok);
        }

        /* Status line */
        .status-line {
          margin-top: 16px;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 13.5px;
          color: var(--ink-soft);
          background: #f8f9fa;
          display: flex;
          align-items: center;
          gap: 10px;
          border-left: 4px solid #dee2e6;
          transition: all 0.3s ease;
        }

        .status-line.ok {
          border-left-color: var(--ok);
          background: var(--ok-bg);
          color: var(--ok);
        }

        .status-line.err {
          border-left-color: var(--absent);
          background: var(--absent-bg);
          color: var(--absent);
        }

        .status-icon {
          font-size: 18px;
          flex-shrink: 0;
        }

        /* Footer */
        .upload-footer {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #e9ecef;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        .upload-features {
          display: flex;
          gap: 16px;
        }

        .feature {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: var(--ink-soft);
        }

        .feature-icon {
          font-size: 14px;
        }

        .upload-help {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--ink-soft);
        }

        .help-text {
          font-weight: 500;
          color: var(--brand);
        }

        .help-detail {
          opacity: 0.7;
          font-size: 11px;
        }

        /* Animation */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .dz-file-info {
          animation: fadeIn 0.3s ease;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .drop-zone {
            padding: 30px 16px;
            min-height: 160px;
          }

          .dz-main {
            font-size: 15px;
          }

          .dz-icon {
            font-size: 36px;
          }

          .dz-sub {
            font-size: 12px;
            padding: 4px 12px;
          }

          .upload-footer {
            flex-direction: column;
            align-items: flex-start;
          }

          .upload-features {
            flex-wrap: wrap;
          }

          .upload-help {
            flex-wrap: wrap;
          }
        }

        @media (max-width: 480px) {
          .drop-zone {
            padding: 20px 12px;
            min-height: 120px;
          }

          .dz-file-header {
            flex-wrap: wrap;
          }

          .dz-file-name {
            font-size: 13px;
          }

          .dz-remove-btn {
            width: 28px;
            height: 28px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}
