import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './index.scss';

export default function PasswordInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  className = '',
}) {
  const [visible, setVisible] = useState(false);

  return (
    <label className={`common-password-input ${className}`.trim()}>
      {label && <span className="common-password-input__label">{label}</span>}
      <div className="common-password-input__wrap">
        <input
          type={visible ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="common-password-input__field"
          autoComplete="off"
        />
        <button
          type="button"
          className="common-password-input__toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        >
          {visible ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
    </label>
  );
}
