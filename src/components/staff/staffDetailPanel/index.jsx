import "./index.scss";

const StaffDetailPanel = ({ title, subtitle, onClose, children, loading, wide }) => (
  <div className="stf-panel-overlay" onClick={onClose} role="presentation">
    <div
      className={`stf-panel ${wide ? "stf-panel--wide" : ""}`}
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-label={title}
    >
      <header className="stf-panel__head">
        <div>
          {subtitle && <small className="stf-panel__kicker">{subtitle}</small>}
          <h3>{title}</h3>
        </div>
        <button type="button" className="stf-panel__close" onClick={onClose} aria-label="Đóng">
          ✕
        </button>
      </header>
      <div className="stf-panel__body">
        {loading ? <p className="stf-panel__loading">Đang tải...</p> : children}
      </div>
    </div>
  </div>
);

export default StaffDetailPanel;
