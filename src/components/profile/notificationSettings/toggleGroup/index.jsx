import Toggle from '../../../common/toggle';
import './index.scss';

export default function ToggleGroup({
  title,
  description,
  enabled,
  onToggle,
  items = [],
  onItemToggle,
}) {
  return (
    <div className="toggle-group">
      <div className="toggle-group__main">
        <div className="toggle-group__info">
          <strong className="toggle-group__title">{title}</strong>
          {description && <p className="toggle-group__subtitle">{description}</p>}
        </div>
        <div className="toggle-group__parent-toggle">
          <Toggle checked={enabled} onChange={onToggle} ariaLabel={title} />
        </div>
      </div>

      {items.length > 0 && (
        <ul className="toggle-group__items">
          {items.map((item) => (
            <li key={item.key} className="toggle-group__item">
              <div className="toggle-group__item-info">
                <span className="toggle-group__item-label">{item.label}</span>
                {item.description && (
                  <p className="toggle-group__item-desc">{item.description}</p>
                )}
              </div>
              <Toggle
                checked={enabled && item.enabled}
                onChange={(v) => onItemToggle?.(item.key, v)}
                disabled={!enabled}
                ariaLabel={item.label}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
