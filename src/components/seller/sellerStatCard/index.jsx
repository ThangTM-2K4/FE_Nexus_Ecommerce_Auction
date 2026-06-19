import AnimatedValue from "../sellerAnimatedValue";
import "./index.scss";

const StatCard = ({ label, value, trend, negative, delay = 0 }) => (
  <article
    className={`slr-stat ${negative ? "slr-stat--warn" : ""}`}
    style={{ animationDelay: `${delay}ms` }}
  >
    <span className="slr-stat__label">{label}</span>
    <strong className="slr-stat__value">
      <AnimatedValue value={value} />
    </strong>
    {trend && (
      <span className={`slr-stat__trend ${negative ? "down" : ""}`}>{trend}</span>
    )}
  </article>
);

export default StatCard;
