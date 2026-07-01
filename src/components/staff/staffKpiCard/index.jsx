import "./index.scss";

const StaffKpiCard = ({ label, value, hint, highlight, warn }) => (
  <div className={`stf-kpi ${highlight ? "highlight" : ""} ${warn ? "warn" : ""}`}>
    <span>{label}</span>
    <strong>{value}</strong>
    {hint && <small>{hint}</small>}
  </div>
);

export default StaffKpiCard;
