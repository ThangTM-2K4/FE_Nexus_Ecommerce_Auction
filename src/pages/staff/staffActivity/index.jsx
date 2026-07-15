import { useEffect, useMemo, useState } from "react";
import StaffPageHeader from "../../../components/staff/staffPageHeader";
import { getActivityLog } from "../../../services/staffService";
import { activityActionLabel } from "../../../data/staffDirectoryData";
import "./index.scss";

const StaffActivity = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [staffFilter, setStaffFilter] = useState("all");

  useEffect(() => {
    getActivityLog().then((data) => {
      setLogs(data);
      setLoading(false);
    });
  }, []);

  const staffList = useMemo(
    () => ["all", ...Array.from(new Set(logs.map((l) => l.staff)))],
    [logs]
  );

  const shown = useMemo(
    () => (staffFilter === "all" ? logs : logs.filter((l) => l.staff === staffFilter)),
    [logs, staffFilter]
  );

  return (
    <div className="stf-activity">
      <StaffPageHeader
        kicker="Giám sát"
        title="Nhật ký nhân viên"
        subtitle="Thao tác của staff vận hành — khác với Event Log hệ thống ở mục Giám sát."
      />

      <div className="stf-activity__filters">
        {staffList.map((s) => (
          <button key={s} type="button" className={staffFilter === s ? "active" : ""} onClick={() => setStaffFilter(s)}>
            {s === "all" ? "Tất cả nhân viên" : s}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="stf-activity__empty">Đang tải...</p>
      ) : (
        <ol className="stf-activity__timeline">
          {shown.map((log) => (
            <li key={log.id} className={`stf-activity__item stf-activity__item--${log.tone}`}>
              <span className="stf-activity__dot" />
              <div className="stf-activity__content">
                <div className="stf-activity__row">
                  <span className={`stf-activity__action stf-activity__action--${log.tone}`}>
                    {activityActionLabel[log.action] || log.action}
                  </span>
                  <span className="stf-activity__target">{log.target}</span>
                </div>
                <p className="stf-activity__detail">{log.detail}</p>
                <div className="stf-activity__foot">
                  <span>👤 {log.staff}</span>
                  <span>{log.at}</span>
                  <span className="stf-activity__id">{log.id}</span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

export default StaffActivity;
