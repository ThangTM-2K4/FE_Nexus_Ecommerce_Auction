import { useCountUp } from "../../../hooks/useCountUp";
import { formatAnimatedValue, parseStatValue } from "../../../utils/parseStatValue";

const AnimatedValue = ({ value, className = "", duration = 500 }) => {
  const parsed = parseStatValue(value);
  const current = useCountUp(parsed.num, { duration });
  const display = formatAnimatedValue(parsed, current);

  return (
    <span className={`slr-animated-value ${className}`} data-value={value}>
      {display}
    </span>
  );
};

export default AnimatedValue;
