import AnimatedValue from "../sellerAnimatedValue";
import { formatCompactCurrency, formatCurrency } from "../../../data/sellerMockData";
import { parseStatValue } from "../../../utils/parseStatValue";
import "./index.scss";

const StatCard = ({ label, value, trend, negative, delay = 0, compact }) => {
  const parsed = parseStatValue(value);
  const useCompact =
    compact ?? (parsed.type === "currency" && parsed.num >= 10_000_000);
  const fullValue =
    parsed.type === "currency" ? formatCurrency(parsed.num) : String(value);

  return (
    <article
      className={`slr-stat ${negative ? "slr-stat--warn" : ""} ${useCompact ? "slr-stat--compact" : ""}`}
      style={{ animationDelay: `${delay}ms` }}
      title={useCompact ? fullValue : undefined}
    >
      <span className="slr-stat__label">{label}</span>
      <strong className="slr-stat__value">
        {useCompact ? (
          <span className="slr-stat__value-text">{formatCompactCurrency(parsed.num)}</span>
        ) : (
          <AnimatedValue value={value} />
        )}
      </strong>
      {trend && (
        <span className={`slr-stat__trend ${negative ? "down" : ""}`}>{trend}</span>
      )}
    </article>
  );
};

export default StatCard;
