import { useEffect, useState } from "react";
import PageHeader from "../../../components/seller/sellerPageHeader";
import AnimatedValue from "../../../components/seller/sellerAnimatedValue";
import KpiCard from "../../../components/seller/sellerKpiCard";
import {
  conversionFunnel,
  salesKpis,
  channelPerformance,
  topClickedProducts,
} from "../../../data/sellerMockData";
import { sellerImages } from "../../../data/sellerImages";

export default function PerformancePage() {
  const [funnelReady, setFunnelReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setFunnelReady(true), 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="slr-page">
      <PageHeader
        title="Hiệu quả bán hàng"
        subtitle="Conversion funnel và KPI hiệu suất"
      />

      <section className="slr-section">
        <div className="slr-page-split">
          <div className="slr-table-col">
            <div className="slr-panel-card">
              <h4>Conversion Funnel</h4>
              <div className="slr-funnel">
                {conversionFunnel.map((step, i) => (
                  <div key={step.label} className="slr-funnel__step">
                    <div
                      className="slr-funnel__bar"
                      style={{
                        width: funnelReady
                          ? `${(step.value / conversionFunnel[0].value) * 100}%`
                          : "0%",
                      }}
                    >
                      <strong><AnimatedValue value={step.value} /></strong>
                      <span>{step.label}</span>
                      {step.rate && <em>↓ {step.rate}</em>}
                    </div>
                    {i < conversionFunnel.length - 1 && (
                      <span className="slr-funnel__arrow">↓</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="slr-media-card slr-media-card--banner">
              <img src={sellerImages.catTech} alt="" />
              <div className="slr-media-card__overlay">
                <strong>CTR trung bình 8.4%</strong>
                <span>Danh mục Công nghệ dẫn đầu</span>
              </div>
            </div>
          </div>

          <div className="slr-table-col">
            <div className="slr-panel-card">
              <h4>Hiệu suất theo kênh</h4>
              <table className="slr-table slr-table--compact">
                <thead>
                  <tr>
                    <th>Kênh</th>
                    <th>Lượt xem</th>
                    <th>Click</th>
                    <th>Chuyển đổi</th>
                    <th>Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {channelPerformance.map((c) => (
                    <tr key={c.channel}>
                      <td><strong>{c.channel}</strong></td>
                      <td>{c.views.toLocaleString("vi-VN")}</td>
                      <td>{c.clicks.toLocaleString("vi-VN")}</td>
                      <td className="pos">{c.conversion}</td>
                      <td>{c.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="slr-panel-card">
              <h4>Sản phẩm được click nhiều</h4>
              <table className="slr-table slr-table--compact">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Click</th>
                    <th>CTR</th>
                  </tr>
                </thead>
                <tbody>
                  {topClickedProducts.map((p) => (
                    <tr key={p.name}>
                      <td>
                        <div className="slr-product-cell">
                          <img src={p.image} alt="" />
                          <span>{p.name}</span>
                        </div>
                      </td>
                      <td>{p.clicks.toLocaleString("vi-VN")}</td>
                      <td className="pos">{p.ctr}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="slr-metrics-grid slr-metrics-grid--3">
          {salesKpis.map((k, i) => (
            <KpiCard
              key={k.label}
              label={k.label}
              value={k.value}
              hint={k.change}
              warn={k.negative}
              delay={i * 80}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
