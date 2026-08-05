import { useEffect, useMemo, useState } from "react";
import StaffPageHeader from "../../../components/staff/staffPageHeader";
import StaffKpiCard from "../../../components/staff/staffKpiCard";
import ImageLightbox from "../../../components/common/imageLightbox";
import { getAdminSellers, getAdminSellerDetail, mapSellerToCard } from "../../../services/adminSellerService";
import "./index.scss";

const STATUS_CLASS = {
  APPROVED: "ok",
  PENDING: "pending",
  SUSPENDED: "suspended",
  REJECTED: "rejected",
  Active: "ok",
  Pending: "pending",
  Suspended: "suspended",
  Rejected: "rejected",
};

const sellerStatusLabel = {
  APPROVED: "Đang hoạt động",
  PENDING: "Chờ duyệt",
  SUSPENDED: "Tạm khoá",
  REJECTED: "Đã từ chối",
  Active: "Đang hoạt động",
  Pending: "Chờ duyệt",
  Suspended: "Tạm khoá",
  Rejected: "Đã từ chối",
};

const productStatusLabel = {
  APPROVED: "Đang bán",
  PENDING: "Chờ duyệt",
  REJECTED: "Bị từ chối",
  DRAFT: "Nháp",
};

const FILTERS = [
  { id: "all", label: "Tất cả" },
  { id: "APPROVED", label: "Đang hoạt động" },
  { id: "PENDING", label: "Chờ duyệt" },
  { id: "SUSPENDED", label: "Tạm khoá" },
];

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return "—";
  return Number(amount).toLocaleString("vi-VN") + "đ";
};

