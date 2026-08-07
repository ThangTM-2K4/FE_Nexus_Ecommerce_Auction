import { useEffect, useMemo, useState } from "react";
import StaffPageHeader from "../../../components/staff/staffPageHeader";
import StaffKpiCard from "../../../components/staff/staffKpiCard";
import { getAdminProducts } from "../../../services/adminProductService";
import { getProducts, resolveImageUrl, extractProductStock } from "../../../services/ecommerceProductService";
import "./index.scss";

const STATUS_CLASS = {
  "Hoạt động": "ok",
  "Chờ duyệt": "pending",
  "Ẩn": "hidden",
  "Bản nháp": "draft",
  "Từ chối": "rejected",
};

const StaffProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchAllProducts = async () => {
      setLoading(true);
      try {
        const res = await getAdminProducts();
        let items = res?.items || [];
        if (!items || items.length === 0) {
          const fallbackRes = await getProducts({ pageSize: 100 });
          items = fallbackRes?.items || [];
        }
        if (mounted) {
          setProducts(items);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setProducts([]);
          setLoading(false);
        }
      }
    };
    fetchAllProducts();
    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(
    () => ({
      total: products.length,
      active: products.filter((p) => (p.statusLabel || p.status) === "Hoạt động" || p.status === "ACTIVE").length,
      pending: products.filter((p) => (p.statusLabel || p.status) === "Chờ duyệt" || p.status === "PENDING" || p.status === "PENDING_MANUAL_REVIEW").length,
      sellers: new Set(products.map((p) => p.seller || p.sellerName || p.shopName)).size,
    }),
    [products]
  );

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      [p.id, p.name, p.productName, p.title, p.seller, p.sellerName, p.shopName, p.category, p.categoryName].some((v) =>
        String(v || "").toLowerCase().includes(q)
      )
    );
  }, [products, query]);

  return (
    <div className="stf-products">
      <StaffPageHeader
        kicker="Tra cứu"
        title="Danh sách sản phẩm"
        subtitle="Chỉ xem và tìm kiếm — không được tạo, sửa hoặc xoá sản phẩm."
      />

      <div className="stf-products__kpis">
        <StaffKpiCard label="Tổng SKU" value={String(stats.total)} hint="Toàn nền tảng" />
        <StaffKpiCard label="Đang bán" value={String(stats.active)} hint="Trạng thái Hoạt động" highlight />
        <StaffKpiCard label="Chờ duyệt" value={String(stats.pending)} hint="Cần kiểm duyệt" warn={stats.pending > 0} />
        <StaffKpiCard label="Seller" value={String(stats.sellers)} hint="Shop có sản phẩm" />
      </div>

      <div className="stf-products__toolbar">
        <input
          type="search"
          placeholder="Tìm mã SP, tên, seller, danh mục, thương hiệu..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span className="stf-products__count">{shown.length} kết quả</span>
      </div>

      {loading ? (
        <p className="stf-products__empty">Đang tải danh sách sản phẩm...</p>
      ) : (
        <div className="stf-products__table-wrap">
          <table className="stf-products__table">
            <thead>
              <tr>
                <th style={{ width: "60px" }}>Ảnh</th>
                <th>Mã SP</th>
                <th>Tên sản phẩm</th>
                <th>Seller</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Tồn</th>
                <th>Trạng thái</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {shown.map((p) => {
                const nameText = p.name || p.productName || p.title || "Sản phẩm chưa đặt tên";
                const sellerText = p.seller || p.sellerName || p.shopName || "Shop người bán";
                const categoryText = p.category || p.categoryName || "Điện Thoại & Phụ Kiện";
                const priceNum = p.minPrice ?? p.price ?? p.priceNum ?? 0;
                const priceFormatted = typeof p.price === "string" && p.price.includes("₫")
                  ? p.price
                  : priceNum > 0
                    ? Number(priceNum).toLocaleString("vi-VN") + "đ"
                    : "—";
                const stockVal = extractProductStock(p);
                const imgSrc = resolveImageUrl(p.image || p.imageUrl || p.images?.[0] || p.primaryImageUrl);
                const statusTxt = p.statusLabel || p.status || "Hoạt động";
                const statusCls = STATUS_CLASS[statusTxt] || "default";

                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ width: "40px", height: "40px", borderRadius: "8px", overflow: "hidden", background: "#f1f5f9", display: "grid", placeItems: "center", border: "1px solid #cbd5e1" }}>
                        {imgSrc ? (
                          <img src={imgSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <span style={{ fontSize: "18px" }}>📦</span>
                        )}
                      </div>
                    </td>
                    <td><code>{String(p.id).slice(0, 8)}</code></td>
                    <td><strong>{nameText}</strong></td>
                    <td>{sellerText}</td>
                    <td>{categoryText}</td>
                    <td style={{ fontWeight: 600, color: "#6b3ba7" }}>{priceFormatted}</td>
                    <td style={{ fontWeight: 600, color: stockVal === 0 ? "#d32f2f" : "#2e7d32" }}>
                      {stockVal}
                    </td>
                    <td>
                      <span className={`stf-products__status stf-products__status--${statusCls}`}>
                        {statusTxt}
                      </span>
                    </td>
                    <td>
                      <button type="button" className="stf-products__view" onClick={() => setDetail({ ...p, stockVal, nameText, sellerText, categoryText, priceFormatted, imgSrc })}>Chi tiết</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {detail && (
        <div className="stf-products__overlay" onClick={() => setDetail(null)} role="presentation">
          <div className="stf-products__panel" onClick={(e) => e.stopPropagation()} role="dialog">
            <header style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              {detail.imgSrc && (
                <img src={detail.imgSrc} alt="" style={{ width: "48px", height: "48px", borderRadius: "8px", objectFit: "cover" }} />
              )}
              <div>
                <h3 style={{ margin: 0 }}>{detail.nameText || detail.name}</h3>
                <span style={{ fontSize: "12px", color: "#64748b" }}>{detail.categoryText}</span>
              </div>
              <button type="button" onClick={() => setDetail(null)} style={{ marginLeft: "auto" }}>✕</button>
            </header>
            <dl style={{ marginTop: "16px" }}>
              <dt>Mã SP</dt><dd><code>{detail.id}</code></dd>
              <dt>Seller</dt><dd>{detail.sellerText || detail.seller}</dd>
              <dt>Danh mục</dt><dd>{detail.categoryText || detail.category}</dd>
              <dt>Thương hiệu</dt><dd>{detail.brand || "—"}</dd>
              <dt>Giá</dt><dd>{detail.priceFormatted || detail.price}</dd>
              <dt>Tồn kho</dt><dd style={{ fontWeight: 700, color: detail.stockVal === 0 ? "#d32f2f" : "#2e7d32" }}>{detail.stockVal ?? detail.quantity}</dd>
              <dt>Trạng thái</dt><dd>{detail.statusLabel || detail.status}</dd>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffProducts;
