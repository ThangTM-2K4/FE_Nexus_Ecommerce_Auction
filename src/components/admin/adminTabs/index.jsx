import "./index.scss";

const AdminTabs = ({ tabs, active, onChange }) => (
  <div className="adm-tabs" role="tablist">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        type="button"
        role="tab"
        aria-selected={active === tab.id}
        className={`adm-tabs__item ${active === tab.id ? "active" : ""}`}
        onClick={() => onChange(tab.id)}
      >
        {tab.label}
        {tab.count != null && <span className="adm-tabs__count">{tab.count}</span>}
        {active === tab.id && <span className="adm-tabs__indicator" />}
      </button>
    ))}
  </div>
);

export default AdminTabs;
