import { motion } from 'framer-motion';
import { formatPrice } from '../../../utils/formatPrice';
import AuctionImage from '../auctionImage';
import AuctionCountdown from '../auctionCountdown';
import './index.scss';

export default function AuctionCard({ auction, onClick }) {
  const handleClick = () => onClick?.(auction);

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
        />
      </div>

      <div className="auction-card__body">
        <h3 className="auction-card__title">{auction.title}</h3>
        <p className="auction-card__desc">{auction.description}</p>

        <div className="auction-card__footer">
          <div className="auction-card__price">
            <span>Giá thầu hiện tại</span>
            <strong>{formatPrice(auction.currentBid)}</strong>
          </div>
          <AuctionCountdown endTime={auction.endTime} />
        </div>
      </div>
    </motion.article>
  );
}
