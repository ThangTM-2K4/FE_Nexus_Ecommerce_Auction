import "./index.scss";

const AdminTabOverview = ({ title, description, stats = [] }) => (
  <section className="adm-tab-overview" aria-label={title || "Tổng quan tab"}>
    {(title || description) && (
      <div className="adm-tab-overview__head">
        {title && <h4>{title}</h4>}
        {description && <p>{description}</p>}
      </div>
    )}
    <div className="adm-tab-overview__stats">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`adm-tab-overview__stat${stat.highlight ? " adm-tab-overview__stat--highlight" : ""}${stat.warn ? " adm-tab-overview__stat--warn" : ""}`}
        >
          <span className="adm-tab-overview__stat-val">{stat.value}</span>
          <span className="adm-tab-overview__stat-label">{stat.label}</span>
          {stat.hint && <span className="adm-tab-overview__stat-hint">{stat.hint}</span>}
        </div>
      ))}
    </div>
  </section>
);

export default AdminTabOverview;
