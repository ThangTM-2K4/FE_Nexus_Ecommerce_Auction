import './index.scss';

export default function Radio({ label, name, value, checked, onChange, id, className = '' }) {
  return (
    <label className={`common-radio ${className}`.trim()} htmlFor={id}>
      <input
        id={id}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange?.(value)}
        className="common-radio__input"
      />
      <span className="common-radio__circle" />
      {label && <span className="common-radio__label">{label}</span>}
    </label>
  );
}
