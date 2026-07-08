import './index.scss';

export default function Input({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = 'text',
  maxLength,
  className = '',
  ...rest
}) {
  return (
    <label className={`common-input ${className}`.trim()}>
      {label && <span className="common-input__label">{label}</span>}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className="common-input__field"
        {...rest}
      />
    </label>
  );
}
