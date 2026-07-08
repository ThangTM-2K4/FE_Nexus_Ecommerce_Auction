import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import * as reputationService from '../../../services/reputationService';
import { getRankLabelVn, RANK_CLASS } from '../../../utils/rankLabels';
import ProgressBar from '../progressBar';
import RankBadge from '../rankBadge';
import './index.scss';

export default function TrustRankBar({ profile, sellerStatus }) {
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

  if (!reputation?.buyerProfile) return null;

  const { score, rank } = reputation.buyerProfile;
  const progress = reputationService.getRankProgress(score, rank);
  const nextRank = reputationService.getNextRank(rank);
  const pointsToNext = reputationService.getPointsToNextRank(score, rank);
  const rankClass = RANK_CLASS[rank] || '';

  return (
    <div className="account-trust-bar">
      <div className="account-trust-bar__header">
        <span className="account-trust-bar__label">Uy tín người mua</span>
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
