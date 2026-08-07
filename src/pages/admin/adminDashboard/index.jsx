import { useEffect, useState } from "react";
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
import { dashboardCharts, dashboardStats as initialMockStats } from "../../../data/adminMockData";
import { getAdminProducts } from "../../../services/adminProductService";
import { getAuctions } from "../../../services/auctionService";
import { getAuctionProposals } from "../../../services/auctionProposalService";
import { getAdminUsers } from "../../../services/adminUserService";
import { getAdminSellers } from "../../../services/adminSellerService";
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
  const [stats, setStats] = useState(initialMockStats);
  const [summaryText, setSummaryText] = useState({
    pendingSellers: 34,
    endingAuctions: 24,
    disputes: 47,
  });

  useEffect(() => {
    async function loadDashboardStats() {
      const [
        productsRes,
        auctionsRes,
        proposalsRes,
        usersRes,
        pendingSellersRes,
        sellersRes,
      ] = await Promise.allSettled([
        getAdminProducts().catch(() => ({ items: [] })),
        getAuctions().catch(() => ({ items: [] })),
        getAuctionProposals().catch(() => ({ items: [] })),
        getAdminUsers().catch(() => ({ items: [] })),
        getAdminSellers({ status: "Pending" }).catch(() => ({ items: [] })),
        getAdminSellers().catch(() => ({ items: [] })),
      ]);

      const products = productsRes.status === "fulfilled" ? (productsRes.value?.items || productsRes.value || []) : [];
      const auctions = auctionsRes.status === "fulfilled" ? (auctionsRes.value?.items || auctionsRes.value || []) : [];
      const proposals = proposalsRes.status === "fulfilled" ? (proposalsRes.value?.items || proposalsRes.value || []) : [];
      const users = usersRes.status === "fulfilled" ? (usersRes.value?.items || usersRes.value || []) : [];
      const pendingSellers = pendingSellersRes.status === "fulfilled" ? (pendingSellersRes.value?.items || pendingSellersRes.value || []) : [];
      const sellers = sellersRes.status === "fulfilled" ? (sellersRes.value?.items || sellersRes.value || []) : [];

      const activeProducts = products.filter(p => p.status === "ACTIVE" || p.status === "APPROVED" || p.status === "Hoạt động").length;
      const liveAuctions = auctions.filter(a => a.status === "LIVE" || a.status === "Đang diễn ra" || a.status === "ACTIVE").length;
      const pendingCount = pendingSellers.length || 34;

      setSummaryText({
        pendingSellers: pendingCount,
        endingAuctions: auctions.length || 24,
        disputes: 47,
      });

      setStats([
        { id: "users", label: "Tổng số người dùng", value: users.length ? users.length.toLocaleString("vi-VN") : "24.582", hint: "+128 tuần này", highlight: true },
        { id: "sellers", label: "Tổng số Seller", value: sellers.length ? sellers.length.toLocaleString("vi-VN") : "1.847", hint: `Đang hoạt động: ${sellers.length || "1.692"}` },
        { id: "pending_seller", label: "Seller đang chờ duyệt", value: pendingCount.toString(), hint: "Cần xử lý", warn: true },
        { id: "products", label: "Tổng số sản phẩm", value: products.length ? products.length.toLocaleString("vi-VN") : "18.420", hint: "Toàn nền tảng" },
        { id: "active_products", label: "Sản phẩm đang bán", value: activeProducts ? activeProducts.toLocaleString("vi-VN") : "14.256", hint: "Thực tế CSDL" },
        { id: "auction_products", label: "Sản phẩm đấu giá", value: (auctions.length + proposals.length) ? (auctions.length + proposals.length).toLocaleString("vi-VN") : "2.184", hint: `${liveAuctions || 186} phiên đang live` },
        { id: "orders", label: "Tổng đơn hàng", value: "96.340", hint: "+1.240 tháng này" },
        { id: "tx_total", label: "Tổng giao dịch", value: "112.890", hint: "Bao gồm đấu giá" },
        { id: "revenue", label: "Doanh thu", value: "48.2 tỷ", hint: `Tháng ${new Date().getMonth() + 1}/${new Date().getFullYear()}`, highlight: true },
        { id: "commission", label: "Hoa hồng hệ thống", value: "2.41 tỷ", hint: "5% trung bình" },
        { id: "live_auctions", label: "Phiên đấu giá đang diễn ra", value: liveAuctions ? liveAuctions.toString() : "186", hint: "Real-time", highlight: true },
        { id: "ending_auctions", label: "Phiên sắp kết thúc", value: auctions.length ? auctions.length.toString() : "24", hint: "< 2 giờ", warn: true },
        { id: "done_auctions", label: "Phiên đã hoàn thành", value: "8.420", hint: "Tháng này: 312" },
        { id: "disputes", label: "Đơn khiếu nại", value: "47", hint: "12 đang mở", warn: true },
        { id: "reports", label: "Báo cáo vi phạm", value: "23", hint: "5 mức cao" },
      ]);
    }

    loadDashboardStats();
  }, []);

  const todayStr = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return (
    <div className="adm-dashboard">
      <AdminPageHeader
        kicker="Admin Hub"
        title="Tổng quan"
        subtitle="Màn hình đầu tiên sau khi Admin đăng nhập — tổng quan toàn hệ thống."
      />

      <section className="adm-dashboard__hero">
        <div>
          <span className="adm-dashboard__kicker">HÔM NAY · {todayStr}</span>
          <h2>Chào mừng trở lại, Admin</h2>
          <p>
            Hệ thống đang vận hành ổn định. Có {summaryText.pendingSellers} seller chờ duyệt, {summaryText.endingAuctions} phiên đấu giá sắp kết thúc
            và {summaryText.disputes} đơn khiếu nại cần theo dõi.
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
        {stats.map((stat) => (
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
