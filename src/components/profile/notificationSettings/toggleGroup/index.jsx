import Toggle from '../../../common/toggle';
import './index.scss';

export default function ToggleGroup({
  title,
  description,
  enabled,
  locked = false,
  onToggle,
  items = [],
  onItemToggle,
}) {
  return (
    <div className="toggle-group">
      <div className="toggle-group__main">
        <div className="toggle-group__info">
          <strong>{title}</strong>
          {description && <p>{description}</p>}
        </div>
        <Toggle checked={enabled} onChange={onToggle} disabled={locked} ariaLabel={title} />
      </div>

      {items.length > 0 && (
        <ul className="toggle-group__items">
          {items.map((item) => (
            <li key={item.key} className="toggle-group__item">
              <div className="toggle-group__item-info">
                <span>{item.label}</span>
                {item.description && <p>{item.description}</p>}
              </div>
              <Toggle
                checked={item.enabled}
                onChange={(v) => onItemToggle?.(item.key, v)}
                ariaLabel={item.label}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
