import './index.scss';

export default function Select({ label, name, value, onChange, options = [], placeholder, className = '' }) {
  return (
    <label className={`common-select ${className}`.trim()}>
      {label && <span className="common-select__label">{label}</span>}
      <select name={name} value={value} onChange={onChange} className="common-select__field">
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
