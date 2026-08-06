import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { FaSearch, FaTh, FaList, FaCheck, FaTimes } from "react-icons/fa";
import StaffPageHeader from "../../../components/staff/staffPageHeader";
import RejectReasonModal from "../../../components/staff/rejectReasonModal";
import { productRejectReasons } from "../../../data/staffMockData";
import api from "../../../config/api";
import {
  getAdminProducts,
  getAdminProductReviewQueue,
  approveAdminProduct,
  rejectAdminProduct,
  getApiErrorMessage,
} from "../../../services/adminProductService";
import { getProductModeration, resolveImageUrl } from "../../../services/ecommerceProductService";
import "./index.scss";

const TABS = [
  { id: "ALL", label: "Tất cả" },
  { id: "PENDING", label: "Chờ duyệt" },
  { id: "DRAFT", label: "Đang ẩn / Nháp" },
  { id: "APPROVED", label: "Đã duyệt" },
  { id: "REJECTED", label: "Đã từ chối" },
];

const STATUS_LABELS = {
  DRAFT: "Đang ẩn / Nháp",
  CREATED: "Đang ẩn / Nháp",
  PENDING: "Chờ duyệt",
  PENDING_REVIEW: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  ACTIVE: "Đã duyệt",
  REJECTED: "Đã từ chối",
};

const STATUS_CLASS = {
  DRAFT: "status-draft",
  CREATED: "status-draft",
  PENDING: "status-pending",
  PENDING_REVIEW: "status-pending",
  APPROVED: "status-approved",
  ACTIVE: "status-approved",
  REJECTED: "status-rejected",
};

