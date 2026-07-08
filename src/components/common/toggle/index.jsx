import './index.scss';

export default function Toggle({ checked, onChange, disabled = false, id, ariaLabel }) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      className={`common-toggle ${checked ? 'is-on' : ''} ${disabled ? 'is-disabled' : ''}`}
      onClick={() => !disabled && onChange?.(!checked)}
      disabled={disabled}
    >
      <span className="common-toggle__thumb" />
    </button>
  );
}
