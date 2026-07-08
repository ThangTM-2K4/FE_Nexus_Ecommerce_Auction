import { useEffect, useState } from 'react';
import * as buyerTrustService from '../../../services/buyerTrustService';
import './index.scss';

export default function BuyerTrustScore() {
  const [trust, setTrust] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buyerTrustService.getBuyerTrust().then((data) => {
      setTrust(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="buyer-trust buyer-trust--loading">Đang tải uy tín...</div>;
  }

  if (!trust) return null;

  const progress = Math.min(100, Math.round((trust.score / trust.maxScore) * 100));

  return (
    <section className="buyer-trust">
      <h2 className="buyer-trust__title">Uy Tín Người Mua</h2>

      <div className="buyer-trust__bar-wrap">
        <div className="buyer-trust__bar" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="buyer-trust__bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="buyer-trust__meta">
        <span className="buyer-trust__badge">{trust.level}</span>
        <span className="buyer-trust__score">
          <strong>{trust.score}</strong> / {trust.maxScore} điểm
        </span>
      </div>

      <p className="buyer-trust__desc">{trust.description}</p>
    </section>
  );
}
