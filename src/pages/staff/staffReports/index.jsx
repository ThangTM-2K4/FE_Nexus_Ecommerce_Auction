import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import StaffPageHeader from "../../../components/staff/staffPageHeader";
import StaffKpiCard from "../../../components/staff/staffKpiCard";
import {
  getViolationReports,
  resolveViolationReport,
} from "../../../services/staffService";
import { reportTypeOptions } from "../../../data/staffMockData";
import "./index.scss";

const severityLabel = { high: "Nghiêm trọng", medium: "Trung bình", low: "Thấp" };

const resolutionLabel = {
  "remove-content": "Đã gỡ nội dung",
  "warn-seller": "Đã cảnh cáo người bán",
  dismiss: "Đã bỏ qua",
};

const StaffReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [showResolved, setShowResolved] = useState(false);

  const load = () => {
    getViolationReports().then((data) => {
      setReports(data);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const stats = useMemo(
    () => ({
      open: reports.filter((r) => r.status === "OPEN").length,
      high: reports.filter((r) => r.status === "OPEN" && r.severity === "high").length,
      resolved: reports.filter((r) => r.status === "RESOLVED").length,
    }),
    [reports]
  );

  const shown = useMemo(() => {
    let list = reports.filter((r) => (showResolved ? true : r.status === "OPEN"));
    if (typeFilter !== "all") list = list.filter((r) => r.type === typeFilter);
    return list;
  }, [reports, typeFilter, showResolved]);

  const handleResolve = async (report, action) => {
    await resolveViolationReport(report.id, action);
    toast.success(`${report.id}: ${resolutionLabel[action]}`);
    load();
  };

  return (
    <div className="stf-reports">
      <StaffPageHeader
        kicker="An toàn nền tảng"
        title="Báo cáo vi phạm"
        subtitle="Xử lý báo cáo hàng giả, lừa đảo, hàng cấm và các vi phạm chính sách."
      />

      <div className="stf-reports__kpis">
        <StaffKpiCard label="Báo cáo đang mở" value={String(stats.open)} hint="Chưa xử lý" warn={stats.open > 0} />
        <StaffKpiCard label="Mức nghiêm trọng" value={String(stats.high)} hint="Ưu tiên xử lý ngay" warn={stats.high > 0} />
        <StaffKpiCard label="Đã xử lý" value={String(stats.resolved)} hint="Trên máy này" highlight />
      </div>

      <div className="stf-reports__toolbar">
        <div className="stf-reports__filters">
          {reportTypeOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={typeFilter === opt.id ? "active" : ""}
              onClick={() => setTypeFilter(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <label className="stf-reports__toggle">
          <input
            type="checkbox"
            checked={showResolved}
            onChange={(e) => setShowResolved(e.target.checked)}
          />
          Hiện cả đã xử lý
        </label>
      </div>

      {loading ? (
        <p className="stf-reports__empty">Đang tải...</p>
      ) : shown.length === 0 ? (
        <p className="stf-reports__empty">Không có báo cáo nào khớp bộ lọc 🎉</p>
      ) : (
        <div className="stf-reports__grid">
          {shown.map((report) => (
            <article
              key={report.id}
              className={`stf-reports__card ${report.status === "RESOLVED" ? "is-resolved" : ""}`}
            >
              <header>
                <div className="stf-reports__head-left">
                  <span className={`stf-reports__sev stf-reports__sev--${report.severity}`}>
                    {severityLabel[report.severity]}
                  </span>
                  <span className="stf-reports__type">{report.typeLabel}</span>
                </div>
                <span className="stf-reports__id">{report.id}</span>
              </header>

              <div className="stf-reports__target">
                <span className="stf-reports__target-kind">{report.target.kind}</span>
                <strong>{report.target.name}</strong>
                <small>{report.target.ref}</small>
              </div>

              <p className="stf-reports__desc">{report.description}</p>

              <div className="stf-reports__meta">
                <span>👤 {report.reporter}</span>
                <span>🚩 {report.reportCount} báo cáo</span>
                <span>📎 {report.evidences} bằng chứng</span>
              </div>

              <footer>
                <small>{report.reportedAt}</small>
                {report.status === "OPEN" ? (
                  <div className="stf-reports__actions">
                    <button type="button" className="dismiss" onClick={() => handleResolve(report, "dismiss")}>
                      Bỏ qua
                    </button>
                    <button type="button" className="warn" onClick={() => handleResolve(report, "warn-seller")}>
                      Cảnh cáo
                    </button>
                    <button type="button" className="remove" onClick={() => handleResolve(report, "remove-content")}>
                      Gỡ nội dung
                    </button>
                  </div>
                ) : (
                  <span className="stf-reports__resolved-tag">{resolutionLabel[report.resolution]}</span>
                )}
              </footer>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaffReports;
