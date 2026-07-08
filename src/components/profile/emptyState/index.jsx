import './index.scss';

export default function EmptyState({ icon = '📭', title, description, className = '' }) {
  return (
    <div className={`account-empty ${className}`.trim()}>
      <span className="account-empty__icon" aria-hidden="true">
        {icon}
      </span>
      <p className="account-empty__title">{title}</p>
      {description && <p className="account-empty__desc">{description}</p>}
    </div>
  );
}
