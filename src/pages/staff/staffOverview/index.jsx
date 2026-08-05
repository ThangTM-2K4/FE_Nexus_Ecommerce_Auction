import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StaffPageHeader from "../../../components/staff/staffPageHeader";
import StaffKpiCard from "../../../components/staff/staffKpiCard";
import { getAdminSellers } from "../../../services/adminSellerService";
import api from "../../../config/api";
import { unwrapPagedList } from "../../../utils/apiResponse";
import "./index.scss";

const priorityLabel = {
  high: "Cao",
  medium: "Trung bình",
  low: "Thấp",
};

const typeLabel = {
  seller: "Duyệt seller",
  identity: "Xác minh CCCD",
  auction: "Đấu giá",
  dispute: "Khiếu nại",
  report: "Báo cáo",
};

const StaffOverview = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sellers, setSellers] = useState([]);
  const [totalUsersCount, setTotalUsersCount] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [sellersRes, usersRes] = await Promise.allSettled([
          getAdminSellers({ page: 1, pageSize: 100 }),
          api.get("/admin/users", { params: { page: 1, pageSize: 100 } }),
        ]);

        if (sellersRes.status === "fulfilled" && sellersRes.value?.items) {
          setSellers(sellersRes.value.items);
        }

        if (usersRes.status === "fulfilled" && usersRes.value?.data) {
          const paged = unwrapPagedList(usersRes.value.data);
          setTotalUsersCount(paged.total || (paged.items || []).length);
        }
      } catch (err) {
        console.error("[StaffOverview] Error loading real API data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const pendingSellersList = sellers.filter((s) => {
    const st = String(s.apiStatus || s.status || s._raw?.status || "").toUpperCase();
    return st.includes("PENDING") || st.includes("CHỜ");
  });

  const activeSellersCount = sellers.filter((s) => {
    const st = String(s.apiStatus || s.status || s._raw?.status || "").toUpperCase();
    return (
      st.includes("APPROV") ||
      st.includes("ACTIV") ||
      st.includes("DUYỆT") ||
      st.includes("HOẠT ĐỘNG") ||
      s.cccdVerified === true
    );
  }).length;

  const pendingSellersCount = pendingSellersList.length;

  const overviewStats = [
    {
      id: "pending-sellers",
      label: "Đơn đăng ký seller chờ duyệt",
      value: String(pendingSellersCount),
      hint: "Cần xác minh CCCD",
      highlight: pendingSellersCount > 0,
    },
    {
      id: "active-sellers",
      label: "Người bán đang hoạt động",
      value: String(activeSellersCount),
      hint: "Toàn hệ thống",
      highlight: activeSellersCount > 0,
    },
    {
      id: "total-users",
      label: "Tổng người dùng hệ thống",
      value: String(totalUsersCount),
      hint: "Tài khoản đăng ký",
    },
  ];

  const pendingTasks = pendingSellersList.map((app) => ({
    id: app.id || app.sellerId,
    type: "seller",
    title: `Duyệt hồ sơ & CCCD: ${app.businessName || app.name || app.owner || "Người bán mới"}`,
    due: "Hạn: Cần xử lý",
    priority: "high",
  }));

  const taskRoute = (type) => {
    if (type === "seller" || type === "identity") return "/staff/seller-review";
    if (type === "auction") return "/staff/auctions";
    if (type === "dispute") return "/staff/disputes";
    return "/staff/reports";
  };

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
            {loading ? (
              "Đang kết nối dữ liệu vận hành từ hệ thống..."
            ) : (
              <>
                Hệ thống hiện có <strong>{pendingSellersCount}</strong> đơn đăng ký seller chờ duyệt và{" "}
                <strong>{activeSellersCount}</strong> người bán đang hoạt động trên toàn nền tảng.
              </>
            )}
          </p>
        </div>
      </section>

      <section className="stf-overview__kpis">
        {overviewStats.map((stat) => (
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
          <h3>Việc cần làm ưu tiên ({pendingTasks.length})</h3>
          <p>Danh sách công việc được lấy trực tiếp từ database hệ thống</p>
        </header>

        {loading ? (
          <p style={{ padding: "20px", color: "#666" }}>Đang tải công việc...</p>
        ) : pendingTasks.length === 0 ? (
          <div style={{ padding: "24px", background: "#fff", borderRadius: "12px", color: "#6b3ba7", fontWeight: 600 }}>
            🎉 Hiện tại không có đơn seller nào đang chờ xử lý.
          </div>
        ) : (
          <ul>
            {pendingTasks.map((task) => (
              <li key={task.id}>
                <div className="stf-overview__task-main">
                  <span className={`stf-overview__type stf-overview__type--${task.type}`}>
                    {typeLabel[task.type] || "Công việc"}
                  </span>
                  <strong>{task.title}</strong>
                  <small>{task.due}</small>
                </div>
                <div className="stf-overview__task-actions">
                  <span className={`stf-overview__priority stf-overview__priority--${task.priority}`}>
                    {priorityLabel[task.priority] || "Trung bình"}
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
        )}
      </section>
    </div>
  );
};

export default StaffOverview;