const StaffSellers = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    const loadSellers = async () => {
      setLoading(true);
      try {
        // Sử dụng API thật từ adminSellerService
        const data = await getAdminSellers({ page: 1, pageSize: 100 });
        const mappedSellers = (data?.items || []).map((seller) => {
          const rawStatus = seller.apiStatus || seller._raw?.status || seller.status;
          const isApproved = rawStatus === "APPROVED" || rawStatus === "Approved" || seller.status === "Đã duyệt";
          return {
            ...seller,
            shopName: seller.businessName || seller.name || seller._raw?.businessName || "—",
            ownerName: seller.owner || seller.bankAccountHolder || seller._raw?.bankAccountHolder || "—",
            category: seller.sellerTypeLabel || seller.sellerType || "—",
            businessType: seller.sellerTypeLabel || seller.sellerType || "—",
            cccdNumber: seller.identityNumber || seller._raw?.identityNumber || "—",
            cccdVerified: isApproved,
            rating: seller.rating || 0,
            reviewCount: seller.reviewCount || 0,
            totalOrders: seller.totalOrders || 0,
            revenue: seller.revenue || 0,
            products: seller.products || [],
            status: rawStatus || "PENDING",
          };
        });
        setSellers(mappedSellers);
      } catch (err) {
        console.error("Error loading sellers:", err);
        setSellers([]);
      } finally {
        setLoading(false);
      }
    };
    loadSellers();
  }, []);

  const stats = useMemo(
    () => ({
      total: sellers.length,
      active: sellers.filter((s) => s.status === "APPROVED" || s.status === "Approved").length,
      suspended: sellers.filter((s) => s.status === "SUSPENDED" || s.status === "Suspended").length,
      revenue: sellers.reduce((sum, s) => sum + (s.revenue || 0), 0),
    }),
    [sellers]
  );

  const normalizeStatus = (s) => {
    if (!s) return "PENDING";
    const upper = String(s).toUpperCase();
    if (["APPROVED", "ACTIVE"].includes(upper)) return "APPROVED";
    if (["REJECTED", "DECLINED"].includes(upper)) return "REJECTED";
    if (["SUSPENDED", "BANNED"].includes(upper)) return "SUSPENDED";
    return "PENDING";
  };

  const shown = useMemo(() => {
    let list = sellers;
    if (filter !== "all") list = list.filter((s) => normalizeStatus(s.status) === filter);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((s) =>
        [s.shopName, s.ownerName, s.email, s.phone].some((v) => String(v || "").toLowerCase().includes(q))
      );
    }
    return list;
  }, [sellers, filter, query]);

  const openCccd = (seller) => {
    const images = [];
    if (seller.identityFrontImageUrl || seller.frontImageUrl) {
      images.push({ src: seller.identityFrontImageUrl || seller.frontImageUrl, caption: "CCCD mặt trước" });
    }
    if (seller.identityBackImageUrl || seller.backImageUrl) {
      images.push({ src: seller.identityBackImageUrl || seller.backImageUrl, caption: "CCCD mặt sau" });
    }
    if (images.length) setLightbox(images);
  };

  const openDetail = async (seller) => {
    try {
      const fullDetail = await getAdminSellerDetail(seller.id);
      const target = fullDetail || seller;
      setDetail({
        ...seller,
        ...target,
        shopName: target.businessName || target.shopName || target.name || seller.shopName || "—",
        ownerName: target.owner || target.ownerName || target.bankAccountHolder || seller.ownerName || "—",
        products: target.products || seller.products || [],
      });
    } catch {
      setDetail({
        ...seller,
        products: seller.products || [],
      });
    }
  };

  return (
    <div className="stf-sellers">
      <StaffPageHeader
        kicker="Quản lý"
        title="Thông tin người bán"
        subtitle="Xem toàn bộ người bán, hồ sơ chi tiết và các sản phẩm họ đang bán trên nền tảng."
      />

      <div className="stf-sellers__kpis">
        <StaffKpiCard label="Tổng người bán" value={String(stats.total)} hint="Trên nền tảng" />
        <StaffKpiCard label="Đang hoạt động" value={String(stats.active)} hint="Đã duyệt" highlight />
        <StaffKpiCard label="Tạm khoá" value={String(stats.suspended)} hint="Cần theo dõi" warn={stats.suspended > 0} />
        <StaffKpiCard label="Tổng doanh thu" value={formatCurrency(stats.revenue)} hint="Toàn bộ seller" />
      </div>

      <div className="stf-sellers__toolbar">
        <div className="stf-sellers__filters">
          {FILTERS.map((f) => (
            <button key={f.id} type="button" className={filter === f.id ? "active" : ""} onClick={() => setFilter(f.id)}>
              {f.label}
            </button>
          ))}
        </div>
        <input
          type="search"
          placeholder="Tìm shop, chủ shop, email, SĐT..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="stf-sellers__empty">Đang tải...</p>
      ) : shown.length === 0 ? (
        <p className="stf-sellers__empty">Không có người bán nào khớp bộ lọc.</p>
      ) : (
        <div className="stf-sellers__grid">
          {shown.map((seller) => {
            const status = normalizeStatus(seller.status);
            return (
            <article key={seller.id} className="stf-sellers__card" onClick={() => openDetail(seller)}>
              <div className="stf-sellers__card-top">
                <div className="stf-sellers__avatar">{(seller.shopName || seller.businessName || "S").charAt(0)}</div>
                <div className="stf-sellers__card-head">
                  <h3>{seller.shopName || seller.businessName}</h3>
                  <p>{seller.ownerName || seller.owner || "—"}</p>
                </div>
                <span className={`stf-sellers__status stf-sellers__status--${STATUS_CLASS[status]}`}>
                  {sellerStatusLabel[status] || seller.status}
                </span>
              </div>

              <div className="stf-sellers__meta">
                <span>{seller.category}</span>
                <span>{seller.cccdVerified ? "✓ CCCD" : "○ CCCD"}</span>
              </div>

              <div className="stf-sellers__stats">
                <div>
                  <strong>{seller.rating ? seller.rating.toFixed(1) : "—"}</strong>
                  <small>⭐ {seller.reviewCount} đánh giá</small>
                </div>
                <div>
                  <strong>{(seller.products || []).length}</strong>
                  <small>Sản phẩm</small>
                </div>
                <div>
                  <strong>{seller.totalOrders}</strong>
                  <small>Đơn hàng</small>
                </div>
              </div>

              <div className="stf-sellers__revenue">
                Doanh thu: <strong>{formatCurrency(seller.revenue)}</strong>
              </div>

              <button
                type="button"
                className="stf-sellers__view"
                onClick={(e) => {
                  e.stopPropagation();
                  openDetail(seller);
                }}
              >
                Xem chi tiết →
              </button>
            </article>
            );
          })}
        </div>
      )}

      {detail && (
        <div className="stf-sellers__modal-overlay" onClick={() => setDetail(null)} role="presentation">
          <div className="stf-sellers__modal" onClick={(e) => e.stopPropagation()}>
            <header className="stf-sellers__modal-head">
              <div>
                <h2>{detail.shopName || detail.businessName}</h2>
                <p>{detail.ownerName || detail.owner || detail.bankAccountHolder || "—"} · {detail.sellerTypeLabel || detail.sellerType || detail.category || "—"}</p>
              </div>
              <button type="button" onClick={() => setDetail(null)} aria-label="Đóng">✕</button>
            </header>

            <div className="stf-sellers__modal-body">
              <span className={`stf-sellers__status stf-sellers__status--${STATUS_CLASS[normalizeStatus(detail.status)]}`}>
                {sellerStatusLabel[normalizeStatus(detail.status)] || detail.status}
              </span>
              {detail.status === "SUSPENDED" && detail.suspendReason && (
                <p className="stf-sellers__suspend">{detail.suspendReason}</p>
              )}

              <section className="stf-sellers__detail-grid">
                <div>
                  <h4>Hồ sơ &amp; liên hệ</h4>
                  <dl>
                    <div><dt>Email</dt><dd>{detail.email || "—"}</dd></div>
                    <div><dt>Số điện thoại</dt><dd>{detail.phone || detail.phoneNumber || "—"}</dd></div>
                    <div><dt>Loại hình</dt><dd>{detail.sellerTypeLabel || detail.sellerType || "—"}</dd></div>
                    <div><dt>Mã số thuế</dt><dd>{detail.taxCode || "—"}</dd></div>
                    <div><dt>Địa chỉ</dt><dd>{detail.address || "—"}</dd></div>
                    <div><dt>Ngày nộp</dt><dd>{detail.submittedAt || detail.joinedAt || "—"}</dd></div>
                    <div><dt>Ngày duyệt</dt><dd>{detail.reviewedAt || "—"}</dd></div>
                  </dl>
                </div>
                <div>
                  <h4>Định danh &amp; ngân hàng</h4>
                  <dl>
                    <div>
                      <dt>Số CCCD</dt>
                      <dd>
                        {detail.identityNumber || detail.cccdNumber || "—"}{" "}
                        <span className={`stf-sellers__idtag ${detail.cccdVerified ? "ok" : "no"}`}>
                          {detail.cccdVerified ? "đã xác minh" : "chưa xác minh"}
                        </span>
                      </dd>
                    </div>
                    <div><dt>Ngân hàng</dt><dd>{detail.bankName || "—"}</dd></div>
                    <div><dt>Số tài khoản</dt><dd>{detail.bankAccountNumber || detail.accountNumber || "—"}</dd></div>
                    <div><dt>Chủ tài khoản</dt><dd>{detail.bankAccountHolder || detail.accountHolder || "—"}</dd></div>
                  </dl>
                  {(detail.identityFrontImageUrl || detail.frontImageUrl || detail.identityBackImageUrl || detail.backImageUrl) && (
                    <button type="button" className="stf-sellers__view-cccd" onClick={() => openCccd(detail)}>
                      🔍 Xem ảnh CCCD
                    </button>
                  )}
                </div>
              </section>

              <section className="stf-sellers__products">
                <h4>Sản phẩm đang bán ({detail.products.length})</h4>
                {detail.products.length === 0 ? (
                  <p className="stf-sellers__no-products">Người bán này chưa có sản phẩm nào.</p>
                ) : (
                  <div className="stf-sellers__product-grid">
                    {detail.products.map((p) => (
                      <div key={p.id} className="stf-sellers__product">
                        {p.image ? (
                          <img src={p.image} alt={p.name} />
                        ) : (
                          <div className="stf-sellers__product-noimg">Không ảnh</div>
                        )}
                        <div className="stf-sellers__product-info">
                          <strong>{p.name}</strong>
                          <span className="stf-sellers__product-price">{formatCurrency(p.price)}</span>
                          <div className="stf-sellers__product-meta">
                            <span>Kho: {p.stock}</span>
                            <span>Đã bán: {p.sold}</span>
                          </div>
                          <span className={`stf-sellers__product-status ${STATUS_CLASS[p.status] || "pending"}`}>
                            {productStatusLabel[p.status] || p.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      )}

      {lightbox && <ImageLightbox images={lightbox} onClose={() => setLightbox(null)} />}
    </div>
  );
};

export default StaffSellers;
