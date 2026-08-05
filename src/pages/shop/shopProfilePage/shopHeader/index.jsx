import { useState } from 'react';
import {
  FiBox,
  FiUsers,
  FiMessageCircle,
  FiStar,
  FiMapPin,
  FiBriefcase,
  FiInfo,
  FiUserPlus,
} from 'react-icons/fi';
import './index.scss';

function StatRow({ icon: Icon, label, value, tooltip }) {
  return (
    <div className="shop-header__stat">
      <Icon className="shop-header__stat-icon" aria-hidden="true" />
      <span className="shop-header__stat-label">{label}</span>
      <span className="shop-header__stat-value">
        {value}
        {tooltip && (
          <span className="shop-header__info" title={tooltip} aria-label={tooltip}>
            <FiInfo aria-hidden="true" />
          </span>
        )}
      </span>
    </div>
  );
}

export default function ShopHeader({ shop, isFollowing, onToggleFollow, onChat }) {
  const [following, setFollowing] = useState(isFollowing);

  const handleFollow = () => {
    setFollowing((prev) => !prev);
    onToggleFollow?.(!following);
  };

  if (!shop) return null;

  const { stats } = shop;

  return (
    <header className="shop-header">
      <div className="shop-header__main">
        <div className="shop-header__identity">
          <img src={shop.avatar} alt={shop.name} className="shop-header__avatar" />
          <div className="shop-header__meta">
            <div className="shop-header__name-row">
              <h1 className="shop-header__name">{shop.name}</h1>
              {shop.isMall && <span className="shop-header__mall-badge">{shop.badge}</span>}
            </div>
            <p className="shop-header__online">
              {shop.isOnline ? 'Online' : 'Offline'} {shop.lastOnline}
            </p>
            <div className="shop-header__actions">
              <button
                type="button"
                className={`shop-header__btn shop-header__btn--follow ${following ? 'is-following' : ''}`}
                onClick={handleFollow}
              >
                <FiUserPlus aria-hidden="true" />
                {following ? 'Đang Theo' : 'Theo Dõi'}
              </button>
              <button type="button" className="shop-header__btn shop-header__btn--chat" onClick={onChat}>
                <FiMessageCircle aria-hidden="true" />
                Chat
              </button>
            </div>
          </div>
        </div>

        <div className="shop-header__stats">
          <div className="shop-header__stats-col">
            <StatRow icon={FiBox} label="Sản Phẩm" value={stats.products} />
            <StatRow icon={FiUsers} label="Đang Theo" value={stats.following} />
            <StatRow
              icon={FiMessageCircle}
              label="Tỉ Lệ Phản Hồi Chat"
              value={stats.chatResponseRate}
              tooltip="Tỉ lệ phản hồi tin nhắn trong 12 giờ qua"
            />
          </div>
          <div className="shop-header__stats-col">
            <StatRow icon={FiUsers} label="Người Theo Dõi" value={stats.followers} />
            <StatRow
              icon={FiStar}
              label="Đánh Giá"
              value={`${stats.rating} (${stats.reviewCount} đánh giá)`}
            />
            <StatRow icon={FiUsers} label="Tham Gia" value={stats.joined} />
          </div>
          <div className="shop-header__stats-col">
            <StatRow icon={FiMapPin} label="Địa Chỉ" value={stats.address} />
            <StatRow icon={FiBriefcase} label="Công Ty/HKD" value={stats.company} />
          </div>
        </div>
      </div>
    </header>
  );
}
