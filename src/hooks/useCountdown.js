import { useEffect, useState } from 'react';

function computeRemaining(endTime) {
  const diff = Math.max(0, endTime - Date.now());

  if (diff === 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true, totalMs: 0 };
  }

  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1_000);

  return { days, hours, minutes, seconds, isEnded: false, totalMs: diff };
}

/**
 * Real-time countdown toward `endTime` (Unix ms timestamp).
 * @returns {{ days: number, hours: number, minutes: number, seconds: number, isEnded: boolean, totalMs: number }}
 */
export function useCountdown(endTime) {
  const [remaining, setRemaining] = useState(() => computeRemaining(endTime));

  useEffect(() => {
    const tick = () => setRemaining(computeRemaining(endTime));
    tick();
    const intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, [endTime]);

  return remaining;
}
