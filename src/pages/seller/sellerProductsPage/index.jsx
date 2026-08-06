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

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const endpoints = [
        "/seller/products",
        "/ecommerce/products",
        "/management/products",
        "/products",
      ];

      const results = await Promise.allSettled(
        endpoints.map((ep) =>
          api.get(ep, { params: { scope: "management", pageSize: 100, pageNumber: 1, limit: 100 } })
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
                    stock: mapped.stock > 0 ? mapped.stock : existing.stock,
                    stockQuantity: mapped.stockQuantity > 0 ? mapped.stockQuantity : existing.stockQuantity,
                  });
                }
              }
            }
          });
        }
      });

      // Merge local products case-insensitively so newly created/submitted items appear
      try {
        const localList = JSON.parse(localStorage.getItem("seller_created_products") || "[]");
        localList.forEach((lp) => {
          if (!lp || (!lp.id && !lp.productId)) return;
          const realId = lp.id || lp.productId;
          const key = String(realId).toLowerCase();
          const stockVal = Number(lp.stockQuantity ?? lp.stock ?? 0);
          const modVal = lp.moderationStatus && lp.moderationStatus !== "NONE" ? lp.moderationStatus : "PENDING_MANUAL_REVIEW";

          if (!map.has(key)) {
            map.set(key, {
              ...lp,
              id: realId,
              stock: stockVal,
              stockQuantity: stockVal,
              moderationStatus: modVal,
              status: lp.status || "PENDING",
            });
          } else {
            const existing = map.get(key);
            const mergedStock = stockVal > 0 ? stockVal : Number(existing.stockQuantity ?? existing.stock ?? 0);
            map.set(key, {
              ...existing,
              ...lp,
              id: realId,
              stock: mergedStock,
              stockQuantity: mergedStock,
              moderationStatus: modVal || existing.moderationStatus || "NONE",
            });
          }
        });
      } catch {
        /* ignore */
      }

      let list = Array.from(map.values());

      // Nạp thông tin kiểm duyệt thời gian thực cho từng sản phẩm
      const enrichedList = await Promise.all(
        list.map(async (p) => {
          try {
            const modData = await getProductModeration(p.id);
            if (modData && modData.moderationStatus && modData.moderationStatus !== "NONE") {
              return {
                ...p,
                moderationStatus: modData.moderationStatus,
                rowVersion: modData.rowVersion || p.rowVersion,
              };
            }
          } catch {
            /* ignore */
          }
          return p;
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
      return st === "DRAFT" || mod === "REJECTED";
    }).length;
    return { total, active, outOfStock, pending, draftOrRejected };
  }, [myProducts]);

  const handleSubmitReview = async (product) => {
    // Bước 1: GET /api/v1/ecommerce/products/{productId}/moderation
    const modData = await getProductModeration(product.id);
    const modStatus = modData?.moderationStatus || product.moderationStatus || "NONE";
    const rowVersion = modData?.rowVersion || product.rowVersion || null;

    // Bước 2: FE kiểm tra trạng thái
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

    // Bước 3: Submit (khi chưa submit)
    try {
      await submitProductForReview(product.id, rowVersion);
      toast.success("Gửi duyệt thành công");
      await fetchProducts();
    } catch (err) {
      const is409 = err?.response?.status === 409 || err?.status === 409;
      const msg = getApiErrorMessage(err, "");
      if (is409 || /moderation is active|already approved/i.test(msg)) {
        toast.info("Sản phẩm đang chờ duyệt");
        await fetchProducts();
      } else {
        toast.error(msg || "Không thể gửi duyệt sản phẩm");
      }
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
                    const rawMod = String(p.moderationStatus || p.reviewStatus || p.approvalStatus || "").toUpperCase();
                    const rawSt = String(p.status || "").toUpperCase();

                    let effectiveModStatus = "NONE";
                    if (rawMod === "APPROVED" || rawSt === "APPROVED" || rawSt === "ACTIVE" || rawSt === "PUBLISHED") {
                      effectiveModStatus = "APPROVED";
                    } else if (rawMod === "REJECTED" || rawSt === "REJECTED") {
                      effectiveModStatus = "REJECTED";
                    } else if (
                      rawMod === "PENDING_MANUAL_REVIEW" ||
                      rawMod.includes("PENDING") ||
                      rawSt.includes("PENDING") ||
                      rawSt.includes("REVIEW") ||
                      rawSt.includes("CHỜ")
                    ) {
                      effectiveModStatus = "PENDING_MANUAL_REVIEW";
                    }

                    const isSubmittingDisabled =
                      effectiveModStatus === "PENDING_MANUAL_REVIEW" ||
                      effectiveModStatus === "APPROVED";

                    let buttonText = "Gửi duyệt";
                    let badgeLabel = "Đang ẩn";
                    let badgeClass = "draft";

                    if (effectiveModStatus === "APPROVED") {
                      buttonText = "Đã duyệt";
                      badgeLabel = "Đã duyệt";
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

                    return (
                      <tr key={p.id}>
                        <td>
                          <div className="slr-product-thumb" style={{ width: "48px", height: "48px", overflow: "hidden", borderRadius: "6px" }}>
                            {p.images?.[0] ? <img src={p.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span>—</span>}
                          </div>
                        </td>
                        <td>
                          <strong>{p.name || category?.label || "Sản phẩm"}</strong>
                          {p.brand && <div style={{ fontSize: "12px", color: "#888" }}>Thương hiệu: {p.brand}</div>}
                        </td>
                        <td style={{ fontSize: "12px", color: "#555" }}>{p.id}</td>
                        <td style={{ fontWeight: 600, color: "#6b3ba7" }}>{Number(p.price || 0).toLocaleString("vi-VN")}đ</td>
                        <td className={Number(p.stock) === 0 ? "warn" : ""}>{p.stock}</td>
                        <td>
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                            <span className={`slr-badge slr-badge--${badgeClass}`}>
                              {badgeLabel}
                            </span>
                            <button
                              type="button"
                              className="slr-btn-create"
                              disabled={isSubmittingDisabled}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                height: "28px",
                                padding: "0 10px",
                                fontSize: "11px",
                                opacity: isSubmittingDisabled ? 0.65 : 1,
                                cursor: isSubmittingDisabled ? "not-allowed" : "pointer",
                              }}
                              onClick={() => handleSubmitReview(p)}
                            >
                              {buttonText}
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
        </div>
      </section>
    </div>
  );
}
