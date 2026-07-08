import './index.scss';

export default function SearchField({
  value,
  onChange,
  placeholder = 'Tìm kiếm...',
  className = '',
  onSubmit,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(value);
  };

  return (
    <form className={`account-search ${className}`.trim()} role="search" onSubmit={handleSubmit}>
      <span className="account-search__icon" aria-hidden="true">
        ⌕
      </span>
      <input
        type="search"
        className="account-search__input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </form>
  );
}
