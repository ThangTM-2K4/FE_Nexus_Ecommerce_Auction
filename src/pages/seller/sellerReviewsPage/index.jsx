import PageHeader from "../../../components/sellerdashboard/sellerPageHeader";
import AnimatedValue from "../../../components/sellerdashboard/sellerAnimatedValue";
import AnimatedBar from "../../../components/sellerdashboard/sellerAnimatedBar";
import MiniStat from "../../../components/sellerdashboard/sellerMiniStat";
import {
  reviewSummary,
  recentReviews,
  complaints,
  flaggedProducts,
  ratingDistribution,
  reviewedProducts,
} from "../../../data/sellerMockData";

export default function ReviewsPage() {
  return (
    <div className="slr-page">
      <PageHeader title="Đánh giá và phản hồi" subtitle="Đánh giá, nhận xét và khiếu nại" />

      <section className="slr-section">
        <div className="slr-review-summary">
          <div className="slr-review-score">
            <strong>
              <AnimatedValue value={reviewSummary.averageRating} />
            </strong>
            <span>★ Trung bình</span>
          </div>
          <MiniStat label="Tổng đánh giá" value={reviewSummary.totalReviews} delay={60} />
          <MiniStat label="5 sao" value={reviewSummary.fiveStar} delay={120} />
          <MiniStat label="1 sao" value={reviewSummary.oneStar} warn delay={180} />
        </div>

        <div className="slr-page-split">
          <div className="slr-rating-panel">
            <h4>Phân bố đánh giá</h4>
            <div className="slr-rating-bars">
              {ratingDistribution.map((r, i) => (
                <div key={r.stars} className="slr-rating-row">
                  <span>{r.stars} ★</span>
                  <div className="slr-rating-track">
                    <AnimatedBar percent={r.percent} delay={i * 80} />
                  </div>
                  <em>{r.count}</em>
                  <strong>{r.percent}%</strong>
                </div>
              ))}
            </div>
            <h4>Sản phẩm được đánh giá</h4>
            <div className="slr-table-wrap">
              <table className="slr-table slr-table--compact">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Đánh giá</th>
                    <th>Lượt đánh giá</th>
                  </tr>
                </thead>
                <tbody>
                  {reviewedProducts.map((p) => (
                    <tr key={p.name}>
                      <td>
                        <div className="slr-product-cell">
                          <img src={p.image} alt="" />
                          <span>{p.name}</span>
                        </div>
                      </td>
                      <td className="pos">★ {p.rating}</td>
                      <td>{p.reviews}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="slr-table-col">
            <div className="slr-feedback-card">
              <h4>Đánh giá mới nhất</h4>
              {recentReviews.map((r) => (
                <article key={r.user + r.time}>
                  <div>
                    <strong>{r.user}</strong>
                    <span>★ {r.rating}</span>
                  </div>
                  <p>
                    {r.product} — {r.comment}
                  </p>
                  <time>{r.time}</time>
                </article>
              ))}
            </div>
            <div className="slr-feedback-card">
              <h4>Khiếu nại mới</h4>
              {complaints.map((c) => (
                <article key={c.user}>
                  <strong>{c.user}</strong>
                  <p>
                    {c.issue} ({c.product})
                  </p>
                  <span className="badge">{c.status}</span>
                </article>
              ))}
              <h4 className="mt">SP bị phản hồi nhiều</h4>
              {flaggedProducts.map((p) => (
                <article key={p.name}>
                  <strong>{p.name}</strong>
                  <p>
                    {p.complaints} khiếu nại · ★ {p.rating}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
