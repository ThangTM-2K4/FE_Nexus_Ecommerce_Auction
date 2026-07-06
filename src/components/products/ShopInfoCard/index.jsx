import './index.scss';

/** Thông tin shop + thống kê 2x3 */
export default function ShopInfoCard({ shop }) {
  if (!shop) return null;

  return (
    <section className="shop-info-card">
      <div className="shop-info-card__main">
        <img src={shop.avatar} alt="" className="shop-info-card__avatar" />
        <div className="shop-info-card__meta">
          <div className="shop-info-card__name-row">
            <h3 className="shop-info-card__name">{shop.name}</h3>
            {shop.badge && <span className="shop-info-card__badge">{shop.badge}</span>}
          </div>
          <p className="shop-info-card__status">
            {shop.isOnline ? 'Online' : 'Offline'} · {shop.lastOnline}
          </p>
          <div className="shop-info-card__actions">
            <button type="button" className="shop-info-card__btn shop-info-card__btn--outline">
              Chat Ngay
            </button>
            <button type="button" className="shop-info-card__btn shop-info-card__btn--solid">
              Xem Shop
            </button>
          </div>
        </div>
      </div>

      <div className="shop-info-card__stats">
        {shop.stats.map((stat) => (
          <div key={stat.label} className="shop-info-card__stat">
            <span className="shop-info-card__stat-label">{stat.label}</span>
            <span className="shop-info-card__stat-value">{stat.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
