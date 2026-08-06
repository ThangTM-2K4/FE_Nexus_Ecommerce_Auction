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
            // 1. Thử các API lấy danh sách ảnh sản phẩm trực tiếp từ CSDL
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
                  const mappedImgs = rawImgs.map(resolveImageUrl).filter(Boolean);
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
                  const mappedImgs = revImgs.map(resolveImageUrl).filter(Boolean);
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
                const { data } = await api.get(`/ecommerce/products/${p.id}`, { skipErrorRedirect: true });
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
                  updated.images = cachedUrls.map(resolveImageUrl).filter(Boolean);
                }
              } catch {
                /* ignore */
              }
            }
          }

          // Nạp thông tin kiểm duyệt
          try {
            const modData = await getProductModeration(p.id);
            if (modData && modData.moderationStatus && modData.moderationStatus !== "NONE") {
              updated.moderationStatus = modData.moderationStatus;
              updated.rowVersion = modData.rowVersion || updated.rowVersion;
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
                    const rawSt = String(p.status || "").toUpperCase();
                    const rawMod = String(p.moderationStatus || p.reviewStatus || p.approvalStatus || "").toUpperCase();

                    let effectiveModStatus = "DRAFT";
                    if (rawSt === "ACTIVE" || rawSt === "APPROVED" || rawMod === "APPROVED" || rawSt === "PUBLISHED") {
                      effectiveModStatus = "APPROVED";
                    } else if (rawSt === "REJECTED" || rawMod === "REJECTED") {
                      effectiveModStatus = "REJECTED";
                    } else if (
                      rawSt === "PENDING_REVIEW" ||
                      rawSt === "PENDING" ||
                      rawMod === "PENDING_MANUAL_REVIEW"
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

                    return (
                      <tr key={p.id}>
                        <td>
                          <div className="slr-product-thumb" style={{ width: "48px", height: "48px", overflow: "hidden", borderRadius: "6px" }}>
                            {p.images?.[0] ? <img src={p.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span>—</span>}
                          </div>
                        </td>
                        <td>
                          <strong>{p.name || p.productName || category?.label || "Sản phẩm"}</strong>
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
