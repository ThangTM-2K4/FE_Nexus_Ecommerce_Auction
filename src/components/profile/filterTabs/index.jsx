import './index.scss';

function TabLabel({ label, count }) {
  return (
    <>
      <span className="account-filter-tabs__option-label">{label}</span>
      {count != null && <span className="account-filter-tabs__count">{count}</span>}
    </>
  );
}

export default function FilterTabs({ tabs, activeKey, onChange, className = '' }) {
  return (
    <div className={`account-filter-tabs-wrap ${className}`.trim()}>
      <div className="account-filter-tabs" role="tablist" aria-label="Bộ lọc trạng thái">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeKey === tab.key}
            className={`account-filter-tabs__item ${activeKey === tab.key ? 'is-active' : ''}`}
            onClick={() => onChange(tab.key)}
          >
            <TabLabel label={tab.label} count={tab.count} />
          </button>
        ))}
      </div>
    </div>
  );
}
