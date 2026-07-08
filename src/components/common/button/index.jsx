import './index.scss';

export default function Button({
  children,
  variant = 'accent',
  type = 'button',
  disabled = false,
  onClick,
  className = '',
}) {
  return (
    <button
      type={type}
      className={`common-btn common-btn--${variant} ${disabled ? 'is-disabled' : ''} ${className}`.trim()}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
