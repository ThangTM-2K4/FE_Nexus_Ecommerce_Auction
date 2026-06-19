import AnimatedValue from "../sellerAnimatedValue";
import "./index.scss";

const MiniStat = ({ label, value, warn, delay = 0 }) => (
  <div
    className={`slr-mini-stat ${warn ? "warn" : ""}`}
    style={{ animationDelay: `${delay}ms` }}
  >
    <span>{label}</span>
    <strong>
      <AnimatedValue value={value} />
    </strong>
  </div>
);

export default MiniStat;
