import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { formatPrice } from '../../../utils/formatPrice';
import AuctionImage from '../auctionImage';
import AuctionCountdown from '../auctionCountdown';
import './index.scss';

export default function AuctionCard({ auction, onClick }) {
  const [isHearted, setIsHearted] = useState(false);

  const handleClick = () => onClick?.(auction);

  const handleHeartClick = (e) => {
    e.stopPropagation();
    setIsHearted((prev) => {
      const next = !prev;
      if (next) {
        toast.success('Đã thêm vào mục đang theo dõi');
      } else {
        toast.info('Đã gỡ khỏi mục đang theo dõi');
      }
      return next;
    });
  };

  return (
    <motion.article
      className="auction-card"
      onClick={handleClick}
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleClick();
        }
      }}
      aria-label={`${auction.title}, giá hiện tại ${formatPrice(auction.currentBid)}`}
    >
      <div className="auction-card__image-wrap">
        <AuctionImage
          src={auction.image}
          alt={auction.title}
          categoryLabel={auction.categoryLabel}
          isLive={auction.isLive && auction.endTime > Date.now()}
          isUpcoming={auction.isUpcoming}
        />
      </div>

      <div className="auction-card__body">
        <h3 className="auction-card__title">{auction.title}</h3>
        <p className="auction-card__desc">{auction.description}</p>

        <div className="auction-card__footer">
          <div className="auction-card__price">
            <span>{auction.isUpcoming ? "Giá khởi điểm" : "Giá thầu hiện tại"}</span>
            <strong>{formatPrice(auction.currentBid)}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AuctionCountdown endTime={auction.endTime} isUpcoming={auction.isUpcoming} />
            <button
              type="button"
              className={`auction-card__heart-btn ${isHearted ? 'active' : ''}`}
              onClick={handleHeartClick}
              title={isHearted ? "Bỏ theo dõi" : "Thêm vào đang theo dõi"}
            >
              {isHearted ? <FaHeart /> : <FaRegHeart />}
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
