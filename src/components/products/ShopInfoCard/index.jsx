import { useNavigate } from 'react-router-dom';
import { useChat } from '../../../context/ChatContext';
import './index.scss';

/** Thông tin shop + thống kê 2x3 */
export default function ShopInfoCard({ shop }) {
  const navigate = useNavigate();
  const { openChat } = useChat();

  if (!shop) return null;

  const handleViewShop = () => {
    if (shop.id) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      navigate(`/shop/${encodeURIComponent(shop.id)}`, {
        state: { shopPreview: shop },
      });
    }
  };

  const handleChat = () => {
    if (shop?.id) openChat(shop.id, shop);
  };

  return (
    <section className="shop-info-card">
      <div className="shop-info-card__main">
        <button
          type="button"
          className="shop-info-card__avatar-btn"
          onClick={handleViewShop}
          aria-label={`Xem shop ${shop.name}`}
          disabled={!shop.id}
        >
          <img src={shop.avatar} alt="" className="shop-info-card__avatar" />
        </button>
        <div className="shop-info-card__meta">
          <div className="shop-info-card__name-row">
            <h3 className="shop-info-card__name">{shop.name}</h3>
            {shop.badge && <span className="shop-info-card__badge">{shop.badge}</span>}
          </div>
          <p className="shop-info-card__status">
            {shop.isOnline ? 'Online' : 'Offline'} · {shop.lastOnline}
          </p>
          <div className="shop-info-card__actions">
            <button
              type="button"
              className="shop-info-card__btn shop-info-card__btn--outline"
              onClick={handleChat}
            >
              Chat Ngay
            </button>
            <button
              type="button"
              className="shop-info-card__btn shop-info-card__btn--solid"
              onClick={handleViewShop}
            >
              Xem Shop
            </button>
          </div>
        </div>
      </div>

      <div className="shop-info-card__stats">
        {(Array.isArray(shop.stats) ? shop.stats : []).map((stat) => (
          <div key={stat.label} className="shop-info-card__stat">
            <span className="shop-info-card__stat-label">{stat.label}</span>
            <span className="shop-info-card__stat-value">{stat.value}</span>
          </div>
        ))}
      </div>

    </section>
  );
}
