import './index.scss';

export default function Checkbox({ label, checked, onChange, id, className = '' }) {
  return (
    <label className={`common-checkbox ${className}`.trim()} htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        className="common-checkbox__input"
      />
      <span className="common-checkbox__box" />
      {label && <span className="common-checkbox__label">{label}</span>}
    </label>
  );
}
