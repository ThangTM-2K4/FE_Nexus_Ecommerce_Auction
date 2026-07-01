import { useEffect, useState } from "react";

const AnimatedBar = ({ percent, delay = 0 }) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(percent), 80 + delay);
    return () => clearTimeout(timer);
  }, [percent, delay]);

  return (
    <div
      className="bar slr-bar-animate"
      style={{ width: `${width}%` }}
    />
  );
};

export default AnimatedBar;
