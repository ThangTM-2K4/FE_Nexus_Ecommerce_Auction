import "./index.scss";

const AdminKpiCard = ({ label, value, hint, highlight, warn }) => (
  <div className={`adm-kpi ${highlight ? "highlight" : ""} ${warn ? "warn" : ""}`}>
    <span>{label}</span>
    <strong>{value}</strong>
    {hint && <small>{hint}</small>}
  </div>
);

export default AdminKpiCard;
