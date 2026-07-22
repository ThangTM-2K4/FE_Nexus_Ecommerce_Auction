import { useState } from 'react';
import './index.scss';

export default function AuctionImage({
  src,
  alt,
  categoryLabel,
  isLive = false,
  isUpcoming = false,
  className = '',
}) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`auction-image ${className}`.trim()}>
      {!hasError && src ? (
        <img src={src} alt={alt} loading="lazy" onError={() => setHasError(true)} />
      ) : (
        <div className="auction-image__fallback" aria-hidden>
          Không có ảnh
        </div>
      )}
      {isLive && <span className="auction-image__live">TRỰC TIẾP</span>}
      {isUpcoming && <span className="auction-image__upcoming">CHUẨN BỊ</span>}
      {categoryLabel && <span className="auction-image__category">{categoryLabel}</span>}
    </div>
  );
}
