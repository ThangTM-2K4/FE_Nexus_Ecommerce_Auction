import { getRankLabelVn, RANK_CLASS } from '../../../utils/rankLabels';
import './index.scss';

export default function RankBadge({ rank, className = '' }) {
  if (!rank) return null;

  const rankClass = RANK_CLASS[rank] || '';
  const label = getRankLabelVn(rank);

  return (
    <span className={`account-rank-badge ${rankClass} ${className}`.trim()}>
      {label}
    </span>
  );
}
