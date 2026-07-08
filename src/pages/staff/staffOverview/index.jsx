import { useNavigate } from "react-router-dom";
import StaffPageHeader from "../../../components/staff/staffPageHeader";
import StaffKpiCard from "../../../components/staff/staffKpiCard";
import { overviewStats, pendingTasks } from "../../../data/staffMockData";
import "./index.scss";

const priorityLabel = {
  high: "Cao",
  medium: "Trung bình",
  low: "Thấp",
};

const typeLabel = {
  seller: "Duyệt seller",
  auction: "Đấu giá",
  dispute: "Khiếu nại",
  report: "Báo cáo",
};

const StaffOverview = () => {
  const navigate = useNavigate();

  const taskRoute = (type) => {
    if (type === "seller") return "/staff/seller-review";
    if (type === "auction") return "/staff/auctions";
    if (type === "dispute") return "/staff/disputes";
    return "/staff/reports";
  };

  const pendingSellers = overviewStats.find((s) => s.id === "pending-sellers")?.value ?? "0";
  const flaggedAuctions = overviewStats.find((s) => s.id === "flagged-auctions")?.value ?? "0";
  const openDisputes = overviewStats.find((s) => s.id === "open-disputes")?.value ?? "0";

  return (
    <div className="stf-overview">
      <StaffPageHeader
        kicker="Staff Hub"
        title="Tổng quan vận hành"
        subtitle="Theo dõi công việc ưu tiên, duyệt seller, kiểm duyệt đấu giá và xử lý khiếu nại."
      />

      <section className="stf-overview__hero">
        <div>
          <span className="stf-overview__kicker">Hôm nay</span>
          <h2>Chào mừng trở lại, đội vận hành</h2>
          <p>
            Bạn có {pendingSellers} đơn đăng ký seller, {flaggedAuctions} phiên đấu giá bị báo cáo
            và {openDisputes} khiếu nại đang mở cần xử lý — chi tiết ở các thẻ bên dưới.
          </p>
        </div>
      </section>

      <section className="stf-overview__kpis">
        {overviewStats.map((stat, i) => (
          <StaffKpiCard
            key={stat.id}
            label={stat.label}
            value={stat.value}
            hint={stat.hint}
            highlight={stat.highlight}
            warn={stat.warn}
          />
        ))}
      </section>

      <section className="stf-overview__tasks">
        <header>
          <h3>Việc cần làm ưu tiên</h3>
          <p>Danh sách công việc được sắp xếp theo mức độ khẩn cấp</p>
        </header>
        <ul>
          {pendingTasks.map((task) => (
            <li key={task.id}>
              <div className="stf-overview__task-main">
                <span className={`stf-overview__type stf-overview__type--${task.type}`}>
                  {typeLabel[task.type]}
                </span>
                <strong>{task.title}</strong>
                <small>Hạn: {task.due}</small>
              </div>
              <div className="stf-overview__task-actions">
                <span className={`stf-overview__priority stf-overview__priority--${task.priority}`}>
                  {priorityLabel[task.priority]}
                </span>
                <button
                  type="button"
                  onClick={() => navigate(taskRoute(task.type))}
                >
                  Xử lý
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default StaffOverview;
