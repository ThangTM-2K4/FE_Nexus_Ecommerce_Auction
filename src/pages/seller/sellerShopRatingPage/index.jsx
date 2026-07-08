import { Link } from "react-router-dom";
import PageHeader from "../../../components/sellerdashboard/sellerPageHeader";
import MiniStat from "../../../components/sellerdashboard/sellerMiniStat";
import AnimatedValue from "../../../components/sellerdashboard/sellerAnimatedValue";
import AnimatedBar from "../../../components/sellerdashboard/sellerAnimatedBar";
import { shopRatingSummary, reviewSummary, ratingDistribution } from "../../../data/sellerMockData";

export default function ShopRatingPage() {
  return (
    <div className="slr-page">
      <PageHeader
        title="Đánh Giá Shop"
        subtitle="Chỉ số uy tín và mức độ hài lòng của khách hàng với Shop của bạn"
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
          <p className="slr-wallet-note">
            Tổng {reviewSummary.totalReviews} đánh giá sản phẩm — xem chi tiết từng nhận xét tại{" "}
            <Link to="/seller-hub/reviews">Đánh giá</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}
