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

export default function SellerRealtimeClock({ label = "Cập nhật", inline = false, tickMs = 30000 }) {
  const [displayDate, setDisplayDate] = useState(formatNow);

  useEffect(() => {
    const id = setInterval(() => setDisplayDate(formatNow()), tickMs);
    return () => clearInterval(id);
  }, [tickMs]);

  const refresh = () => setDisplayDate(formatNow());

  const refreshBtn = (
    <button
      type="button"
      className={`slr-date-refresh${inline ? " slr-date-refresh--sm" : ""}`}
      onClick={refresh}
      title="Làm mới thời gian"
    >
      {inline ? "⟳" : "⟳ Làm mới"}
    </button>
  );

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
