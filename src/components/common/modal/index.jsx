import './index.scss';

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  showBack = false,
  onBack,
  className = '',
}) {
  if (!open) return null;

  return (
    <div className="common-modal-overlay" onClick={onClose} role="presentation">
      <div
        className={`common-modal ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="common-modal__header">
          {showBack && (
            <button type="button" className="common-modal__back" onClick={onBack || onClose} aria-label="Quay lại">
              ←
            </button>
          )}
          <h2 className="common-modal__title">{title}</h2>
          {!showBack && (
            <button type="button" className="common-modal__close" onClick={onClose} aria-label="Đóng">
              ✕
            </button>
          )}
        </header>
        <div className="common-modal__body">{children}</div>
        {footer && <footer className="common-modal__footer">{footer}</footer>}
      </div>
    </div>
  );
}