const StaffProductReview = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [tab, setTab] = useState("ALL");
  const [viewMode, setViewMode] = useState("grid");
  const [search, setSearch] = useState("");

  const extractPrice = (p) => {
    if (!p) return 0;
    if (typeof p.minPrice === "number" && p.minPrice > 0) return p.minPrice;
    if (typeof p.price === "number" && p.price > 0) return p.price;
    const raw =
      p.minPrice ??
      p.priceNum ??
      p.unitPrice ??
      p.sellingPrice ??
      p.basePrice ??
      p.skus?.[0]?.unitPrice ??
      p.skus?.[0]?.price ??
      p.price ??
      0;
    if (typeof raw === "number") return raw;
    const cleaned = String(raw).replace(/[^0-9.]/g, "");
    const num = Number(cleaned);
    return Number.isNaN(num) ? 0 : num;
  };

  const extractStock = (p) => {
    if (!p) return 0;
    return (
      p.stockQuantity ??
      p.stock ??
      p.totalStock ??
      p.quantity ??
      p.availableStock ??
      p.skus?.[0]?.stockQuantity ??
      p.skus?.[0]?.stock ??
      p.skus?.[0]?.quantity ??
      0
    );
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await getAdminProducts();
      setProducts(res?.items || []);
    } catch (err) {
      console.error("Error loading products for staff:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();

    const handleStorageChange = (e) => {
      if (!e.key || e.key === "seller_created_products") {
        loadProducts();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const normalizeStatus = (p) => {
    if (!p) return "DRAFT";
    const mod = String(p.moderationStatus || p.reviewStatus || p.approvalStatus || "").toUpperCase();
    const st = String(p.status || "").toUpperCase();

    if (mod === "APPROVED" || st === "APPROVED" || st === "ACTIVE" || st === "PUBLISHED") {
      return "APPROVED";
    }
    if (mod === "REJECTED" || st === "REJECTED") {
      return "REJECTED";
    }
    if (mod === "PENDING_MANUAL_REVIEW" || mod.includes("PENDING") || st.includes("PENDING") || st.includes("REVIEW") || st.includes("CHỜ")) {
      return "PENDING";
    }
    return "DRAFT";
  };

  const counts = useMemo(() => {
    const c = { ALL: products.length, PENDING: 0, DRAFT: 0, APPROVED: 0, REJECTED: 0 };
    products.forEach((p) => {
      const norm = normalizeStatus(p);
      if (c[norm] !== undefined) c[norm] += 1;
    });
    return c;
  }, [products]);

  const filteredProducts = useMemo(() => {
    let list = products;
    if (tab !== "ALL") {
      list = list.filter((p) => normalizeStatus(p) === tab);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => {
        const name = (p.name || p.productName || p.title || "").toLowerCase();
        const category = (p.category || p.categoryName || "").toLowerCase();
        const seller = (p.seller || p.sellerName || p.userId || p.sellerId || "").toLowerCase();
        const id = String(p.id).toLowerCase();
        return name.includes(q) || category.includes(q) || seller.includes(q) || id.includes(q);
      });
    }
    return list;
  }, [products, tab, search]);

  const handleApprove = async (product) => {
    setProcessingId(product.id);
    try {
      await approveAdminProduct(product.id);
      
      try {
        const localList = JSON.parse(localStorage.getItem("seller_created_products") || "[]");
        const updated = localList.map((p) => {
          const isMatch = p.id === product.id || p.productId === product.id || String(p.id) === String(product.id);
          return isMatch ? { ...p, moderationStatus: "APPROVED", status: "APPROVED" } : p;
        });
        if (!updated.some((p) => p.id === product.id || p.productId === product.id)) {
          updated.push({ ...product, moderationStatus: "APPROVED", status: "APPROVED" });
        }
        localStorage.setItem("seller_created_products", JSON.stringify(updated));
      } catch {
        /* ignore */
      }

      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id || p.productId === product.id
            ? { ...p, moderationStatus: "APPROVED", status: "APPROVED" }
            : p
        )
      );

      toast.success("Đã duyệt sản phẩm thành công! Sản phẩm đã chuyển sang mục Đã duyệt.");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Duyệt sản phẩm thất bại"));
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmReject = async (reason, note) => {
    if (!rejectTarget) return;
    const fullReason = note ? `${reason} — ${note}` : reason;
    setProcessingId(rejectTarget.id);
    try {
      await rejectAdminProduct(rejectTarget.id, fullReason);
      
      try {
        const localList = JSON.parse(localStorage.getItem("seller_created_products") || "[]");
        const updated = localList.map((p) => {
          const isMatch = p.id === rejectTarget.id || p.productId === rejectTarget.id || String(p.id) === String(rejectTarget.id);
          return isMatch ? { ...p, moderationStatus: "REJECTED", status: "REJECTED", rejectReason: fullReason } : p;
        });
        localStorage.setItem("seller_created_products", JSON.stringify(updated));
      } catch {
        /* ignore */
      }

      setProducts((prev) =>
        prev.map((p) =>
          p.id === rejectTarget.id || p.productId === rejectTarget.id
            ? { ...p, moderationStatus: "REJECTED", status: "REJECTED", rejectReason: fullReason }
            : p
        )
      );

      toast.info("Đã từ chối sản phẩm");
      setRejectTarget(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Từ chối sản phẩm thất bại"));
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="stf-product-review">
      <StaffPageHeader
        kicker="Duyệt sản phẩm"
        title="Quản lý & Duyệt sản phẩm đăng bán"
        subtitle="Kiểm tra tất cả sản phẩm người bán tạo trên hệ thống, phê duyệt hoặc từ chối để hiển thị công khai."
      />

      <div className="stf-product-review__toolbar">
        <div className="stf-product-review__tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={tab === t.id ? "active" : ""}
              onClick={() => {
                setTab(t.id);
                loadProducts();
              }}
            >
              {t.label} ({counts[t.id] ?? 0})
            </button>
          ))}
        </div>

        <div className="stf-product-review__controls">
          <div className="stf-product-review__search">
            <FaSearch aria-hidden />
            <input
              type="search"
              placeholder="Tìm tên sản phẩm, danh mục, người bán..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="adm-view-toggle" role="group" aria-label="Chế độ hiển thị">
            <button
              type="button"
              className={`adm-view-toggle__btn ${viewMode === "grid" ? "is-active" : ""}`}
              onClick={() => setViewMode("grid")}
              title="Hiển thị dạng Lưới"
            >
              <FaTh /> <span>Lưới</span>
            </button>
            <button
              type="button"
              className={`adm-view-toggle__btn ${viewMode === "list" ? "is-active" : ""}`}
              onClick={() => setViewMode("list")}
              title="Hiển thị dạng Danh sách"
            >
              <FaList /> <span>Danh sách</span>
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="stf-product-review__empty">Đang tải danh sách sản phẩm...</p>
      ) : filteredProducts.length === 0 ? (
        <p className="stf-product-review__empty">Không tìm thấy sản phẩm nào ở mục này.</p>
      ) : viewMode === "grid" ? (
        <div className="stf-product-review__list">
          {filteredProducts.map((p) => {
            const statusNorm = normalizeStatus(p);
            const statusText = STATUS_LABELS[statusNorm] || p.status || "Chờ duyệt";
            const statusClass = STATUS_CLASS[statusNorm] || "status-pending";
            const imgSrc = resolveImageUrl(p.image || p.imageUrl || p.primaryImageUrl || p.images?.[0]);
            return (
              <article key={p.id} className="stf-product-review__card">
                <header style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt=""
                      style={{ width: "52px", height: "52px", borderRadius: "8px", objectFit: "cover", flexShrink: 0, border: "1px solid #eee" }}
                    />
                  ) : (
                    <div style={{ width: "52px", height: "52px", borderRadius: "8px", background: "#f5f5f5", display: "grid", placeItems: "center", fontSize: "24px", flexShrink: 0 }}>📦</div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3>{p.name || p.productName || p.title || "Sản phẩm chưa đặt tên"}</h3>
                    <p>{p.category || p.categoryName || "Thương mại điện tử"} · Người bán: {p.seller || p.sellerName || p.userId || p.sellerId || "Shop người bán"}</p>
                  </div>
                  <span className={`stf-product-review__status ${statusClass}`}>{statusText}</span>
                </header>

                <dl>
                  <div>
                    <dt>Giá bán</dt>
                    <dd>{extractPrice(p).toLocaleString("vi-VN")}đ</dd>
                  </div>
                  <div>
                    <dt>Tồn kho</dt>
                    <dd>{p.stock ?? p.quantity ?? p.stockQuantity ?? 0}</dd>
                  </div>
                  <div>
                    <dt>Mã sản phẩm</dt>
                    <dd style={{ fontSize: "11px", wordBreak: "break-all" }}>{p.id}</dd>
                  </div>
                  <div>
                    <dt>Ngày tạo</dt>
                    <dd>{p.createdAt || p.createdDate || p.submittedAt ? new Date(p.createdAt || p.createdDate || p.submittedAt).toLocaleDateString("vi-VN") : "Hôm nay"}</dd>
                  </div>
                </dl>

                {(p.description || p.shortDescription) && (
                  <div className="stf-product-review__desc">
                    <strong>Mô tả sản phẩm:</strong>
                    <p>{p.description || p.shortDescription}</p>
                  </div>
                )}

                <footer>
                  <button
                    type="button"
                    className="reject"
                    disabled={processingId === p.id || statusNorm === "REJECTED"}
                    onClick={() => setRejectTarget(p)}
                  >
                    Từ chối
                  </button>
                  <button
                    type="button"
                    className="approve"
                    disabled={processingId === p.id || statusNorm === "APPROVED"}
                    onClick={() => handleApprove(p)}
                  >
                    {processingId === p.id ? "Đang xử lý..." : statusNorm === "APPROVED" ? "✓ Đã duyệt" : "Phê duyệt"}
                  </button>
                </footer>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="stf-product-review__table-wrap">
          <table className="stf-product-table">
            <thead>
              <tr>
                <th>Mã sản phẩm</th>
                <th>Tên sản phẩm & Danh mục</th>
                <th>Giá bán</th>
                <th>Tồn kho</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: "right" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const statusNorm = normalizeStatus(p);
                const statusText = STATUS_LABELS[statusNorm] || p.status || "Chờ duyệt";
                const statusClass = STATUS_CLASS[statusNorm] || "status-pending";
                const imgSrc = resolveImageUrl(p.image || p.imageUrl || p.primaryImageUrl || p.images?.[0]);
                return (
                  <tr key={p.id}>
                    <td className="col-id">
                      <strong>#{String(p.id).slice(0, 8)}</strong>
                      <small>{p.createdAt ? new Date(p.createdAt).toLocaleDateString("vi-VN") : "Hôm nay"}</small>
                    </td>
                    <td className="col-name">
                      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        {imgSrc ? (
                          <img src={imgSrc} alt="" style={{ width: "40px", height: "40px", borderRadius: "6px", objectFit: "cover", flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: "40px", height: "40px", borderRadius: "6px", background: "#f5f5f5", display: "grid", placeItems: "center", fontSize: "18px", flexShrink: 0 }}>📦</div>
                        )}
                        <div>
                          <div className="product-name">{p.name || p.productName || "Sản phẩm chưa đặt tên"}</div>
                          <small>{p.category || p.categoryName || "Thương mại điện tử"}</small>
                        </div>
                      </div>
                    </td>
                    <td className="col-price">
                      <strong>{extractPrice(p).toLocaleString("vi-VN")}đ</strong>
                    </td>
                    <td className="col-stock">
                      <span>{p.stock ?? p.quantity ?? 0}</span>
                    </td>
                    <td className="col-status">
                      <span className={`stf-product-review__status ${statusClass}`}>{statusText}</span>
                    </td>
                    <td className="col-actions" style={{ textAlign: "right" }}>
                      <div className="stf-table-actions">
                        <button
                          type="button"
                          className="stf-btn-action stf-btn-action--approve"
                          disabled={processingId === p.id || statusNorm === "APPROVED"}
                          onClick={() => handleApprove(p)}
                        >
                          <FaCheck /> {statusNorm === "APPROVED" ? "Đã duyệt" : "Duyệt"}
                        </button>
                        <button
                          type="button"
                          className="stf-btn-action stf-btn-action--reject"
                          disabled={processingId === p.id || statusNorm === "REJECTED"}
                          onClick={() => setRejectTarget(p)}
                        >
                          <FaTimes /> Từ chối
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <RejectReasonModal
        open={Boolean(rejectTarget)}
        title="Từ chối sản phẩm"
        subtitle="Chọn lý do từ chối. Người bán sẽ thấy lý do này để chỉnh sửa và đăng lại."
        targetLabel={rejectTarget ? rejectTarget.name || rejectTarget.productName || rejectTarget.title || "Sản phẩm chưa đặt tên" : ""}
        reasons={productRejectReasons}
        processing={processingId === rejectTarget?.id}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleConfirmReject}
      />
    </div>
  );
};

export default StaffProductReview;
