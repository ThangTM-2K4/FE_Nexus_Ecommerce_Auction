import AnimatedValue from "../sellerAnimatedValue";
import "./index.scss";

const KpiCard = ({ label, value, hint, highlight, warn, delay = 0 }) => (
  <div
    className={`slr-kpi ${highlight ? "highlight" : ""} ${warn ? "warn" : ""}`}
    style={{ animationDelay: `${delay}ms` }}
  >
    <span>{label}</span>
    <strong>
      <AnimatedValue value={value} />
    </strong>
    {hint && <small>{hint}</small>}
  </div>
);

export default KpiCard;
