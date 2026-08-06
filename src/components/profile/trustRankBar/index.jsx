import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import * as reputationService from '../../../services/reputationService';
import { getRankLabelVn, RANK_CLASS } from '../../../utils/rankLabels';
import ProgressBar from '../progressBar';
import RankBadge from '../rankBadge';
import './index.scss';

export default function TrustRankBar({ profile, sellerStatus, type }) {
  const { user } = useAuth();
  const [reputation, setReputation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id || !profile) return;
    setLoading(true);
    reputationService.getUserReputation(user.id, profile, sellerStatus).then((data) => {
      setReputation(data);
      setLoading(false);
    });
  }, [user?.id, profile, sellerStatus]);

  if (loading) {
    return <div className="account-trust-bar account-trust-bar--loading">Đang tải uy tín...</div>;
  }

  if (!reputation) return null;

  // Xác định hiển thị Uy tín Người bán hay Uy tín Người mua
  const isSellerMode = type === 'seller' || (sellerStatus && reputation.sellerProfile?.score != null);
  const targetProfile = isSellerMode && reputation.sellerProfile
    ? reputation.sellerProfile
    : reputation.buyerProfile;

  if (!targetProfile) return null;

  const { score, rank } = targetProfile;
  const label = isSellerMode ? 'Uy tín người bán' : 'Uy tín người mua';
  const progress = reputationService.getRankProgress(score, rank);
  const nextRank = reputationService.getNextRank(rank);
  const pointsToNext = reputationService.getPointsToNextRank(score, rank);
  const rankClass = RANK_CLASS[rank] || '';

  return (
    <div className="account-trust-bar">
      <div className="account-trust-bar__header">
        <span className="account-trust-bar__label">{label}</span>
        <RankBadge rank={rank} />
      </div>

      <ProgressBar value={progress} rankClass={rankClass} ariaLabel="Tiến độ hạng thành viên" />

      <p className="account-trust-bar__meta">
        <strong>{score}</strong> điểm
        {nextRank ? (
          <>
            {' '}
            · Cần thêm <strong>{pointsToNext}</strong> điểm để lên hạng{' '}
            <strong>{getRankLabelVn(nextRank)}</strong>
          </>
        ) : (
          <> · Bạn đã đạt hạng cao nhất</>
        )}
      </p>
    </div>
  );
}
