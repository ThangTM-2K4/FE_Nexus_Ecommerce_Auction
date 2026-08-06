import { useEffect, useState } from "react";

function formatNow() {
  return new Date().toLocaleString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SellerRealtimeClock({ label = "Cập nhật", inline = false, tickMs = 30000, onRefresh, showRefresh = true }) {
  const [displayDate, setDisplayDate] = useState(formatNow);

  useEffect(() => {
    const id = setInterval(() => setDisplayDate(formatNow()), tickMs);
    return () => clearInterval(id);
  }, [tickMs]);

  const handleRefresh = () => {
    setDisplayDate(formatNow());
    if (onRefresh) {
      onRefresh();
    }
  };

  const refreshBtn = showRefresh ? (
    <button
      type="button"
      className={`slr-date-refresh${inline ? " slr-date-refresh--sm" : ""}`}
      onClick={handleRefresh}
      title="Làm mới thời gian và dữ liệu"
    >
      {inline ? "⟳" : "⟳ Làm mới"}
    </button>
  ) : null;

  return (
    <>
      <div className={`slr-date-display${inline ? " slr-date-display--inline" : ""}`}>
        <span className="slr-date-display__label">{label}</span>
        <time>{displayDate}</time>
        {inline && refreshBtn}
      </div>
      {!inline && refreshBtn}
    </>
  );
}
