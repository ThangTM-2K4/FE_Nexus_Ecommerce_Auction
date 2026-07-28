import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import * as reputationService from '../../../services/reputationService';
import './index.scss';

const RANK_LABEL = {
  Silver: 'Bạc',
  Gold: 'Vàng',
  Platinum: 'Bạch Kim',
  Diamond: 'Kim Cương',
};

const DESCRIPTION =
  'Điểm uy tín phản ánh mức độ tin cậy khi mua hàng và tham gia đấu giá. ' +
  'Điểm tăng khi bạn xác minh tài khoản, hoàn tất giao dịch và bị trừ khi vi phạm; ' +
  'điểm cao giúp tăng giới hạn đấu giá và được người bán ưu tiên xử lý đơn.';

// "Uy Tín Người Mua" — đọc điểm THẬT từ hồ sơ (getMe trả kèm reputation),
// fallback về công thức tính khi backend chưa có điểm. Không còn hardcode.
export default function BuyerTrustScore({ profile }) {
  const { user } = useAuth();
  const [buyer, setBuyer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id || !profile) return;
    setLoading(true);
    reputationService
      .getUserReputation(user.id, profile, user?.sellerStatus)
      .then((data) => {
        setBuyer(data.buyerProfile);
        setLoading(false);
      });
  }, [user?.id, user?.sellerStatus, profile]);

  if (loading) {
    return (
      <section className="profile-section buyer-trust">
        <div className="buyer-trust--loading">Đang tải uy tín...</div>
      </section>
    );
  }

  if (!buyer) return null;

  const progress = reputationService.getRankProgress(buyer.score, buyer.rank);
  const nextRank = reputationService.getNextRank(buyer.rank);
  const pointsToNext = reputationService.getPointsToNextRank(buyer.score, buyer.rank);

  return (
    <section className="profile-section buyer-trust">
      <div className="profile-section-header">
        <h2>Uy Tín Người Mua</h2>
      </div>

      {/* Điểm và Hạng — 2 ô thống kê chính */}
      <div className="buyer-trust__stats">
        <div className="buyer-trust__stat">
          <span className="buyer-trust__stat-label">Điểm</span>
          <span className="buyer-trust__stat-value">{buyer.score}</span>
        </div>

        <div className="buyer-trust__stat">
          <span className="buyer-trust__stat-label">Hạng</span>
          <span className="buyer-trust__badge">{RANK_LABEL[buyer.rank] || buyer.rank}</span>
        </div>
      </div>

      <div className="buyer-trust__bar-wrap">
        <div
          className="buyer-trust__bar"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Tiến độ lên hạng tiếp theo"
        >
          <div className="buyer-trust__bar-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="buyer-trust__bar-pct">
          {nextRank
            ? `Còn ${pointsToNext} điểm để lên ${RANK_LABEL[nextRank] || nextRank}`
            : 'Đã đạt hạng cao nhất'}
        </span>
      </div>

      <p className="buyer-trust__desc">{DESCRIPTION}</p>
    </section>
  );
}
