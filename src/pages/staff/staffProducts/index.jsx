import { useEffect, useMemo, useState } from "react";
import StaffPageHeader from "../../../components/staff/staffPageHeader";
import StaffKpiCard from "../../../components/staff/staffKpiCard";
import { getStaffProducts } from "../../../services/staffService";
import "./index.scss";

const STATUS_CLASS = {
  "Hoạt động": "ok",
  "Chờ duyệt": "pending",
  "Ẩn": "hidden",
};

const StaffProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    getStaffProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  const stats = useMemo(
    () => ({
      total: products.length,
      active: products.filter((p) => p.status === "Hoạt động").length,
      pending: products.filter((p) => p.status === "Chờ duyệt").length,
      sellers: new Set(products.map((p) => p.seller)).size,
    }),
    [products]
  );

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      [p.id, p.name, p.seller, p.category, p.brand].some((v) => String(v).toLowerCase().includes(q))
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
        <p className="stf-products__empty">Đang tải...</p>
      ) : (
        <div className="stf-products__table-wrap">
          <table className="stf-products__table">
            <thead>
              <tr>
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
              {shown.map((p) => (
                <tr key={p.id}>
                  <td><code>{p.id}</code></td>
                  <td><strong>{p.name}</strong></td>
                  <td>{p.seller}</td>
                  <td>{p.category}</td>
                  <td>{p.price}</td>
                  <td>{p.quantity}</td>
                  <td>
                    <span className={`stf-products__status stf-products__status--${STATUS_CLASS[p.status] || "default"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td>
                    <button type="button" className="stf-products__view" onClick={() => setDetail(p)}>Chi tiết</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detail && (
        <div className="stf-products__overlay" onClick={() => setDetail(null)} role="presentation">
          <div className="stf-products__panel" onClick={(e) => e.stopPropagation()} role="dialog">
            <header>
              <h3>{detail.name}</h3>
              <button type="button" onClick={() => setDetail(null)}>✕</button>
            </header>
            <dl>
              <dt>Mã SP</dt><dd><code>{detail.id}</code></dd>
              <dt>Seller</dt><dd>{detail.seller}</dd>
              <dt>Danh mục</dt><dd>{detail.category}</dd>
              <dt>Thương hiệu</dt><dd>{detail.brand}</dd>
              <dt>Giá</dt><dd>{detail.price}</dd>
              <dt>Tồn kho</dt><dd>{detail.quantity}</dd>
              <dt>Số ảnh</dt><dd>{detail.images}</dd>
              <dt>Ngày tạo</dt><dd>{detail.createdAt}</dd>
              <dt>Trạng thái</dt><dd>{detail.status}</dd>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffProducts;
