import './index.scss';

export default function FilterTabs({ tabs, activeKey, onChange, className = '' }) {
  return (
    <div className={`account-filter-tabs ${className}`.trim()} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={activeKey === tab.key}
          className={`account-filter-tabs__item ${activeKey === tab.key ? 'is-active' : ''}`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
