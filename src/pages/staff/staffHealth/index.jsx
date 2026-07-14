import { useEffect, useState } from "react";
import StaffPageHeader from "../../../components/staff/staffPageHeader";
import StaffKpiCard from "../../../components/staff/staffKpiCard";
import { getSystemHealth } from "../../../services/staffService";
import "./index.scss";

const STATUS_LABEL = { up: "Hoạt động", degraded: "Chậm", down: "Lỗi" };

const StaffHealth = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getSystemHealth().then((data) => {
      setHealth(data);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const overallOk = health?.overall === "healthy";

  return (
    <div className="stf-health">
      <StaffPageHeader
        kicker="Giám sát"
        title="Sức khoẻ hệ thống"
        subtitle="Xem trạng thái dịch vụ — không được sửa cấu hình hệ thống."
      />

      <div className="stf-health__refresh">
        <button type="button" onClick={load} disabled={loading}>
          {loading ? "Đang kiểm tra..." : "Làm mới"}
        </button>
      </div>

      {loading ? (
        <p className="stf-health__empty">Đang kiểm tra...</p>
      ) : health && (
        <>
          <div className={`stf-health__banner stf-health__banner--${health.overall}`}>
            <strong>{overallOk ? "Hệ thống ổn định" : "Cần theo dõi"}</strong>
            <span>Cập nhật lúc {health.checkedAt}</span>
          </div>

          <div className="stf-health__kpis">
            <StaffKpiCard label="User đang online" value={String(health.metrics.activeUsers)} hint="Realtime" highlight />
            <StaffKpiCard label="Requests/phút" value={String(health.metrics.requestsPerMin)} hint="API Gateway" />
            <StaffKpiCard label="Tỷ lệ lỗi" value={health.metrics.errorRate} hint="5 phút gần nhất" warn={parseFloat(health.metrics.errorRate) > 0.5} />
            <StaffKpiCard label="Phản hồi TB" value={health.metrics.avgResponse} hint="P95 latency" />
          </div>

          <div className="stf-health__services">
            <h3>Dịch vụ</h3>
            <ul>
              {health.services.map((svc) => (
                <li key={svc.id} className={`stf-health__svc stf-health__svc--${svc.status}`}>
                  <div className="stf-health__svc-head">
                    <span className="stf-health__dot" />
                    <strong>{svc.name}</strong>
                    <span className="stf-health__svc-status">{STATUS_LABEL[svc.status] || svc.status}</span>
                  </div>
                  <div className="stf-health__svc-meta">
                    <span>Latency: {svc.latency}</span>
                    <span>Uptime: {svc.uptime}</span>
                  </div>
                  {svc.note && <p className="stf-health__svc-note">{svc.note}</p>}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default StaffHealth;
