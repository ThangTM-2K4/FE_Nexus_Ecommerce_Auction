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
    return (
      <section className="profile-section buyer-trust">
        <div className="buyer-trust--loading">Đang tải uy tín...</div>
      </section>
    );
  }

  if (!trust) return null;

  const progress = Math.min(100, Math.round((trust.score / trust.maxScore) * 100));

  return (
    <section className="profile-section buyer-trust">
      <div className="profile-section-header">
        <h2>Uy Tín Người Mua</h2>
      </div>

      {/* Điểm và Hạng — 2 ô thống kê chính */}
      <div className="buyer-trust__stats">
        <div className="buyer-trust__stat">
          <span className="buyer-trust__stat-label">Điểm</span>
          <span className="buyer-trust__stat-value">
            {trust.score}
            <small>/ {trust.maxScore}</small>
          </span>
        </div>

        <div className="buyer-trust__stat">
          <span className="buyer-trust__stat-label">Hạng</span>
          <span className="buyer-trust__badge">{trust.level}</span>
        </div>
      </div>

      <div className="buyer-trust__bar-wrap">
        <div
          className="buyer-trust__bar"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Điểm uy tín người mua"
        >
          <div className="buyer-trust__bar-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="buyer-trust__bar-pct">{progress}%</span>
      </div>

      <p className="buyer-trust__desc">{trust.description}</p>
    </section>
  );
}
