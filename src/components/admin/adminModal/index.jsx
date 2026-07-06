import { useEffect } from "react";
import "./index.scss";

const AdminModal = ({ open, title, onClose, children, wide }) => {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="adm-modal__overlay" onClick={onClose} role="presentation">
      <div
        className={`adm-modal ${wide ? "adm-modal--wide" : ""}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <header className="adm-modal__header">
          <h2>{title}</h2>
          <button type="button" className="adm-modal__close" onClick={onClose} aria-label="Đóng">
            ×
          </button>
        </header>
        <div className="adm-modal__body">{children}</div>
      </div>
    </div>
  );
};

export default AdminModal;
