import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../../components/sellerdashboard/sellerPageHeader";
import MiniStat from "../../../components/sellerdashboard/sellerMiniStat";
import { useAuth } from "../../../context/AuthContext";
import { getMyEcommerceProducts } from "../../../services/ecommerceProductService";
import { productCategories } from "../../../data/auctionMockData";
import { getCategories, getCategoryLabel } from "../../../services/categoryService";

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
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategories().then((res) => {
      if (res?.ok) setCategories(res.items || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getMyEcommerceProducts()
      .then((res) => setMyProducts(res.items || []))
      .catch(() => setMyProducts([]))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const stats = useMemo(() => {
    const total = myProducts.length;
    const active = myProducts.filter((p) => p.status === "APPROVED").length;
    const outOfStock = myProducts.filter((p) => Number(p.stock) === 0).length;
    const pending = myProducts.filter((p) => p.status === "PENDING").length;
    const draftOrRejected = myProducts.filter((p) => p.status === "DRAFT" || p.status === "REJECTED").length;
    return { total, active, outOfStock, pending, draftOrRejected };
  }, [myProducts]);

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
              <Link to="/seller-hub/products/create" className="slr-btn-create" style={{ display: "inline-block" }}>
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
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {myProducts.map((p) => {
                    const category = productCategories.find((c) => c.id === p.category);
                    const categoryName = p.name || getCategoryLabel(categories, p.category) || category?.label || "Sản phẩm";
                    return (
                      <tr key={p.id}>
                        <td>
                          <div className="slr-product-thumb" style={{ width: "48px", height: "48px", overflow: "hidden", borderRadius: "6px" }}>
                            {p.images?.[0] ? <img src={p.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span>—</span>}
                          </div>
                        </td>
                        <td>
                          <strong>{categoryName}</strong>
                          {p.brand && <div style={{ fontSize: "12px", color: "#888" }}>Thương hiệu: {p.brand}</div>}
                        </td>
                        <td style={{ fontSize: "12px", color: "#555" }}>{p.id}</td>
                        <td style={{ fontWeight: 600, color: "#6b3ba7" }}>{Number(p.price || 0).toLocaleString("vi-VN")}đ</td>
                        <td className={Number(p.stock) === 0 ? "warn" : ""}>{p.stock}</td>
                        <td>
                          <span className={`slr-badge slr-badge--${(p.status || "DRAFT").toLowerCase()}`}>
                            {STATUS_LABELS[p.status] || p.status}
                          </span>
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
