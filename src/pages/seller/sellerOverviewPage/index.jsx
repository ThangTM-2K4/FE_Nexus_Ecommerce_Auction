import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import StatCard from "../../../components/sellerdashboard/sellerStatCard";
import AnimatedValue from "../../../components/sellerdashboard/sellerAnimatedValue";
import SellerRealtimeClock from "../../../components/sellerdashboard/sellerRealtimeClock";
import SellerStockAlert from "../../../components/sellerdashboard/sellerStockAlert";
import { getMyWallets } from "../../../services/walletService";
import {
  overviewStats,
  revenueSummary,
  orderStats,
  productStats,
  customerStats,
  walletStats,
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

const HERO_KPIS = [
  {
    id: "hero-revenue",
    label: "Doanh thu tháng",
    value: revenueSummary.netRevenue,
    format: "currency",
    trend: "+8.7%",
    icon: "💰",
  },
  {
    id: "hero-orders",
    label: "Tổng đơn hàng",
    value: orderStats.total,
    format: "number",
    trend: "+3.2%",
    icon: "📦",
  },
  {
    id: "hero-products",
    label: "Sản phẩm đang bán",
    value: productStats.active,
    format: "number",
    trend: `${productStats.total} SP`,
    icon: "🏷️",
  },
  {
    id: "hero-wallet",
    label: "Số dư khả dụng",
    value: walletStats.availableBalance,
    format: "currency",
    trend: "Rút tiền →",
    link: "/seller-hub/wallet",
    icon: "💳",
  },
];

const COLUMN_CONFIG = [
  {
    id: "revenue",
    title: "Doanh thu",
    icon: "💰",
    accent: "revenue",
    groups: ["revenue"],
    highlight: { label: "Doanh thu ròng", value: revenueSummary.netRevenue, format: "currency" },
  },
  {
    id: "orders",
    title: "Trạng thái đơn hàng",
    icon: "📦",
    accent: "orders",
    groups: ["orders"],
    highlight: { label: "Tổng đơn hàng", value: orderStats.total, format: "number" },
  },
  {
    id: "products",
    title: "Sản phẩm",
    icon: "🏷️",
    accent: "products",
    groups: ["products"],
    highlight: { label: "Đang bán", value: productStats.active, format: "number" },
  },
  {
    id: "customers",
    title: "Khách hàng",
    icon: "👥",
    accent: "customers",
    groups: ["customers"],
    highlight: { label: "Tổng thành viên", value: customerStats.total, format: "number" },
  },
];

export default function OverviewPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [sellerBalance, setSellerBalance] = useState(null);

  useEffect(() => {
    getMyWallets().then((res) => {
      if (res?.wallets) {
        const sellerWd = res.wallets.find((w) => w.walletType === 'SELLER');
        if (sellerWd) {
          setSellerBalance(sellerWd.availableBalance ?? 0);
        }
      }
    }).catch(() => {});
  }, []);

  const heroKpisWithRealWallet = useMemo(() => {
    return HERO_KPIS.map((kpi) => {
      if (kpi.id === "hero-wallet" && sellerBalance !== null) {
        return { ...kpi, value: sellerBalance };
      }
      return kpi;
    });
  }, [sellerBalance]);

  const filteredStats = useMemo(() => {
    if (activeFilter === "all") return overviewStats;
    return overviewStats.filter((s) => s.group === activeFilter);
  }, [activeFilter]);

  const visibleColumns = useMemo(() => {
    if (activeFilter === "all") return COLUMN_CONFIG;
    return COLUMN_CONFIG.filter((col) => col.groups.includes(activeFilter));
  }, [activeFilter]);

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
          {heroKpisWithRealWallet.map((kpi) => {
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
                  <span className="slr-hero-kpi__trend">{kpi.trend}</span>
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

      <SellerStockAlert count={productStats.outOfStock} title="Sắp hết / hết hàng" />
    </div>
  );
}
