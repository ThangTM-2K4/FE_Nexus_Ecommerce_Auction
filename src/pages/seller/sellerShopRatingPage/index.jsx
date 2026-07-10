import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../../components/sellerdashboard/sellerPageHeader";
import MiniStat from "../../../components/sellerdashboard/sellerMiniStat";
import AnimatedValue from "../../../components/sellerdashboard/sellerAnimatedValue";
import AnimatedBar from "../../../components/sellerdashboard/sellerAnimatedBar";
import {
  shopRatingSummary,
  reviewSummary,
  ratingDistribution,
  shopReviews,
} from "../../../data/sellerMockData";

const STAR_FILTERS = [
  { id: "all", label: "Tất cả" },
  { id: "5", label: "5 ★" },
  { id: "4", label: "4 ★" },
  { id: "3", label: "3 ★" },
  { id: "2", label: "2 ★" },
  { id: "1", label: "1 ★" },
];

const Stars = ({ n }) => (
  <span className="slr-stars" aria-label={`${n} sao`}>
    {"★★★★★".slice(0, n)}
    <span className="slr-stars__empty">{"★★★★★".slice(n)}</span>
  </span>
);

export default function ShopRatingPage() {
  const [starFilter, setStarFilter] = useState("all");

  const visibleReviews = useMemo(
    () => (starFilter === "all" ? shopReviews : shopReviews.filter((r) => r.rating === Number(starFilter))),
    [starFilter]
  );

  return (
    <div className="slr-page">
      <PageHeader
        title="Đánh Giá Shop"
        subtitle="Chỉ số uy tín, mức độ hài lòng và nhận xét của khách hàng với Shop của bạn"
      />

      <section className="slr-section">
        <div className="slr-review-summary">
          <div className="slr-review-score">
            <strong>
              <AnimatedValue value={shopRatingSummary.overallScore} />
            </strong>
            <span>★ Điểm Shop</span>
          </div>
          <MiniStat label="Lượt đánh giá" value={shopRatingSummary.totalRatings} delay={60} />
          <MiniStat label="Tỉ lệ phản hồi chat" value={`${shopRatingSummary.responseRate}%`} delay={120} />
          <MiniStat label="Giao đúng hẹn" value={`${shopRatingSummary.shipOnTimeRate}%`} delay={180} />
          <MiniStat label="Vi phạm" value={shopRatingSummary.violations} warn={shopRatingSummary.violations > 0} delay={240} />
        </div>

        <div className="slr-panel-card">
          <h4>Phân bố đánh giá sản phẩm</h4>
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
        </div>

        <div className="slr-panel-card">
          <div className="slr-toolbar">
            <h4 style={{ margin: 0 }}>Bình luận của người mua</h4>
            <div className="slr-filter-tabs">
              {STAR_FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`slr-filter-tab ${starFilter === f.id ? "active" : ""}`}
                  onClick={() => setStarFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <ul className="slr-comment-list">
            {visibleReviews.map((r) => (
              <li key={r.id} className="slr-comment">
                <div className="slr-comment__avatar">{r.avatar}</div>
                <div className="slr-comment__body">
                  <div className="slr-comment__head">
                    <strong>{r.user}</strong>
                    <Stars n={r.rating} />
                    <time>{r.time}</time>
                  </div>
                  <span className="slr-comment__product">{r.product}</span>
                  <p className="slr-comment__text">{r.comment}</p>
                  {r.images > 0 && (
                    <div className="slr-comment__images">
                      {Array.from({ length: r.images }).map((_, i) => (
                        <span key={i} className="slr-comment__thumb">🖼️</span>
                      ))}
                    </div>
                  )}
                  <div className="slr-comment__meta">
                    <span>👍 {r.likes} hữu ích</span>
                  </div>
                  {r.reply && (
                    <div className="slr-comment__reply">
                      <strong>Phản hồi từ Shop:</strong> {r.reply}
                    </div>
                  )}
                </div>
              </li>
            ))}
            {visibleReviews.length === 0 && (
              <li className="slr-comment slr-comment--empty">Chưa có bình luận nào ở mức đánh giá này.</li>
            )}
          </ul>

          <p className="slr-wallet-note">
            Tổng {reviewSummary.totalReviews} đánh giá sản phẩm — quản lý phản hồi và khiếu nại tại{" "}
            <Link to="/seller-hub/reviews">Đánh giá &amp; phản hồi</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}
