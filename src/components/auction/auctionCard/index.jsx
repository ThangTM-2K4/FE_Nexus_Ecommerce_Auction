import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { formatPrice } from '../../../utils/formatPrice';
import AuctionImage from '../auctionImage';
import AuctionCountdown from '../auctionCountdown';
import './index.scss';

const WATCHLIST_KEY = "auc_watchlist";

export function getWatchlist() {
  try {
    return JSON.parse(localStorage.getItem(WATCHLIST_KEY) || "[]");
  } catch {
    return [];
  }
}

export function isItemInWatchlist(id) {
  if (!id) return false;
  const list = getWatchlist();
  return list.some((item) => String(item.id) === String(id));
}

export function toggleWatchlist(auction) {
  if (!auction || !auction.id) return false;
  const list = getWatchlist();
  const exists = list.some((item) => String(item.id) === String(auction.id));
  let updated = [];
  if (exists) {
    updated = list.filter((item) => String(item.id) !== String(auction.id));
  } else {
    const formattedPrice =
      typeof auction.currentBid === "number"
        ? formatPrice(auction.currentBid)
        : auction.currentPrice || auction.currentBid || "100.000.000 ₫";

    updated = [
      {
        id: auction.id,
        title: auction.title,
        description: auction.description || "",
        image: auction.image || auction.images?.[0] || "",
        currentBid: auction.currentBid || 100000000,
        currentPrice: formattedPrice,
        categoryLabel: auction.categoryLabel || auction.category || "",
        endTime: auction.endTime || Date.now() + 86400000,
        timeLeft: auction.timeLeft || "24h 00m",
        isLive: auction.isLive ?? true,
        isUpcoming: auction.isUpcoming ?? false,
        addedAt: new Date().toISOString(),
      },
      ...list,
    ];
  }
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("storage"));
  return !exists;
}

export default function AuctionCard({ auction, onClick }) {
  const [isHearted, setIsHearted] = useState(() => isItemInWatchlist(auction?.id));

  useEffect(() => {
    setIsHearted(isItemInWatchlist(auction?.id));
  }, [auction?.id]);

  const handleClick = () => onClick?.(auction);

  const handleHeartClick = (e) => {
    e.stopPropagation();
    const isNowAdded = toggleWatchlist(auction);
    setIsHearted(isNowAdded);
    if (isNowAdded) {
      toast.success('🎉 Đã thêm sản phẩm vào mục Đang Theo Dõi!');
    } else {
      toast.info('Đã gỡ sản phẩm khỏi mục Đang Theo Dõi');
    }
  };

  const displayPrice = typeof auction.currentBid === 'number'
    ? formatPrice(auction.currentBid)
    : auction.currentPrice || auction.currentBid;

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
      aria-label={`${auction.title}, giá hiện tại ${displayPrice}`}
    >
      <div className="auction-card__image-wrap">
        <AuctionImage
          src={auction.image || auction.images?.[0]}
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
            <strong>{displayPrice}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AuctionCountdown endTime={auction.endTime} isUpcoming={auction.isUpcoming} />
            <button
              type="button"
              className={`auction-card__heart-btn ${isHearted ? 'active' : ''}`}
              onClick={handleHeartClick}
              title={isHearted ? "Bỏ theo dõi" : "Thêm vào đang theo dõi"}
            >
              {isHearted ? <FaHeart style={{ color: '#ef4444' }} /> : <FaRegHeart />}
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
