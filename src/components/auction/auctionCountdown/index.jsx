import { FiClock } from 'react-icons/fi';
import { useCountdown } from '../../../hooks/useCountdown';
import './index.scss';

function formatCountdown({ days, hours, minutes, seconds, isEnded }) {
  if (isEnded) return 'Đã kết thúc';
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${seconds}s`;
}

export default function AuctionCountdown({ endTime }) {
  const { days, hours, minutes, seconds, isEnded, totalMs } = useCountdown(endTime);
  const isUrgent = !isEnded && totalMs < 3_600_000;

  const className = [
    'auction-countdown',
    isEnded ? 'auction-countdown--ended' : '',
    isUrgent ? 'auction-countdown--urgent' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={className} aria-live="polite">
      <FiClock size={14} aria-hidden />
      {formatCountdown({ days, hours, minutes, seconds, isEnded })}
    </span>
  );
}
