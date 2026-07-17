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
  error,
  ...rest
}) {
  return (
    <label className={`common-input ${error ? 'common-input--error' : ''} ${className}`.trim()}>
      {label && <span className="common-input__label">{label}</span>}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className="common-input__field"
        aria-invalid={error ? 'true' : undefined}
        {...rest}
      />
      {error && <span className="common-input__error">{error}</span>}
    </label>
  );
}
