import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import PageHeader from "../../../components/sellerdashboard/sellerPageHeader";
import AnimatedValue from "../../../components/sellerdashboard/sellerAnimatedValue";
import SellerRealtimeClock from "../../../components/sellerdashboard/sellerRealtimeClock";
import SellerStockAlert from "../../../components/sellerdashboard/sellerStockAlert";
import { topProducts, topCustomers, lowStockAlerts, formatCurrency } from "../../../data/sellerMockData";
import { generateRevenueData } from "../../../utils/mockRevenueGenerator";
import {
  CHART_COLORS,
  CHART_ACCENT,
  CHART_ACCENT_SOFT,
  chartGridProps,
  chartAxisProps,
  chartTooltipStyle,
} from "../../../utils/chartTheme";

const PERIOD_TABS = [
  { id: "today", label: "Hôm nay" },
  { id: "week", label: "7 ngày" },
  { id: "month", label: "30 ngày" },
  { id: "year", label: "Theo năm" },
];

function toDateInputValue(date) {
  return date.toISOString().slice(0, 10);
}

export default function RevenuePage() {
  const [activePeriod, setActivePeriod] = useState("month");
  const [customDate, setCustomDate] = useState(toDateInputValue(new Date()));

  const period = PERIOD_TABS.find((p) => p.id === activePeriod) ?? PERIOD_TABS[2];
  const data = useMemo(() => generateRevenueData(customDate, activePeriod), [customDate, activePeriod]);
  const trendInterval = data.trend.length > 15 ? Math.ceil(data.trend.length / 8) - 1 : 0;

  return (
    <div className="slr-page slr-page--revenue">
      <PageHeader
        kicker="Phân tích"
        title="Doanh thu"
        subtitle="Phân tích doanh thu theo thời gian và danh mục"
      />

      <div className="slr-revenue-toolbar">
        <div className="slr-revenue-toolbar__left">
          <div className="slr-date-picker">
            <label htmlFor="revenue-date">Chọn ngày</label>
            <input
              id="revenue-date"
              type="date"
              value={customDate}
              max={toDateInputValue(new Date())}
              onChange={(e) => setCustomDate(e.target.value)}
            />
          </div>
          <SellerRealtimeClock label="Thời gian thực" inline />
        </div>
        <Link to="/seller-hub/products/create" className="slr-btn-create">
          + Tạo sản phẩm
        </Link>
      </div>

      <SellerStockAlert count={lowStockAlerts.length} title="Báo kho" items={lowStockAlerts} linkLabel="Chi tiết" />

      <section className="slr-section">
        <div className="slr-filter-tabs slr-filter-tabs--revenue">
          {PERIOD_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={activePeriod === t.id ? "active" : ""}
              onClick={() => setActivePeriod(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="slr-revenue-metrics">
          <div>
            <span>Doanh thu gộp</span>
            <strong>
              <AnimatedValue value={formatCurrency(data.summary.grossRevenue)} />
            </strong>
          </div>
          <div>
            <span>Doanh thu ròng</span>
            <strong>
              <AnimatedValue value={formatCurrency(data.summary.netRevenue)} />
            </strong>
          </div>
          <div>
            <span>Phí hoa hồng</span>
            <strong>
              <AnimatedValue value={formatCurrency(data.summary.commissionFee)} />
            </strong>
          </div>
          <div>
            <span>Hoàn tiền</span>
            <strong>
              <AnimatedValue value={formatCurrency(data.summary.refundAmount)} />
            </strong>
          </div>
          <div className="highlight">
            <span>Lợi nhuận</span>
            <strong>
              <AnimatedValue value={formatCurrency(data.summary.profit)} />
            </strong>
            <small>Doanh thu − Hoa hồng − Hoàn tiền</small>
          </div>
        </div>

        <div className="slr-charts-row slr-charts-row--main">
          <div className="slr-chart-card">
            <h3>Xu hướng doanh thu — {period.label}</h3>
            <div className="slr-chart-card__body">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.trend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueTrendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_ACCENT} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={CHART_ACCENT} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...chartGridProps} />
                  <XAxis dataKey="label" {...chartAxisProps} interval={trendInterval} />
                  <YAxis {...chartAxisProps} width={40} />
                  <Tooltip {...chartTooltipStyle} formatter={(value) => [`${value}M`, "Doanh thu"]} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={CHART_ACCENT}
                    strokeWidth={2}
                    fill="url(#revenueTrendGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="slr-chart-card">
            <h3>Doanh thu theo danh mục</h3>
            <div className="slr-chart-card__body">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.byCategory} dataKey="value" nameKey="label" innerRadius="55%" outerRadius="85%" paddingAngle={3}>
                    {data.byCategory.map((entry, i) => (
                      <Cell key={entry.label} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    {...chartTooltipStyle}
                    formatter={(value, name, props) => [`${value}% — ${props.payload.amount}`, name]}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="slr-chart-card">
          <h3>Doanh thu theo sản phẩm</h3>
          <div className="slr-chart-card__body">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.byProduct} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid {...chartGridProps} horizontal={false} />
                <XAxis type="number" {...chartAxisProps} />
                <YAxis type="category" dataKey="label" {...chartAxisProps} width={130} />
                <Tooltip {...chartTooltipStyle} formatter={(value) => [`${value}M`, "Doanh thu"]} />
                <Bar dataKey="value" fill={CHART_ACCENT_SOFT} radius={[0, 8, 8, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="slr-section">
        <header className="slr-section__header">
          <div>
            <h2>Top sản phẩm &amp; khách hàng</h2>
            <p>Những cái tên đóng góp doanh thu nhiều nhất kỳ này</p>
          </div>
        </header>
        <div className="slr-top-grid slr-top-grid--split">
          <div className="slr-top-card">
            <h4>Sản phẩm bán chạy nhất</h4>
            <ul>
              {topProducts.bestSelling.map((item) => (
                <li key={item.name}>
                  <strong>{item.name}</strong>
                  <span>
                    {item.sold} đã bán — {item.revenue}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="slr-top-card">
            <h4>Khách hàng chi tiêu nhiều nhất</h4>
            <ul>
              {topCustomers.map((item) => (
                <li key={item.name}>
                  <strong>{item.name}</strong>
                  <span>
                    {item.orders} đơn — {item.spent}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
