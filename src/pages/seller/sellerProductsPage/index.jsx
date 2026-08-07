import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import PageHeader from "../../../components/sellerdashboard/sellerPageHeader";
import MiniStat from "../../../components/sellerdashboard/sellerMiniStat";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../config/api";
import {
  getMyEcommerceProducts,
  submitProductForReview,
  getProductModeration,
  mapSellerProductToUi,
  getApiErrorMessage,
} from "../../../services/ecommerceProductService";
import { productCategories } from "../../../data/auctionMockData";

const STATUS_LABELS = {
  DRAFT: "Đang ẩn",
  PENDING: "Chờ duyệt",
  APPROVED: "Đang bán",
  REJECTED: "Bị từ chối",
};

export default function ProductsPage() {
  const { user } = useAuth();
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRejectProduct, setSelectedRejectProduct] = useState(null);

  const extractRejectReason = (p) => {
    if (!p) return "";
    if (p.comment) return p.comment;
    if (p.rejectReason) return p.rejectReason;

    if (Array.isArray(p.issues) && p.issues.length > 0) {
      const msgs = p.issues
        .map((iss) => {
          if (iss.message) return iss.message;
          if (iss.issueCode === "PROHIBITED_KEYWORD") return "Chứa từ cấm vi phạm quy định";
          if (iss.issueCode === "EXTERNAL_URL_DETECTED") return "Phát hiện liên kết/tên miền ngoài";
          if (iss.issueCode === "IMAGE_CONTENT_UNAVAILABLE") return "Không đọc được dữ liệu ảnh từ bộ nhớ";
          return iss.issueCode;
        })
        .filter(Boolean);
      if (msgs.length > 0) {
        return msgs.join(" • ");
      }
    }

    if (p.reasonCode) return `Mã lý do từ chối: ${p.reasonCode}`;
    return "Sản phẩm chứa nội dung vi phạm chính sách kiểm duyệt";
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const endpoints = [
        "/seller/products",
        "/ecommerce/products",
      ];

      const results = await Promise.allSettled(
        endpoints.map((ep) =>
          api.get(ep, { params: { pageSize: 100, pageNumber: 1 }, skipErrorRedirect: true })
        )
      );

      const map = new Map();

      results.forEach((res) => {
        if (res.status === "fulfilled") {
          const val = res.value?.data || res.value;
          const items = Array.isArray(val)
            ? val
            : Array.isArray(val?.items)
            ? val.items
            : Array.isArray(val?.data?.items)
            ? val.data.items
            : Array.isArray(val?.data)
            ? val.data
            : Array.isArray(val?.results)
            ? val.results
            : [];

          items.forEach((item) => {
            if (item && (item.id || item.productId)) {
              const mapped = mapSellerProductToUi(item);
              if (mapped && mapped.id) {
                const key = String(mapped.id).toLowerCase();
                if (!map.has(key)) {
                  map.set(key, mapped);
                } else {
                  const existing = map.get(key);
                  map.set(key, {
                    ...existing,
                    ...mapped,
                    id: mapped.id,
                  });
                }
              }
            }
          });
        }
      });

      let list = Array.from(map.values());

      // Nạp thông tin kiểm duyệt & ảnh thời gian thực cho từng sản phẩm
      const enrichedList = await Promise.all(
        list.map(async (p) => {
          let updated = { ...p };

          // Nạp chi tiết để lấy ảnh đầy đủ từ CSDL catalog.ProductImages nếu danh sách tổng chưa trả về ảnh
          if (!updated.images || updated.images.length === 0) {
            const productIdStr = String(p.id || p.productId || "");
            const imageEndpoints = [
              `/ecommerce/products/${productIdStr}/images`,
              `/products/${productIdStr}/images`,
              `/catalog/products/${productIdStr}/images`,
              `/ecommerce/products/${productIdStr.toUpperCase()}/images`,
            ];

            for (const ep of imageEndpoints) {
              try {
                const res = await api.get(ep, { skipErrorRedirect: true });
                const val = res?.data?.data || res?.data?.items || res?.data || res;
                const rawImgs = Array.isArray(val) ? val : Array.isArray(val?.items) ? val.items : [];
                if (rawImgs.length > 0) {
                  // Assuming resolveImageUrl is imported or available globally
                  const mappedImgs = rawImgs.map(r => r.url || r).filter(Boolean);
                  if (mappedImgs.length > 0) {
                    updated.images = mappedImgs;
                    break;
                  }
                }
              } catch {
                /* ignore */
              }
            }

            // 2. Thử gọi API review-detail nếu vẫn chưa có ảnh: GET /admin/products/{id}/review-detail
            if (!updated.images || updated.images.length === 0) {
              try {
                const { data: revRes } = await api.get(`/admin/products/${p.id}/review-detail`, { skipErrorRedirect: true });
                const revData = revRes?.data || revRes;
                if (revData) {
                  const revImgs = Array.isArray(revData.images)
                    ? revData.images
                    : Array.isArray(revData.productImages)
                      ? revData.productImages
                      : [revData.imageUrl || revData.primaryImageUrl || revData.coverImageUrl || revData.imageKey || revData.storageObjectKey].filter(Boolean);
                  const mappedImgs = revImgs.map(r => r.url || r).filter(Boolean);
                  if (mappedImgs.length > 0) {
                    updated.images = mappedImgs;
                  }
                }
              } catch {
                /* ignore */
              }
            }

            // 3. Thử gọi API chi tiết sản phẩm: GET /ecommerce/products/{id}
            if (!updated.images || updated.images.length === 0) {
              try {
                const { data } = await api.get(`/ecommerce/products/${p.id}?scope=mine`, { skipErrorRedirect: true });
                const detail = data?.data || data;
                if (detail) {
                  const mappedDetail = mapSellerProductToUi(detail);
                  if (mappedDetail && mappedDetail.images && mappedDetail.images.length > 0) {
                    updated.images = mappedDetail.images;
                  }
                }
              } catch {
                /* ignore */
              }
            }

            // 4. Lấy từ Cache LocalStorage làm phương án dự phòng tức thì khi Backend C# chưa kích hoạt ảnh công khai
            if (!updated.images || updated.images.length === 0) {
              try {
                const cachedMap = JSON.parse(localStorage.getItem("seller_product_images_map") || "{}");
                const cachedUrls = cachedMap[p.id];
                if (Array.isArray(cachedUrls) && cachedUrls.length > 0) {
                  updated.images = cachedUrls.map(u => u).filter(Boolean);
                }
              } catch {
                /* ignore */
              }
            }
          }

          // Nạp thông tin kiểm duyệt & nguyên nhân từ chối chi tiết
          try {
            const modData = await getProductModeration(p.id);
            if (modData) {
              const status = modData.moderationStatus || modData.data?.moderationStatus;
              if (status && status !== "NONE") {
                updated.moderationStatus = status;
              }
              if (modData.rowVersion) updated.rowVersion = modData.rowVersion;
              if (Array.isArray(modData.issues)) updated.issues = modData.issues;
              if (modData.comment) updated.comment = modData.comment;
              if (modData.reasonCode) updated.reasonCode = modData.reasonCode;
              if (modData.autoDecision) updated.autoDecision = modData.autoDecision;
              if (modData.riskLevel) updated.riskLevel = modData.riskLevel;
            }
          } catch {
            /* ignore */
          }

          return updated;
        })
      );

      setMyProducts(enrichedList);
    } catch {
      try {
        const localList = JSON.parse(localStorage.getItem("seller_created_products") || "[]");
        setMyProducts(localList);
      } catch {
        setMyProducts([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [user?.id]);

  const stats = useMemo(() => {
    const total = myProducts.length;
    const active = myProducts.filter((p) => {
      const st = String(p.status || "").toUpperCase();
      const mod = String(p.moderationStatus || "").toUpperCase();
      return st === "APPROVED" || st === "ACTIVE" || mod === "APPROVED";
    }).length;
    const outOfStock = myProducts.filter((p) => Number(p.stock) === 0).length;
    const pending = myProducts.filter((p) => {
      const st = String(p.status || "").toUpperCase();
      const mod = String(p.moderationStatus || "").toUpperCase();
      return st.includes("PENDING") || mod === "PENDING_MANUAL_REVIEW";
    }).length;
    const draftOrRejected = myProducts.filter((p) => {
      const st = String(p.status || "").toUpperCase();
      const mod = String(p.moderationStatus || "").toUpperCase();
      return st === "DRAFT" || mod === "REJECTED" || mod === "AUTO_REJECTED";
    }).length;
    return { total, active, outOfStock, pending, draftOrRejected };
  }, [myProducts]);

  const handleSubmitReview = async (product) => {
    const modData = await getProductModeration(product.id);
    const modStatus = modData?.moderationStatus || product.moderationStatus || "NONE";
    const rowVersion = modData?.rowVersion || product.rowVersion || null;

    if (modStatus === "PENDING_MANUAL_REVIEW") {
      toast.info("Sản phẩm đang chờ duyệt");
      await fetchProducts();
      return;
    }
    if (modStatus === "APPROVED") {
      toast.info("Sản phẩm đã được duyệt");
      await fetchProducts();
      return;
    }

    try {
      const submitRes = await submitProductForReview(product.id, rowVersion);
      const isAutoRejected =
        submitRes?.moderationStatus === "AUTO_REJECTED" ||
        submitRes?.autoDecision === "BLOCKED" ||
        submitRes?.data?.moderationStatus === "AUTO_REJECTED";

      const targetStatus = isAutoRejected ? "REJECTED" : "PENDING_MANUAL_REVIEW";
      const targetMainStatus = isAutoRejected ? "REJECTED" : "PENDING";

      if (isAutoRejected) {
        toast.warning("Sản phẩm bị hệ thống từ chối tự động do vi phạm quy định (chứa từ cấm / liên kết ngoài).");
      } else {
        toast.success("Gửi duyệt thành công");
      }

      setMyProducts((prev) =>
        prev.map((item) =>
          item.id === product.id
            ? { ...item, moderationStatus: targetStatus, status: targetMainStatus }
            : item
        )
      );

      try {
        const localList = JSON.parse(localStorage.getItem("seller_created_products") || "[]");
        const updatedLocal = localList.map((item) =>
          item.id === product.id
            ? { ...item, moderationStatus: targetStatus, status: targetMainStatus }
            : item
        );
        localStorage.setItem("seller_created_products", JSON.stringify(updatedLocal));
      } catch {
        /* ignore */
      }

      await fetchProducts();
    } catch (err) {
      const is409 = err?.response?.status === 409 || err?.status === 409;
      const msg = getApiErrorMessage(err, "");
      if (is409 || msg.includes("chờ duyệt") || msg.includes("thay đổi")) {
        toast.info("Sản phẩm đang chờ duyệt trên hệ thống.");
      } else {
        toast.error(msg || "Gửi duyệt thất bại");
      }
      await fetchProducts();
    }
  };

  return (
    <div className="slr-page">
      <PageHeader
        title="Quản lý sản phẩm"
        subtitle="Thống kê và danh sách sản phẩm"
        actions={
          <Link to="/seller-hub/products/create" className="slr-btn-create">
            + Tạo sản phẩm
          </Link>
        }
      />

      <section className="slr-section">
        <div className="slr-metrics-grid slr-metrics-grid--5">
          {[
            { label: "Tổng SP", value: stats.total },
            { label: "Đang hoạt động", value: stats.active },
            { label: "Hết hàng", value: stats.outOfStock, warn: stats.outOfStock > 0 },
            { label: "Chờ duyệt", value: stats.pending },
            { label: "Đang ẩn / Từ chối", value: stats.draftOrRejected },
          ].map((s, i) => (
            <MiniStat key={s.label} {...s} delay={i * 60} />
          ))}
        </div>

        <div className="slr-panel-card">
          <h4>Danh sách sản phẩm của tôi ({myProducts.length})</h4>
          {loading ? (
            <p style={{ padding: "20px", color: "#666" }}>Đang tải danh sách sản phẩm...</p>
          ) : myProducts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#666" }}>
              <p style={{ marginBottom: "16px", fontSize: "15px" }}>Bạn chưa có sản phẩm nào trên hệ thống.</p>
              <Link to="/seller-hub/products/create" className="slr-btn-create" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                + Đăng bán sản phẩm đầu tiên
              </Link>
            </div>
          ) : (
            <div className="slr-table-wrap">
              <table className="slr-table">
                <thead>
                  <tr>
                    <th>Ảnh</th>
                    <th>Sản phẩm</th>
                    <th>Mã sản phẩm</th>
                    <th>Giá bán</th>
                    <th>Tồn kho</th>
                    <th>Trạng thái & Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {myProducts.map((p) => {
                    const category = productCategories.find((c) => c.id === p.category);
                    const rawSt = String(p.status || "").toUpperCase();
                    const rawMod = String(p.moderationStatus || p.reviewStatus || p.approvalStatus || "").toUpperCase();

                    let effectiveModStatus = "DRAFT";
                    if (rawSt === "REJECTED" || rawMod === "REJECTED" || rawMod === "AUTO_REJECTED" || rawMod.includes("REJECT") || rawMod.includes("BLOCK")) {
                      effectiveModStatus = "REJECTED";
                    } else if (rawSt === "ACTIVE" || rawSt === "APPROVED" || rawMod === "APPROVED" || rawSt === "PUBLISHED") {
                      effectiveModStatus = "APPROVED";
                    } else if (
                      rawSt === "PENDING_REVIEW" ||
                      rawSt === "PENDING" ||
                      rawMod === "PENDING_MANUAL_REVIEW" ||
                      rawMod.includes("PENDING") ||
                      rawMod.includes("AUTO_REVIEW") ||
                      rawMod.includes("REVIEW") ||
                      rawMod.includes("SUBMIT")
                    ) {
                      effectiveModStatus = "PENDING_MANUAL_REVIEW";
                    }

                    const isSubmittingDisabled =
                      effectiveModStatus === "PENDING_MANUAL_REVIEW" ||
                      effectiveModStatus === "APPROVED";

                    let buttonText = "Gửi duyệt";
                    let badgeLabel = "Đang ẩn / Nháp";
                    let badgeClass = "draft";

                    if (effectiveModStatus === "APPROVED") {
                      buttonText = "Đã duyệt";
                      badgeLabel = "Đang bán";
                      badgeClass = "approved";
                    } else if (effectiveModStatus === "PENDING_MANUAL_REVIEW") {
                      buttonText = "Đang chờ duyệt";
                      badgeLabel = "Chờ duyệt";
                      badgeClass = "pending";
                    } else if (effectiveModStatus === "REJECTED") {
                      buttonText = "Gửi lại duyệt";
                      badgeLabel = "Bị từ chối";
                      badgeClass = "rejected";
                    }

                    let displayStock = p.stock;
                    if (!displayStock || Number(displayStock) === 0) {
                      try {
                        const localList = JSON.parse(localStorage.getItem("seller_created_products") || "[]");
                        const matchedLocal = localList.find((item) => String(item.id).toLowerCase() === String(p.id).toLowerCase());
                        if (matchedLocal && matchedLocal.stock > 0) {
                          displayStock = matchedLocal.stock;
                        }
                      } catch {
                        /* ignore */
                      }
                    }

                    return (
                      <tr key={p.id}>
                        <td>
                          <div className="slr-product-thumb" style={{ width: "48px", height: "48px", overflow: "hidden", borderRadius: "6px" }}>
                            {p.images?.[0] ? <img src={p.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span>—</span>}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                            <strong style={{ fontSize: "14px", color: "#1e293b", fontWeight: 600 }}>
                              {p.name || p.productName || category?.label || "Sản phẩm"}
                            </strong>
                            {p.brand && <span style={{ fontSize: "12px", color: "#64748b" }}>Thương hiệu: {p.brand}</span>}
                          </div>
                        </td>
                        <td style={{ fontSize: "12px", color: "#555" }}>{p.id}</td>
                        <td style={{ fontWeight: 600, color: "#6b3ba7" }}>{Number(p.price || 0).toLocaleString("vi-VN")}đ</td>
                        <td style={{ fontWeight: 600, color: Number(displayStock) === 0 ? "#d32f2f" : "#2e7d32" }}>
                          {displayStock || 0}
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "flex-start", flexWrap: "wrap" }}>
                            <span
                              className={`slr-badge slr-badge--${badgeClass}`}
                              style={
                                effectiveModStatus === "APPROVED"
                                  ? {
                                      background: "linear-gradient(135deg, #dcfce7, #bbf7d0)",
                                      color: "#15803d",
                                      border: "1px solid #86efac",
                                      fontWeight: 600,
                                      padding: "4px 12px",
                                      borderRadius: "20px",
                                      fontSize: "12px",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "4px",
                                    }
                                  : effectiveModStatus === "REJECTED"
                                  ? {
                                      background: "linear-gradient(135deg, #ffe4e6, #fecdd3)",
                                      color: "#be123c",
                                      border: "1px solid #fda4af",
                                      fontWeight: 600,
                                      padding: "4px 12px",
                                      borderRadius: "20px",
                                      fontSize: "12px",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "4px",
                                    }
                                  : {
                                      background: "#f1f5f9",
                                      color: "#475569",
                                      border: "1px solid #cbd5e1",
                                      fontWeight: 600,
                                      padding: "4px 12px",
                                      borderRadius: "20px",
                                      fontSize: "12px",
                                    }
                              }
                            >
                              {effectiveModStatus === "APPROVED" && "✓ "}
                              {effectiveModStatus === "REJECTED" && "✕ "}
                              {effectiveModStatus === "PENDING_MANUAL_REVIEW" && "⏳ "}
                              {badgeLabel}
                            </span>

                            {effectiveModStatus === "REJECTED" && (
                              <button
                                type="button"
                                onClick={() => setSelectedRejectProduct(p)}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  padding: "4px 12px",
                                  background: "linear-gradient(135deg, #fff1f2, #ffe4e6)",
                                  border: "1px solid #fecdd3",
                                  borderRadius: "20px",
                                  color: "#be123c",
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  transition: "all 0.2s ease",
                                  boxShadow: "0 1px 3px rgba(225,29,72,0.1)",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = "translateY(-1px)";
                                  e.currentTarget.style.boxShadow = "0 3px 6px rgba(225,29,72,0.15)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = "none";
                                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(225,29,72,0.1)";
                                }}
                              >
                                <span>⚠️ Phát hiện {p.issues?.length || 1} vi phạm — <u>Xem lý do</u></span>
                              </button>
                            )}

                            {effectiveModStatus !== "REJECTED" && (
                              <button
                                type="button"
                                className="slr-btn-create"
                                disabled={isSubmittingDisabled}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  height: "32px",
                                  padding: "0 14px",
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  borderRadius: "8px",
                                  background:
                                    effectiveModStatus === "APPROVED"
                                      ? "linear-gradient(135deg, #16a34a, #22c55e)"
                                      : undefined,
                                  color: "#ffffff",
                                  border: "none",
                                  opacity: isSubmittingDisabled ? 0.55 : 1,
                                  cursor: isSubmittingDisabled ? "not-allowed" : "pointer",
                                }}
                                onClick={() => handleSubmitReview(p)}
                              >
                                {buttonText}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* POPUP CHI TIẾT LÝ DO TỪ CHỐI - STUNNING PREMIUM MODAL */}
      {selectedRejectProduct && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(8px)",
            display: "grid",
            placeItems: "center",
            padding: "16px",
          }}
          onClick={() => setSelectedRejectProduct(null)}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              maxWidth: "620px",
              width: "100%",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              overflow: "hidden",
              border: "1px solid #ffe4e6",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "20px 24px",
                background: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)",
                borderBottom: "1px solid #fecdd3",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "12px",
                    background: "#ffffff",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "22px",
                    boxShadow: "0 2px 8px rgba(225,29,72,0.15)",
                  }}
                >
                  🚫
                </div>
                <div>
                  <h3 style={{ margin: 0, color: "#881337", fontSize: "18px", fontWeight: 700 }}>
                    Chi tiết lý do từ chối
                  </h3>
                  <span style={{ fontSize: "12px", color: "#9f1239", fontWeight: 500 }}>
                    Phát hiện bởi hệ thống kiểm duyệt tự động (Auto Moderation)
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRejectProduct(null)}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  border: "none",
                  background: "rgba(255,255,255,0.7)",
                  color: "#9f1239",
                  fontSize: "16px",
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#ffffff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.7)"; }}
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: "24px", maxHeight: "68vh", overflowY: "auto" }}>
              {/* Product Info Summary Card */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "14px 16px",
                  background: "#f8fafc",
                  borderRadius: "14px",
                  border: "1px solid #e2e8f0",
                  marginBottom: "20px",
                }}
              >
                {selectedRejectProduct.images?.[0] ? (
                  <img
                    src={selectedRejectProduct.images[0]}
                    alt=""
                    style={{ width: "52px", height: "52px", borderRadius: "10px", objectFit: "cover", border: "1px solid #cbd5e1" }}
                  />
                ) : (
                  <div style={{ width: "52px", height: "52px", borderRadius: "10px", background: "#cbd5e1", display: "grid", placeItems: "center", fontSize: "24px" }}>
                    📦
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ margin: "0 0 2px 0", fontSize: "15px", color: "#0f172a", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {selectedRejectProduct.name}
                  </h4>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>
                    Mã sản phẩm: <code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", color: "#475569" }}>{selectedRejectProduct.id}</code>
                  </div>
                </div>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: "20px",
                    background: "#ffe4e6",
                    color: "#9f1239",
                    fontSize: "11px",
                    fontWeight: 700,
                    border: "1px solid #fecdd3",
                    whiteSpace: "nowrap",
                  }}
                >
                  🔴 BLOCKED
                </span>
              </div>

              {/* Issues List */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#1e293b" }}>
                    Các vi phạm cần sửa đổi ({selectedRejectProduct.issues?.length || 1}):
                  </span>
                  <span style={{ fontSize: "12px", color: "#e11d48", fontWeight: 600 }}>
                    Cần sửa trước khi gửi duyệt lại
                  </span>
                </div>

                {Array.isArray(selectedRejectProduct.issues) && selectedRejectProduct.issues.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {selectedRejectProduct.issues.map((iss, i) => (
                      <div
                        key={i}
                        style={{
                          padding: "16px",
                          background: "#fff1f2",
                          borderRadius: "14px",
                          border: "1px solid #fecdd3",
                          boxShadow: "0 2px 4px rgba(225,29,72,0.03)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: 800,
                              padding: "3px 8px",
                              borderRadius: "6px",
                              background: iss.severity === "BLOCK" ? "#be123c" : "#d97706",
                              color: "#ffffff",
                              letterSpacing: "0.5px",
                              textTransform: "uppercase",
                            }}
                          >
                            {iss.severity || "BLOCK"}
                          </span>
                          <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>
                            📌 Trường: <strong style={{ color: "#0f172a" }}>{iss.fieldName || "Mô tả sản phẩm"}</strong>
                          </span>
                        </div>

                        <p style={{ margin: "0 0 6px 0", fontSize: "13px", fontWeight: 600, color: "#881337", lineHeight: "1.4" }}>
                          {iss.message || iss.issueCode}
                        </p>

                        {iss.maskedSnippet && (
                          <div style={{ marginTop: "6px", fontSize: "11px", color: "#9f1239", background: "#ffffff", padding: "6px 10px", borderRadius: "8px", border: "1px solid #ffe4e6", display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ color: "#e11d48", fontWeight: 600 }}>Mẫu bị chặn:</span>
                            <code style={{ color: "#be123c", fontWeight: 700 }}>{iss.maskedSnippet}</code>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: "16px", background: "#fff1f2", borderRadius: "14px", border: "1px solid #fecdd3", color: "#881337", fontSize: "13px", lineHeight: "1.5" }}>
                    {extractRejectReason(selectedRejectProduct)}
                  </div>
                )}
              </div>

              {/* Instructions Banner */}
              <div
                style={{
                  padding: "14px 16px",
                  background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
                  borderRadius: "14px",
                  border: "1px solid #bfdbfe",
                  fontSize: "13px",
                  color: "#1e40af",
                  lineHeight: "1.5",
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                }}
              >
                <span style={{ fontSize: "18px" }}>💡</span>
                <div>
                  <strong>Hướng dẫn khắc phục:</strong> Vui lòng loại bỏ từ cấm, các đường link ngoài hoặc cập nhật ảnh mới, sau đó bấm <strong>"Gửi lại duyệt"</strong> để hệ thống phê duyệt lại.
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: "16px 24px",
                background: "#f8fafc",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedRejectProduct(null)}
                style={{
                  padding: "10px 20px",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#475569",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f5f9"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#ffffff"; }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
