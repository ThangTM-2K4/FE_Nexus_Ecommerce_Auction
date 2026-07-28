import { FiClock } from 'react-icons/fi';
import { useCountdown } from '../../../hooks/useCountdown';
import './index.scss';

function formatCountdown({ days, hours, minutes, seconds, isEnded, isUpcoming }) {
  if (isEnded) return 'Đã kết thúc';
  
  const timeStr = days > 0 ? `${days}d ${hours}h` : (hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m ${seconds}s`);
  return isUpcoming ? `Bắt đầu sau ${timeStr}` : timeStr;
}

export default function AuctionCountdown({ endTime, isUpcoming }) {
  const { days, hours, minutes, seconds, isEnded, totalMs } = useCountdown(endTime);
  const isUrgent = !isEnded && !isUpcoming && totalMs < 3_600_000;

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
      {formatCountdown({ days, hours, minutes, seconds, isEnded, isUpcoming })}
    </span>
  );
}
