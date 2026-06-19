import { useEffect, useState } from "react";
import PageHeader from "../../../components/seller/sellerPageHeader";
import AnimatedValue from "../../../components/seller/sellerAnimatedValue";
import AnimatedBar from "../../../components/seller/sellerAnimatedBar";
import {
  revenueSummary,
  revenueTrend,
  revenueByCategory,
  revenueByProduct,
} from "../../../data/sellerMockData";

export default function RevenuePage() {
  const maxTrend = Math.max(...revenueTrend.map((d) => d.value));
  const maxProduct = Math.max(...revenueByProduct.map((d) => d.value));
  const [linePoints, setLinePoints] = useState("");

  useEffect(() => {
    const points = revenueTrend
      .map((d, i) => {
        const x = (i / (revenueTrend.length - 1)) * 300;
        const y = 110 - (d.value / maxTrend) * 90;
        return `${x},${y}`;
      })
      .join(" ");
    const t = setTimeout(() => setLinePoints(points), 100);
    return () => clearTimeout(t);
  }, [maxTrend]);

  return (
    <div className="slr-page">
      <PageHeader
        kicker="Phân tích"
        title="Doanh thu"
        subtitle="Phân tích doanh thu theo thời gian và danh mục"
      />

      <section className="slr-section">
        <div className="slr-revenue-tabs">
          {["Hôm nay", "7 ngày", "30 ngày", "Theo tháng", "Theo năm"].map((t, i) => (
            <button key={t} type="button" className={i === 1 ? "active" : ""}>
              {t}
            </button>
          ))}
        </div>

        <div className="slr-revenue-metrics">
          <div>
            <span>Gross Revenue</span>
            <strong><AnimatedValue value={revenueSummary.grossRevenue} /></strong>
          </div>
          <div>
            <span>Net Revenue</span>
            <strong><AnimatedValue value={revenueSummary.netRevenue} /></strong>
          </div>
          <div>
            <span>Commission Fee</span>
            <strong><AnimatedValue value={revenueSummary.commissionFee} /></strong>
          </div>
          <div>
            <span>Refund Amount</span>
            <strong><AnimatedValue value={revenueSummary.refundAmount} /></strong>
          </div>
          <div className="highlight">
            <span>Profit</span>
            <strong><AnimatedValue value={revenueSummary.profit} /></strong>
            <small>Revenue − Commission − Refunds</small>
          </div>
        </div>

        <div className="slr-charts-row">
          <div className="slr-chart-card">
            <h3>Revenue Trend</h3>
            <div className="slr-line-chart">
              <svg viewBox="0 0 300 120" preserveAspectRatio="none">
                <polyline fill="none" stroke="currentColor" strokeWidth="2" points={linePoints} />
              </svg>
              <div className="slr-line-chart__labels">
                {revenueTrend.map((d) => (
                  <span key={d.label}>{d.label}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="slr-chart-card">
            <h3>Revenue by Category</h3>
            <ul className="slr-pie-legend">
              {revenueByCategory.map((c, i) => (
                <li key={c.label} style={{ animationDelay: `${i * 80}ms` }}>
                  <span className="dot" style={{ opacity: c.value / 40 }} />
                  <span>{c.label}</span>
                  <strong><AnimatedValue value={`${c.value}%`} /></strong>
                  <em>{c.amount}</em>
                </li>
              ))}
            </ul>
          </div>

          <div className="slr-chart-card">
            <h3>Revenue by Product</h3>
            <div className="slr-bar-chart">
              {revenueByProduct.map((p, i) => (
                <div key={p.label} className="slr-bar-chart__item">
                  <span className="label">{p.label}</span>
                  <div className="bar-wrap">
                    <AnimatedBar
                      percent={(p.value / maxProduct) * 100}
                      delay={i * 100}
                    />
                  </div>
                  <span className="val"><AnimatedValue value={p.value} />M</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
