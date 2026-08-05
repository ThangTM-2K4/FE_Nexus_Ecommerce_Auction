import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import StatCard from "../../../components/sellerdashboard/sellerStatCard";
import AnimatedValue from "../../../components/sellerdashboard/sellerAnimatedValue";
import SellerRealtimeClock from "../../../components/sellerdashboard/sellerRealtimeClock";
import SellerStockAlert from "../../../components/sellerdashboard/sellerStockAlert";
import { getMyEcommerceProducts } from "../../../services/ecommerceProductService";
import { getWalletState } from "../../../services/walletService";
import {
  overviewStats,
  revenueSummary,
  orderStats,
  productStats as mockProductStats,
  customerStats,
  walletStats as mockWalletStats,
  formatCurrency,
  formatCompactCurrency,
} from "../../../data/sellerMockData";

const FILTER_GROUPS = [
  { id: "all", label: "Tất cả" },
  { id: "revenue", label: "Doanh thu" },
  { id: "orders", label: "Đơn hàng" },
  { id: "products", label: "Sản phẩm" },
  { id: "customers", label: "Khách hàng" },
];

export default function OverviewPage() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState("all");
  const [realProducts, setRealProducts] = useState([]);
  const [walletInfo, setWalletInfo] = useState(null);

  useEffect(() => {
    getMyEcommerceProducts().then((res) => {
      setRealProducts(res.items || []);
    }).catch(() => {});

    getWalletState().then((res) => {
      setWalletInfo(res?.walletStats || null);
    }).catch(() => {});
  }, [user]);

  const activeProducts = useMemo(() => realProducts.filter((p) => p.status === "ACTIVE" || p.status === "APPROVED").length, [realProducts]);
  const totalProducts = realProducts.length;
  const availableBalance = walletInfo?.availableBalance ?? 0;
  const netRevenue = availableBalance + (walletInfo?.withdrawnAmount ?? 0);
  const totalOrders = realProducts.reduce((sum, p) => sum + (p.soldCount || p.sold || 0), 0);

  const heroKpis = useMemo(() => [
    {
      id: "hero-revenue",
      label: "Doanh thu khả dụng",
      value: availableBalance,
      format: "currency",
      trend: "Thực tế",
      icon: "💰",
    },
    {
      id: "hero-orders",
      label: "Tổng đơn đã bán",
      value: totalOrders,
      format: "number",
      trend: "Từ SP",
      icon: "📦",
    },
    {
      id: "hero-products",
      label: "Sản phẩm đang bán",
      value: activeProducts,
      format: "number",
      trend: `${totalProducts} tổng SP`,
      icon: "🏷️",
    },
    {
      id: "hero-wallet",
      label: "Số dư khả dụng",
      value: availableBalance,
      format: "currency",
      trend: "Rút tiền →",
      link: "/seller-hub/finance/wallet",
      icon: "💳",
    },
  ], [activeProducts, totalProducts, availableBalance, totalOrders]);

  const columnConfig = useMemo(() => [
    {
      id: "revenue",
      title: "Doanh thu",
      icon: "💰",
      accent: "revenue",
      groups: ["revenue"],
      highlight: { label: "Tổng doanh thu ròng", value: netRevenue, format: "currency" },
    },
    {
      id: "orders",
      title: "Trạng thái đơn hàng",
      icon: "📦",
      accent: "orders",
      groups: ["orders"],
      highlight: { label: "Tổng đơn hàng", value: totalOrders, format: "number" },
    },
    {
      id: "products",
      title: "Sản phẩm",
      icon: "🏷️",
      accent: "products",
      groups: ["products"],
      highlight: { label: "Đang bán", value: activeProducts, format: "number" },
    },
    {
      id: "customers",
      title: "Khách hàng",
      icon: "👥",
      accent: "customers",
      groups: ["customers"],
      highlight: { label: "Đánh giá mua", value: totalOrders, format: "number" },
    },
  ], [activeProducts, netRevenue, totalOrders]);

  const overviewStats = useMemo(() => [
    {
      id: "net-revenue",
      label: "Tổng doanh thu ròng",
      value: netRevenue,
      format: "currency",
      group: "revenue",
    },
    {
      id: "today-revenue",
      label: "Doanh thu hôm nay",
      value: 0,
      format: "currency",
      group: "revenue",
    },
    {
      id: "month-revenue",
      label: "Doanh thu tháng này",
      value: netRevenue,
      format: "currency",
      group: "revenue",
    },
    {
      id: "total-orders",
      label: "Tổng số đơn hàng",
      value: totalOrders,
      format: "number",
      group: "orders",
    },
    {
      id: "new-orders",
      label: "Đơn hàng mới",
      value: 0,
      format: "number",
      group: "orders",
    },
    {
      id: "processing-orders",
      label: "Đơn hàng đang xử lý",
      value: 0,
      format: "number",
      group: "orders",
    },
    {
      id: "completed-orders",
      label: "Đơn hàng hoàn thành",
      value: totalOrders,
      format: "number",
      group: "orders",
    },
    {
      id: "cancelled-orders",
      label: "Đơn hàng bị hủy",
      value: 0,
      format: "number",
      group: "orders",
    },
  ], [netRevenue, totalOrders]);

  const filteredStats = useMemo(() => {
    if (activeFilter === "all") return overviewStats;
    return overviewStats.filter((s) => s.group === activeFilter);
  }, [activeFilter, overviewStats]);

  const visibleColumns = useMemo(() => {
    if (activeFilter === "all") return columnConfig;
    return columnConfig.filter((col) => col.groups.includes(activeFilter));
  }, [activeFilter, columnConfig]);

  return (
    <div className="slr-page slr-dashboard slr-dashboard--overview">
      <section className="slr-overview-hero">
        <div className="slr-overview-hero__top">
          <div className="slr-overview-hero__intro">
            <span className="slr-dashboard__kicker">Bảng điều khiển người bán</span>
            <h1>Tổng quan kinh doanh</h1>
            <p>Theo dõi doanh thu, đơn hàng và khách hàng theo thời gian thực.</p>
          </div>
          <div className="slr-overview-hero__toolbar">
            <SellerRealtimeClock label="Cập nhật" />
            <Link to="/seller-hub/products/create" className="slr-btn-create">
              + Tạo sản phẩm
            </Link>
          </div>
        </div>

        <div className="slr-overview-hero__kpis">
          {heroKpis.map((kpi) => {
            const content = (
              <>
                <span className="slr-hero-kpi__icon">{kpi.icon}</span>
                <div className="slr-hero-kpi__body">
                  <span className="slr-hero-kpi__label">{kpi.label}</span>
                  <strong className="slr-hero-kpi__value">
                    {kpi.format === "currency" ? (
                      <span title={formatCurrency(kpi.value)}>
                        {formatCompactCurrency(kpi.value)}
                      </span>
                    ) : (
                      <AnimatedValue value={kpi.value} />
                    )}
                  </strong>
                  {kpi.link ? (
                    <Link to={kpi.link} className="slr-hero-kpi__link">{kpi.trend}</Link>
                  ) : (
                    <span className="slr-hero-kpi__trend">{kpi.trend}</span>
                  )}
                </div>
              </>
            );

            return kpi.link ? (
              <Link key={kpi.id} to={kpi.link} className="slr-hero-kpi slr-hero-kpi--link">
                {content}
              </Link>
            ) : (
              <div key={kpi.id} className="slr-hero-kpi">
                {content}
              </div>
            );
          })}
        </div>
      </section>

      <div className="slr-filter-tabs">
        {FILTER_GROUPS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={activeFilter === f.id ? "active" : ""}
            onClick={() => setActiveFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className={`slr-overview-columns slr-overview-columns--${visibleColumns.length}`}>
        {visibleColumns.map((col) => {
          const colStats = overviewStats.filter((s) => col.groups.includes(s.group));
          return (
            <section key={col.id} className={`slr-overview-col slr-overview-col--${col.accent}`}>
              <header className="slr-overview-col__header">
                <span className="slr-overview-col__icon">{col.icon}</span>
                <div className="slr-overview-col__title">
                  <h2>{col.title}</h2>
                  <p>
                    {col.highlight.label}:{" "}
                    <strong title={col.highlight.format === "currency" ? formatCurrency(col.highlight.value) : undefined}>
                      {col.highlight.format === "currency" ? (
                        formatCompactCurrency(col.highlight.value)
                      ) : (
                        <AnimatedValue value={col.highlight.value} />
                      )}
                    </strong>
                  </p>
                </div>
              </header>
              <div className="slr-overview-col__grid">
                {colStats.map((s, i) => (
                  <StatCard key={s.id} {...s} delay={i * 40} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {activeFilter !== "all" && (
        <section className="slr-section">
          <header className="slr-section__header">
            <div>
              <h2>Chi tiết {FILTER_GROUPS.find((f) => f.id === activeFilter)?.label}</h2>
              <p>Các chỉ số liên quan</p>
            </div>
          </header>
          <div className="slr-stat-grid slr-stat-grid--filter">
            {filteredStats.map((s, i) => (
              <StatCard key={s.id} {...s} delay={i * 45} />
            ))}
          </div>
        </section>
      )}

      <SellerStockAlert count={realProducts.filter(p => (p.stock || 0) <= 0).length || mockProductStats.outOfStock} title="Sắp hết / hết hàng" />
    </div>
  );
}
