import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import * as reputationService from '../../../services/reputationService';

const RANK_CLASS = {
  Silver: 'rank-silver',
  Gold: 'rank-gold',
  Platinum: 'rank-platinum',
  Diamond: 'rank-diamond',
};

const formatVnd = (n) => new Intl.NumberFormat('vi-VN').format(n);

function ReputationCard({ title, score, rank, progress, nextRank, extra }) {
  return (
    <div className="profile-reputation-card">
      <div className="profile-reputation-card-header">
        <h3>{title}</h3>
        <span className={`profile-rank-badge ${RANK_CLASS[rank] || ''}`}>{rank}</span>
      </div>
      <div className="profile-reputation-score">
        <span className="profile-reputation-score-value">{score}</span>
        <span className="profile-reputation-score-label">điểm uy tín</span>
      </div>
      <div className="profile-reputation-progress">
        <div className="profile-reputation-progress-bar">
          <div
            className={`profile-reputation-progress-fill ${RANK_CLASS[rank] || ''}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        {nextRank && (
          <small>Tiến tới {nextRank}: {progress}%</small>
        )}
        {!nextRank && <small>Đã đạt hạng cao nhất</small>}
      </div>
      {extra && <div className="profile-reputation-extra">{extra}</div>}
    </div>
  );
}

export default function ReputationOverviewSection({ profile, sellerStatus }) {
  const { user, isBuyerMode } = useAuth();
  const [reputation, setReputation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id || !profile) return;
    reputationService.getUserReputation(user.id, profile, sellerStatus).then((data) => {
      setReputation(data);
      setLoading(false);
    });
  }, [user?.id, profile, sellerStatus]);

  if (loading) {
    return (
      <section className="profile-section" id="reputation">
        <div className="profile-section-header">
          <h2>Uy tín & Hạng</h2>
        </div>
        <p className="profile-empty-hint">Đang tải...</p>
      </section>
    );
  }

  if (!reputation) return null;

  const { buyerProfile, sellerProfile } = reputation;
  const buyerProgress = reputationService.getRankProgress(buyerProfile.score, buyerProfile.rank);
  const buyerNextRank = reputationService.getNextRank(buyerProfile.rank);

  return (
    <section className="profile-section" id="reputation">
      <div className="profile-section-header">
        <h2>Uy tín & Hạng</h2>
        <span className={`profile-mode-badge ${isBuyerMode ? 'buyer' : 'seller'}`}>
          Chế độ: {isBuyerMode ? 'Người mua' : 'Người bán'}
        </span>
      </div>

      <div className="profile-reputation-overview">
        <ReputationCard
          title="Uy tín Người mua"
          score={buyerProfile.score}
          rank={buyerProfile.rank}
          progress={buyerProgress}
          nextRank={buyerNextRank}
          extra={
            <>
              <span className="profile-reputation-detail">
                Tổng chi tiêu: {formatVnd(buyerProfile.totalSpent)} VND
              </span>
              <span className="profile-reputation-detail">
                Đấu giá: {reputationService.getAuctionAccessLabel(buyerProfile.rank)}
              </span>
            </>
          }
        />

        {sellerProfile && (
          <ReputationCard
            title="Uy tín Người bán"
            score={sellerProfile.score}
            rank={sellerProfile.rank}
            progress={reputationService.getRankProgress(sellerProfile.score, sellerProfile.rank)}
            nextRank={reputationService.getNextRank(sellerProfile.rank)}
            extra={
              <span className="profile-reputation-detail">
                Trạng thái: {sellerProfile.status === 'APPROVED' ? 'Đã phê duyệt' : sellerProfile.status}
              </span>
            }
          />
        )}
      </div>
    </section>
  );
}
