import AdminStatusBadge from "../adminStatusBadge";
import { formatDateTime } from "../../../utils/apiDisplay";
import "./index.scss";

const initials = (name) =>
  String(name || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export const UserCard = ({ user, type = "customer", onDetail, onAction, actions = [] }) => (
  <article className={`adm-user-card adm-user-card--${type}`}>
    <div className="adm-user-card__avatar">{initials(user.name || user.owner)}</div>
    <div className="adm-user-card__body">
      <div className="adm-user-card__head">
        <div className="adm-user-card__title">
          <h3 title={user.name}>{user.name}</h3>
          {type === "seller" && user.subtitle && (
            <p className="adm-user-card__sub" title={user.subtitle}>{user.subtitle}</p>
          )}
          {type === "customer" && (
            <p className="adm-user-card__sub" title={user.email}>{user.email}</p>
          )}
          {type === "admin" && (
            <p className="adm-user-card__sub">{user.roleLabel ?? "Quản trị viên"}</p>
          )}
        </div>
        <AdminStatusBadge status={user.status} />
      </div>
      <dl className="adm-user-card__meta">
        {type === "customer" ? (
          <>
            <div><dt>SĐT</dt><dd title={user.phone}>{user.phone}</dd></div>
            <div><dt>CCCD</dt><dd title={user.identityNumber}>{user.identityNumber}</dd></div>
            <div><dt>Giới tính</dt><dd>{user.gender}</dd></div>
          </>
        ) : type === "admin" ? (
          <>
            <div><dt>SĐT</dt><dd title={user.phone}>{user.phone}</dd></div>
            <div className="adm-user-card__meta-wide"><dt>Email</dt><dd title={user.email}>{user.email}</dd></div>
            <div><dt>Trạng thái</dt><dd>{user.status}</dd></div>
          </>
        ) : (
          <>
            <div><dt>Loại</dt><dd>{user.sellerTypeLabel ?? user.sellerType ?? "—"}</dd></div>
            <div><dt>Nộp hồ sơ</dt><dd>{formatDateTime(user.submittedAt)}</dd></div>
            <div className="adm-user-card__meta-wide"><dt>Địa chỉ</dt><dd title={user.address}>{user.address ?? "—"}</dd></div>
          </>
        )}
      </dl>
    </div>
    <footer className="adm-user-card__footer">
      {actions.map((a) => (
        <button key={a.label} type="button" className={a.variant || ""} onClick={a.onClick}>{a.label}</button>
      ))}
    </footer>
  </article>
);

export const UserListRow = ({ user, type = "customer", actions = [] }) => (
  <div className={`adm-user-row adm-user-row--${type}`}>
    <div className="adm-user-row__avatar">{initials(user.name || user.owner)}</div>
    <div className="adm-user-row__name">
      <span className="adm-user-row__fullname" title={user.name}>{user.name}</span>
      <span className="adm-user-row__sub">
        {type === "admin" ? (user.roleLabel ?? "Quản trị viên") : (user.email ?? "—")}
      </span>
    </div>
    {type === "customer" ? (
      <>
        <div className="adm-user-row__cell"><span className="adm-user-row__label">SĐT</span><span>{user.phone}</span></div>
        <div className="adm-user-row__cell"><span className="adm-user-row__label">CCCD</span><span>{user.identityNumber}</span></div>
        <div className="adm-user-row__cell"><span className="adm-user-row__label">Giới tính</span><span>{user.gender}</span></div>
      </>
    ) : type === "admin" ? (
      <>
        <div className="adm-user-row__cell"><span className="adm-user-row__label">Email</span><span>{user.email}</span></div>
        <div className="adm-user-row__cell"><span className="adm-user-row__label">SĐT</span><span>{user.phone}</span></div>
        <div className="adm-user-row__cell adm-user-row__cell--hide-sm"><span className="adm-user-row__label">Vai trò</span><span>{user.roleLabel}</span></div>
      </>
    ) : (
      <>
        <div className="adm-user-row__cell"><span className="adm-user-row__label">Loại</span><span>{user.sellerTypeLabel ?? "—"}</span></div>
        <div className="adm-user-row__cell"><span className="adm-user-row__label">Địa chỉ</span><span>{user.address ?? "—"}</span></div>
      </>
    )}
    <AdminStatusBadge status={user.status} />
    <div className="adm-user-row__actions">
      {actions.map((a) => (
        <button key={a.label} type="button" className={a.variant || ""} onClick={a.onClick} disabled={a.disabled}>{a.label}</button>
      ))}
    </div>
  </div>
);

export const ProductCard = ({ product, actions = [] }) => (
  <article className="adm-product-card">
    <div className="adm-product-card__img">
      <div className="adm-product-card__thumb" aria-hidden="true">
        {product.images ? `📦` : "📦"}
      </div>
    </div>
    <div className="adm-product-card__body">
      <div className="adm-product-card__head">
        <small>{product.id} · {product.category}</small>
        <AdminStatusBadge status={product.status} />
      </div>
      <h3>{product.name}</h3>
      <p className="adm-product-card__seller">{product.seller}</p>
      {product.brand && <span className="adm-product-card__brand">{product.brand}</span>}
      <div className="adm-product-card__price">
        <strong>{product.price}</strong>
        <span>SL: {product.quantity}</span>
      </div>
    </div>
    <footer>{actions.map((a) => (
      <button key={a.label} type="button" className={a.variant || ""} onClick={a.onClick}>{a.label}</button>
    ))}</footer>
  </article>
);

export const SellerProductGroup = ({ seller, warehouse, stats, viewMode = "grid", children }) => (
  <section className="adm-seller-group">
    <header className="adm-seller-group__head">
      <div className="adm-seller-group__info">
        <div className="adm-seller-group__avatar">{initials(seller)}</div>
        <div>
          <h3>{seller}</h3>
          {warehouse && (
            <p>
              QL kho: <strong>{warehouse.warehouseManager}</strong>
              {warehouse.address && <> · {warehouse.address}</>}
            </p>
          )}
        </div>
      </div>
      <div className="adm-seller-group__stats">
        <div className="adm-seller-group__stat">
          <span>Đang trưng bày</span>
          <strong>{stats.displayed}</strong>
        </div>
        <div className="adm-seller-group__stat">
          <span>Trong kho</span>
          <strong>{stats.inStock}</strong>
        </div>
        <div className="adm-seller-group__stat">
          <span>SKU</span>
          <strong>{stats.skus}</strong>
        </div>
      </div>
    </header>
    <div className={viewMode === "list" ? "adm-list-container" : "adm-product-grid adm-seller-group__grid"}>
      {children}
    </div>
  </section>
);

export const SellerInventorySection = ({ seller, warehouse, stats, viewMode = "grid", children }) => (
  <section className="adm-seller-group adm-seller-group--inventory">
    <header className="adm-seller-group__head">
      <div className="adm-seller-group__info">
        <div className="adm-seller-group__avatar">{initials(seller)}</div>
        <div>
          <h3>{seller}</h3>
          {warehouse && (
            <p>
              QL kho: <strong>{warehouse.warehouseManager}</strong>
              {warehouse.phone && <> · {warehouse.phone}</>}
            </p>
          )}
        </div>
      </div>
      <div className="adm-seller-group__stats">
        <div className="adm-seller-group__stat">
          <span>Đang trưng bày</span>
          <strong>{stats.displayed}</strong>
        </div>
        <div className="adm-seller-group__stat">
          <span>Tồn kho</span>
          <strong>{stats.inStock}</strong>
        </div>
        {stats.alerts > 0 && (
          <div className="adm-seller-group__stat adm-seller-group__stat--warn">
            <span>Cảnh báo</span>
            <strong>{stats.alerts}</strong>
          </div>
        )}
      </div>
    </header>
    <div className={viewMode === "list" ? "adm-list-container" : "adm-inventory-grid adm-seller-group__grid"}>
      {children}
    </div>
  </section>
);


export const AuctionCard = ({ auction, onAction, actions = [] }) => {
  const isLive = auction.status === "Đang diễn ra" || auction.status === "Sắp kết thúc";
  return (
    <article className={`adm-auction-card ${isLive ? "live" : ""}`}>
      {isLive && <span className="adm-auction-card__pulse">LIVE</span>}
      <header>
        <small>{auction.id}</small>
        <h3>{auction.title}</h3>
        <p>{auction.seller}</p>
      </header>
      <div className="adm-auction-card__prices">
        <div><span>Khởi điểm</span><strong>{auction.startPrice}</strong></div>
        <div className="current"><span>Hiện tại</span><strong>{auction.currentPrice}</strong></div>
      </div>
      {isLive && (
        <div className="adm-auction-card__bar">
          <div className="adm-auction-card__bar-fill" style={{ width: `${Math.min(auction.bids * 2, 100)}%` }} />
        </div>
      )}
      <div className="adm-auction-card__meta">
       
        <span>Kết thúc: {auction.endTime}</span>
      </div>
      <AdminStatusBadge status={auction.status} />
      <footer>{actions.map((a) => (
        <button key={a.label} type="button" className={a.variant || ""} onClick={a.onClick}>{a.label}</button>
      ))}</footer>
    </article>
  );
};

export const OrderTimelineItem = ({ order, actions = [] }) => (
  <article className="adm-order-timeline__item">
    <div className="adm-order-timeline__dot" />
    <div className="adm-order-timeline__card">
      <header>
        <strong>{order.id}</strong>
        <AdminStatusBadge status={order.status} />
      </header>
      <p>{order.buyer} → {order.seller}</p>
      <div className="adm-order-timeline__details">
        <span>{order.payment}</span>
        <span>{order.shipping}</span>
        <strong>{order.total}</strong>
      </div>
      <small>{order.createdAt}</small>
      <footer>{actions.map((a) => (
        <button key={a.label} type="button" className={a.variant || ""} onClick={a.onClick}>{a.label}</button>
      ))}</footer>
    </div>
  </article>
);

export const BidFeedItem = ({ bid, actions = [] }) => (
  <article className={`adm-bid-feed__item ${bid.suspicious ? "warn" : ""}`}>
    <div className="adm-bid-feed__amount">{bid.amount}</div>
    <div className="adm-bid-feed__body">
      <strong>{bid.bidder}</strong>
      <span>phiên {bid.auction}</span>
      <div className="adm-bid-feed__meta">
        <span>{bid.bidTime}</span>
        <span>{bid.ip}</span>
        <span>{bid.device}</span>
      </div>
      {bid.suspicious && <AdminStatusBadge status="Nghi ngờ" />}
    </div>
    <div className="adm-bid-feed__actions">
      {actions.map((a) => (
        <button key={a.label} type="button" className={a.variant || ""} onClick={a.onClick}>{a.label}</button>
      ))}
    </div>
  </article>
);

export const WalletCard = ({ wallet, actions = [] }) => (
  <article className="adm-wallet-card">
    <header>
      <div>
        <h3>{wallet.owner}</h3>
        <span>{wallet.type}</span>
      </div>
    </header>
    <div className="adm-wallet-card__balance">{wallet.balance}</div>
    <dl>
      <div><dt>Đóng băng</dt><dd>{wallet.frozen}</dd></div>
      <div><dt>Tổng nạp</dt><dd>{wallet.totalDeposit}</dd></div>
      <div><dt>Tổng rút</dt><dd>{wallet.totalWithdraw}</dd></div>
    </dl>
    <footer>{actions.map((a) => (
      <button key={a.label} type="button" className={a.variant || ""} onClick={a.onClick}>{a.label}</button>
    ))}</footer>
  </article>
);

export const FeeCard = ({ fee, onEdit }) => (
  <article className="adm-fee-card" onClick={onEdit} onKeyDown={(e) => e.key === "Enter" && onEdit()} role="button" tabIndex={0}>
    <span className="adm-fee-card__type">{fee.type}</span>
    <h3>{fee.name}</h3>
    <div className="adm-fee-card__value">{fee.value}</div>
    <p>{fee.description}</p>
    <button type="button">Chỉnh sửa</button>
  </article>
);

export const CouponTicket = ({ coupon, onEdit, onDelete }) => (
  <article className={`adm-coupon-ticket ${coupon.status === "Hết hạn" ? "expired" : ""}`}>
    <div className="adm-coupon-ticket__left">
      <strong>{coupon.value}</strong>
      <span>{coupon.type}</span>
    </div>
    <div className="adm-coupon-ticket__right">
      <code>{coupon.code}</code>
      <p>Đơn tối thiểu: {coupon.minOrder}</p>
      <div className="adm-coupon-ticket__usage">
        <div className="adm-coupon-ticket__bar"><div style={{ width: `${(coupon.used / coupon.usageLimit) * 100}%` }} /></div>
        <small>{coupon.used}/{coupon.usageLimit} lượt</small>
      </div>
      <AdminStatusBadge status={coupon.status} />
      <div className="adm-coupon-ticket__actions">
        <button type="button" onClick={onEdit}>Sửa</button>
        <button type="button" className="danger" onClick={onDelete}>Xóa</button>
      </div>
    </div>
  </article>
);

export const ReviewCard = ({ review, onHide, onDelete }) => (
  <article className="adm-review-card">
    <div className="adm-review-card__stars">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</div>
    <p className="adm-review-card__comment">"{review.comment}"</p>
    <div className="adm-review-card__meta">
      <strong>{review.buyer}</strong>
      <span>{review.product}</span>
      <span>{review.seller}</span>
    </div>
    <AdminStatusBadge status={review.status} />
    <footer>
      <button type="button" onClick={onHide}>{review.status === "Ẩn" ? "Hiện" : "Ẩn"}</button>
      <button type="button" className="danger" onClick={onDelete}>Xóa</button>
    </footer>
  </article>
);

export const FraudAlert = ({ alert, actions = [] }) => (
  <article className={`adm-fraud-alert severity-${alert.severity === "Cao" ? "high" : "med"}`}>
    <div className="adm-fraud-alert__icon">⚠</div>
    <div className="adm-fraud-alert__body">
      <header>
        <strong>{alert.type}</strong>
        <AdminStatusBadge status={alert.severity} />
      </header>
      <p>{alert.detail}</p>
      <div className="adm-fraud-alert__meta">
        <span>{alert.auction}</span>
        <span>{alert.user}</span>
        <span>{alert.detectedAt}</span>
      </div>
    </div>
    <footer>{actions.map((a) => (
      <button key={a.label} type="button" className={a.variant || ""} onClick={a.onClick}>{a.label}</button>
    ))}</footer>
  </article>
);

export const KanbanColumn = ({ title, count, children, color }) => (
  <div className={`adm-kanban__col adm-kanban__col--${color || "default"}`}>
    <header><h3>{title}</h3><span>{count}</span></header>
    <div className="adm-kanban__cards">{children}</div>
  </div>
);

export const KanbanCard = ({ title, subtitle, meta, badge, actions = [] }) => (
  <article className="adm-kanban__card">
    {badge && <AdminStatusBadge status={badge} />}
    <h4>{title}</h4>
    {subtitle && <p>{subtitle}</p>}
    {meta && <small>{meta}</small>}
    {actions.length > 0 && (
      <footer>{actions.map((a) => (
        <button key={a.label} type="button" className={a.variant || ""} onClick={a.onClick}>{a.label}</button>
      ))}</footer>
    )}
  </article>
);

export const AuditTimelineItem = ({ log }) => (
  <article className="adm-audit-item">
    <div className="adm-audit-item__line" />
    <div className="adm-audit-item__dot" />
    <div className="adm-audit-item__card">
      <header>
        <strong>{log.actor}</strong>
        <span>{log.time}</span>
      </header>
      <p>{log.action} → <em>{log.target}</em></p>
      <div className="adm-audit-item__diff">
        <span className="old">{log.oldValue}</span>
        <span className="arrow">→</span>
        <span className="new">{log.newValue}</span>
      </div>
      <small>IP: {log.ip}</small>
    </div>
  </article>
);

export const InventoryGauge = ({ item, onSync }) => {
  const pct = item.stock === 0 ? 0 : Math.min((item.stock / (item.threshold * 3)) * 100, 100);
  const statusClass = item.status === "Hết hàng" ? "empty" : item.status === "Sắp hết" ? "low" : "ok";
  return (
    <article className={`adm-inventory-gauge ${statusClass}`}>
      <header>
        <h3>{item.product}</h3>
        <AdminStatusBadge status={item.status} />
      </header>
      <p>{item.seller} · {item.sku}</p>
      <div className="adm-inventory-gauge__ring">
        <svg viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" className="bg" />
          <circle cx="50" cy="50" r="42" className="fill" style={{ strokeDashoffset: 264 - (264 * pct) / 100 }} />
        </svg>
        <strong>{item.stock}</strong>
      </div>
      <dl>
        <div><dt>Đã giữ</dt><dd>{item.reserved}</dd></div>
        <div><dt>Ngưỡng</dt><dd>{item.threshold}</dd></div>
      </dl>
      <button type="button" onClick={onSync}>Đồng bộ tồn kho</button>
    </article>
  );
};

export const CategoryTreeItem = ({ cat, onEdit, onToggle, onDelete }) => (
  <article className={`adm-category-item ${cat.parent !== "—" ? "child" : ""}`}>
    <div className="adm-category-item__order">#{cat.sortOrder}</div>
    <div className="adm-category-item__body">
      <h3>{cat.name}</h3>
      <p>{cat.parent !== "—" ? `Thuộc: ${cat.parent}` : "Danh mục gốc"} · {cat.productCount} SP</p>
    </div>
    <AdminStatusBadge status={cat.status} />
    <div className="adm-category-item__actions">
      <button type="button" onClick={onEdit}>Sửa</button>
      <button type="button" onClick={onToggle}>{cat.status === "Hoạt động" ? "Tắt" : "Bật"}</button>
      <button type="button" className="danger" onClick={onDelete}>Xóa</button>
    </div>
  </article>
);

export const BrandChip = ({ brand, onEdit, onToggle, onDelete }) => (
  <article className="adm-brand-chip">
    <div className="adm-brand-chip__logo">{brand.name[0]}</div>
    <h3>{brand.name}</h3>
    <span>{brand.productCount} sản phẩm</span>
    <AdminStatusBadge status={brand.status} />
    <div className="adm-brand-chip__actions">
      <button type="button" onClick={onEdit}>Sửa</button>
      <button type="button" onClick={onToggle}>{brand.status === "Hoạt động" ? "Tắt" : "Bật"}</button>
      <button type="button" className="danger" onClick={onDelete}>Xóa</button>
    </div>
  </article>
);

export const NotificationItem = ({ item }) => (
  <article className={`adm-notif-item ${item.status === "Nháp" ? "draft" : ""}`}>
    <div className={`adm-notif-item__icon type-${item.type?.replace(/\s/g, "")}`}>
      {item.type === "Khuyến mãi" ? "🎁" : item.type === "Nhắc đấu giá" ? "🔨" : "📢"}
    </div>
    <div className="adm-notif-item__body">
      <strong>{item.title}</strong>
      <p>{item.audience}</p>
      <small>{item.sentAt || "Chưa gửi"}</small>
    </div>
    <AdminStatusBadge status={item.status} />
  </article>
);

export const BannerPreview = ({ banner, onEdit, onDelete }) => {
  const typeClass = `type-${banner.type?.replace(/\s/g, "") || "default"}`;
  return (
    <article className={`adm-banner-preview ${typeClass}`}>
      <div className="adm-banner-preview__visual">
        <span>{banner.type}</span>
      </div>
    <div className="adm-banner-preview__body">
      <h3>{banner.title}</h3>
      <p>{banner.position}</p>
      <small>{banner.startDate} — {banner.endDate}</small>
      <AdminStatusBadge status={banner.status} />
      <footer>
        <button type="button" onClick={onEdit}>Sửa</button>
        <button type="button" className="danger" onClick={onDelete}>Xóa</button>
      </footer>
    </div>
  </article>
  );
};

export const ContentDoc = ({ doc, onEdit, onDelete }) => (
  <article className="adm-content-doc">
    <div className={`adm-content-doc__type type-${doc.type}`}>{doc.type}</div>
    <div className="adm-content-doc__body">
      <h3>{doc.title}</h3>
      <small>Cập nhật: {doc.updatedAt}</small>
      <AdminStatusBadge status={doc.status} />
    </div>
    <div className="adm-content-doc__actions">
      <button type="button" onClick={onEdit}>Sửa</button>
      <button type="button" className="danger" onClick={onDelete}>Xóa</button>
    </div>
  </article>
);

export const PaymentCard = ({ payment, actions = [] }) => (
  <article className="adm-payment-card">
    <header>
      <code>{payment.transaction}</code>
      <AdminStatusBadge status={payment.status} />
    </header>
    <div className="adm-payment-card__amount">{payment.amount}</div>
    <p>{payment.buyer} → {payment.seller}</p>
    <div className="adm-payment-card__meta">
      <span>{payment.method}</span>
      <span>Phí: {payment.fee}</span>
      <span>{payment.createdAt}</span>
    </div>
    <footer>{actions.map((a) => (
      <button key={a.label} type="button" className={a.variant || ""} onClick={a.onClick}>{a.label}</button>
    ))}</footer>
  </article>
);

export const WithdrawalCard = ({ item, actions = [] }) => (
  <article className="adm-withdrawal-card">
    <div className="adm-withdrawal-card__amount">{item.amount}</div>
    <h3>{item.seller}</h3>
    <p>{item.bank}</p>
    <small>{item.requestedAt}</small>
    <AdminStatusBadge status={item.status} />
    <footer>{actions.map((a) => (
      <button key={a.label} type="button" className={a.variant || ""} onClick={a.onClick}>{a.label}</button>
    ))}</footer>
  </article>
);

export const AuctionOrderCard = ({ order, actions = [] }) => (
  <article className="adm-auction-order-card">
    <header>
      <strong>{order.id}</strong>
      <span>Phiên {order.auction}</span>
    </header>
    <div className="adm-auction-order-card__winner">
      <span>Người thắng</span>
      <strong>{order.winner}</strong>
    </div>
    <div className="adm-auction-order-card__price">{order.finalPrice}</div>
    <div className="adm-auction-order-card__pipeline">
      <div className={order.paymentStatus === "Đã thanh toán" ? "done" : ""}>Thanh toán</div>
      <div className={order.deliveryStatus === "Đã giao" ? "done" : order.deliveryStatus === "Đang giao" ? "active" : ""}>Giao hàng</div>
    </div>
    <footer>{actions.map((a) => (
      <button key={a.label} type="button" className={a.variant || ""} onClick={a.onClick}>{a.label}</button>
    ))}</footer>
  </article>
);

export const ShippingPartnerCard = ({ partner, onToggle }) => (
  <article className="adm-shipping-card">
    <div className="adm-shipping-card__icon">🚚</div>
    <h3>{partner.name}</h3>
    <div className="adm-shipping-card__fee">{partner.fee}</div>
    <p>{partner.zones}</p>
    <AdminStatusBadge status={partner.status} />
    <button type="button" onClick={onToggle}>{partner.status === "Hoạt động" ? "Tắt" : "Bật"}</button>
  </article>
);

export const ShippingZoneItem = ({ zone }) => (
  <article className="adm-zone-item">
    <h4>{zone.name}</h4>
    <div><strong>{zone.fee}</strong><span>{zone.estimatedDays}</span></div>
  </article>
);

// ==========================================
// UNIFIED DEDICATED LIST ROW COMPONENTS
// ==========================================

export const ProductListRow = ({ product, actions = [] }) => (
  <div className="adm-list-row adm-product-row">
    <div className="adm-list-row__thumb">📦</div>
    <div className="adm-list-row__col adm-list-row__col--main">
      <strong className="adm-list-row__title" title={product.name}>{product.name}</strong>
      <small className="adm-list-row__sub">{product.id} · {product.category} {product.brand ? `· ${product.brand}` : ""}</small>
    </div>
    <div className="adm-list-row__col">
      <span className="adm-list-row__label">Seller</span>
      <span className="adm-list-row__val">{product.seller}</span>
    </div>
    <div className="adm-list-row__col">
      <span className="adm-list-row__label">Giá & Tồn kho</span>
      <span className="adm-list-row__val"><strong className="highlight">{product.price}</strong> · SL: {product.quantity}</span>
    </div>
    <AdminStatusBadge status={product.status} />
    <div className="adm-list-row__actions">
      {actions.map((a) => (
        <button key={a.label} type="button" className={a.variant || ""} onClick={a.onClick}>{a.label}</button>
      ))}
    </div>
  </div>
);

export const AuctionListRow = ({ auction, actions = [] }) => {
  const isLive = auction.status === "Đang diễn ra" || auction.status === "Sắp kết thúc";
  return (
    <div className={`adm-list-row adm-auction-row ${isLive ? "is-live" : ""}`}>
      <div className="adm-list-row__col adm-list-row__col--main">
        <strong className="adm-list-row__title" title={auction.title}>{auction.title}</strong>
        <small className="adm-list-row__sub">{auction.id} · Seller: {auction.seller}</small>
      </div>
      <div className="adm-list-row__col">
        <span className="adm-list-row__label">Khởi điểm</span>
        <span className="adm-list-row__val">{auction.startPrice}</span>
      </div>
      <div className="adm-list-row__col">
        <span className="adm-list-row__label">Hiện tại</span>
        <span className="adm-list-row__val highlight">{auction.currentPrice}</span>
      </div>
      <div className="adm-list-row__col">
        <span className="adm-list-row__label">Kết thúc</span>
        <span className="adm-list-row__val">{auction.endTime}</span>
      </div>
      <AdminStatusBadge status={auction.status} />
      <div className="adm-list-row__actions">
        {actions.map((a) => (
          <button key={a.label} type="button" className={a.variant || ""} onClick={a.onClick}>{a.label}</button>
        ))}
      </div>
    </div>
  );
};

export const OrderListRow = ({ order, actions = [] }) => (
  <div className="adm-list-row adm-order-row">
    <div className="adm-list-row__col adm-list-row__col--main">
      <strong className="adm-list-row__title">{order.id}</strong>
      <small className="adm-list-row__sub">{order.buyer} → {order.seller}</small>
    </div>
    <div className="adm-list-row__col">
      <span className="adm-list-row__label">Thanh toán & Giao hàng</span>
      <span className="adm-list-row__val">{order.payment || "—"} · {order.shipping || "—"}</span>
    </div>
    <div className="adm-list-row__col">
      <span className="adm-list-row__label">Tổng tiền</span>
      <span className="adm-list-row__val highlight">{order.total || order.finalPrice}</span>
    </div>
    <div className="adm-list-row__col">
      <span className="adm-list-row__label">Ngày tạo</span>
      <span className="adm-list-row__val">{order.createdAt || "Hôm nay"}</span>
    </div>
    <AdminStatusBadge status={order.status} />
    <div className="adm-list-row__actions">
      {actions.map((a) => (
        <button key={a.label} type="button" className={a.variant || ""} onClick={a.onClick}>{a.label}</button>
      ))}
    </div>
  </div>
);

export const PaymentListRow = ({ payment, actions = [] }) => (
  <div className="adm-list-row adm-payment-row">
    <div className="adm-list-row__col adm-list-row__col--main">
      <strong className="adm-list-row__title">{payment.transaction || payment.id}</strong>
      <small className="adm-list-row__sub">{payment.method} · {payment.createdAt || payment.time}</small>
    </div>
    <div className="adm-list-row__col">
      <span className="adm-list-row__label">Người gửi → Người nhận</span>
      <span className="adm-list-row__val">{payment.buyer} → {payment.seller}</span>
    </div>
    <div className="adm-list-row__col">
      <span className="adm-list-row__label">Số tiền</span>
      <span className="adm-list-row__val highlight">{payment.amount}</span>
    </div>
    <AdminStatusBadge status={payment.status} />
    <div className="adm-list-row__actions">
      {actions.map((a) => (
        <button key={a.label} type="button" className={a.variant || ""} onClick={a.onClick}>{a.label}</button>
      ))}
    </div>
  </div>
);

export const WalletListRow = ({ wallet, actions = [] }) => (
  <div className="adm-list-row adm-wallet-row">
    <div className="adm-list-row__col adm-list-row__col--main">
      <strong className="adm-list-row__title">{wallet.owner}</strong>
      <small className="adm-list-row__sub">{wallet.type} · ID: {wallet.id}</small>
    </div>
    <div className="adm-list-row__col">
      <span className="adm-list-row__label">Số dư</span>
      <span className="adm-list-row__val highlight">{wallet.balance}</span>
    </div>
    <div className="adm-list-row__col">
      <span className="adm-list-row__label">Đóng băng</span>
      <span className="adm-list-row__val">{wallet.frozen}</span>
    </div>
    <div className="adm-list-row__col">
      <span className="adm-list-row__label">Tổng nạp / Rút</span>
      <span className="adm-list-row__val">{wallet.totalDeposit} / {wallet.totalWithdraw}</span>
    </div>
    <div className="adm-list-row__actions">
      {actions.map((a) => (
        <button key={a.label} type="button" className={a.variant || ""} onClick={a.onClick}>{a.label}</button>
      ))}
    </div>
  </div>
);

export const WithdrawalListRow = ({ item, actions = [] }) => (
  <div className="adm-list-row adm-withdrawal-row">
    <div className="adm-list-row__col adm-list-row__col--main">
      <strong className="adm-list-row__title">{item.seller}</strong>
      <small className="adm-list-row__sub">{item.id} · {item.bank}</small>
    </div>
    <div className="adm-list-row__col">
      <span className="adm-list-row__label">Số tiền yêu cầu</span>
      <span className="adm-list-row__val highlight">{item.amount}</span>
    </div>
    <div className="adm-list-row__col">
      <span className="adm-list-row__label">Ngày tạo</span>
      <span className="adm-list-row__val">{item.requestedAt || item.createdAt}</span>
    </div>
    <AdminStatusBadge status={item.status} />
    <div className="adm-list-row__actions">
      {actions.map((a) => (
        <button key={a.label} type="button" className={a.variant || ""} onClick={a.onClick}>{a.label}</button>
      ))}
    </div>
  </div>
);

export const CouponListRow = ({ coupon, onEdit, onDelete }) => (
  <div className="adm-list-row adm-coupon-row">
    <div className="adm-list-row__col adm-list-row__col--main">
      <strong className="adm-list-row__title"><code>{coupon.code}</code></strong>
      <small className="adm-list-row__sub">Giảm {coupon.value} ({coupon.type})</small>
    </div>
    <div className="adm-list-row__col">
      <span className="adm-list-row__label">Đơn tối thiểu</span>
      <span className="adm-list-row__val">{coupon.minOrder}</span>
    </div>
    <div className="adm-list-row__col">
      <span className="adm-list-row__label">Đã dùng</span>
      <span className="adm-list-row__val">{coupon.used}/{coupon.usageLimit} lượt</span>
    </div>
    <AdminStatusBadge status={coupon.status} />
    <div className="adm-list-row__actions">
      <button type="button" onClick={onEdit}>Sửa</button>
      <button type="button" className="danger" onClick={onDelete}>Xóa</button>
    </div>
  </div>
);

export const ShippingPartnerListRow = ({ partner, onToggle }) => (
  <div className="adm-list-row adm-shipping-row">
    <div className="adm-list-row__thumb">{partner.icon || "🚚"}</div>
    <div className="adm-list-row__col adm-list-row__col--main">
      <strong className="adm-list-row__title">{partner.name}</strong>
      <small className="adm-list-row__sub">{partner.code || "Nội thành & Toàn quốc"}</small>
    </div>
    <div className="adm-list-row__col">
      <span className="adm-list-row__label">Cước phí</span>
      <span className="adm-list-row__val highlight">{partner.fee || "22.000đ"}</span>
    </div>
    <AdminStatusBadge status={partner.status} />
    <div className="adm-list-row__actions">
      <button type="button" onClick={onToggle}>{partner.status === "Hoạt động" ? "Tắt" : "Bật"}</button>
    </div>
  </div>
);

export const ReviewListRow = ({ review, onHide, onDelete }) => (
  <div className="adm-list-row adm-review-row">
    <div className="adm-list-row__col adm-list-row__col--main">
      <strong className="adm-list-row__title">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</strong>
      <small className="adm-list-row__sub">"{review.comment}"</small>
    </div>
    <div className="adm-list-row__col">
      <span className="adm-list-row__label">Người đánh giá</span>
      <span className="adm-list-row__val">{review.buyer}</span>
    </div>
    <div className="adm-list-row__col">
      <span className="adm-list-row__label">Sản phẩm / Seller</span>
      <span className="adm-list-row__val">{review.product} ({review.seller})</span>
    </div>
    <AdminStatusBadge status={review.status} />
    <div className="adm-list-row__actions">
      <button type="button" onClick={onHide}>{review.status === "Ẩn" ? "Hiện" : "Ẩn"}</button>
      <button type="button" className="danger" onClick={onDelete}>Xóa</button>
    </div>
  </div>
);

