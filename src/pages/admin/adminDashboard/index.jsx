import { useNavigate } from "react-router-dom";
import AdminPageHeader from "../../../components/admin/adminPageHeader";
import AdminKpiCard from "../../../components/admin/adminKpiCard";
import { AdminStaggerGrid } from "../../../components/admin/adminPageTransition";
import {
  BarChart,
  LineChart,
  DonutChart,
  HorizontalBarChart,
  SparklineChart,
  StackedBarChart,
} from "../../../components/admin/adminCharts";
import { dashboardCharts, dashboardStats } from "../../../data/adminMockData";
import "./index.scss";
import "../../../components/admin/adminCharts/index.scss";

const ChartRenderer = ({ config }) => {
  const cls = `adm-chart-wrap${config.wide ? " adm-chart-wrap--wide" : ""}`;

  const chart = (() => {
    switch (config.type) {
      case "line":
        return (
          <LineChart
            title={config.title}
            subtitle={config.subtitle}
            labels={config.labels}
            values={config.values}
            unit={config.unit}
            color={config.color}
            detailed={config.detailed}
            dates={config.dates}
            orders={config.orders}
            changePct={config.changePct}
          />
        );
      case "bar":
        return <BarChart title={config.title} subtitle={config.subtitle} labels={config.labels} values={config.values} unit={config.unit} color={config.color} />;
      case "donut":
        return <DonutChart title={config.title} subtitle={config.subtitle} segments={config.segments} />;
      case "horizontal":
        return <HorizontalBarChart title={config.title} subtitle={config.subtitle} items={config.items} unit={config.unit} />;
      case "sparkline":
        return <SparklineChart title={config.title} subtitle={config.subtitle} labels={config.labels} values={config.values} unit={config.unit} color={config.color} />;
      case "stacked":
        return <StackedBarChart title={config.title} subtitle={config.subtitle} labels={config.labels} series={config.series} unit={config.unit} />;
      default:
        return null;
    }
  })();

  return <div className={cls}>{chart}</div>;
};

function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="adm-dashboard">
      <AdminPageHeader
        kicker="Admin Hub"
        title="Tổng quan"
        subtitle="Màn hình đầu tiên sau khi Admin đăng nhập — tổng quan toàn hệ thống."
      />

      <section className="adm-dashboard__hero">
        <div>
          <span className="adm-dashboard__kicker">Hôm nay · 05/07/2026</span>
          <h2>Chào mừng trở lại, Admin</h2>
          <p>
            Hệ thống đang vận hành ổn định. Có 34 seller chờ duyệt, 24 phiên đấu giá sắp kết thúc
            và 47 đơn khiếu nại cần theo dõi.
          </p>
        </div>
        <div className="adm-dashboard__hero-actions">
          <button type="button" onClick={() => navigate("/admin/seller-verification")}>
            Duyệt Seller
          </button>
          <button type="button" onClick={() => navigate("/admin/reports")}>
            Xem khiếu nại
          </button>
        </div>
      </section>

      <AdminStaggerGrid className="adm-dashboard__kpis">
        {dashboardStats.map((stat) => (
          <AdminKpiCard
            key={stat.id}
            label={stat.label}
            value={stat.value}
            hint={stat.hint}
            highlight={stat.highlight}
            warn={stat.warn}
          />
        ))}
      </AdminStaggerGrid>

      <section className="adm-dashboard__charts">
        <header>
          <h3>Biểu đồ thống kê</h3>
          <p>Line · Bar · Donut · Stacked · Sparkline — mỗi chỉ số dùng biểu đồ phù hợp</p>
        </header>
        <AdminStaggerGrid className="adm-dashboard__charts-grid">
          {Object.entries(dashboardCharts).map(([key, config]) => (
            <ChartRenderer key={key} config={config} />
          ))}
        </AdminStaggerGrid>
      </section>
    </div>
  );
}

export default AdminDashboard;
