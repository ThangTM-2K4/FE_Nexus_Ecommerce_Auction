import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../../components/sellerdashboard/sellerPageHeader";
import MiniStat from "../../../components/sellerdashboard/sellerMiniStat";
import { useAuth } from "../../../context/AuthContext";
import { getMyEcommerceProducts } from "../../../services/ecommerceProductService";
import { productCategories } from "../../../data/auctionMockData";
import { productStats, topProducts, productList } from "../../../data/sellerMockData";

const STATUS_LABELS = {
  DRAFT: "Đang ẩn",
  PENDING: "Chờ duyệt",
  APPROVED: "Đang bán",
  REJECTED: "Bị từ chối",
};

export default function ProductsPage() {
  const { user } = useAuth();
  const [myProducts, setMyProducts] = useState([]);

  useEffect(() => {
    if (!user?.id) return;
    getMyEcommerceProducts()
      .then((res) => setMyProducts(res.items || []))
      .catch(() => setMyProducts([]));
  }, [user?.id]);

  const pendingCount = myProducts.filter((p) => p.status === "PENDING").length;

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
            { label: "Tổng SP", value: productStats.total + myProducts.length },
            { label: "Đang hoạt động", value: productStats.active },
            { label: "Hết hàng", value: productStats.outOfStock, warn: true },
            { label: "Bị khóa", value: productStats.locked },
            { label: "Chờ duyệt", value: productStats.pending + pendingCount },
          ].map((s, i) => (
            <MiniStat key={s.label} {...s} delay={i * 60} />
          ))}
        </div>

        <div className="slr-top-grid">
          {[
            { title: "Bán chạy nhất", data: topProducts.bestSelling },
            { title: "Xem nhiều nhất", data: topProducts.mostViewed },
            { title: "Lợi nhuận cao", data: topProducts.highestProfit },
            { title: "Yêu thích nhất", data: topProducts.mostFavorited },
          ].map((col) => (
            <div key={col.title} className="slr-top-card">
              <h4>{col.title}</h4>
              <ul>
                {col.data.map((item) => (
                  <li key={item.name}>
                    <strong>{item.name}</strong>
                    <span>
                      {item.sold && `${item.sold} đã bán`}
                      {item.views && `${item.views.toLocaleString("vi-VN")} lượt xem`}
                      {item.profit && `${item.profit} (${item.margin})`}
                      {item.favorites && `${item.favorites} yêu thích`}
                      {item.revenue && item.revenue}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="slr-panel-card">
          <h4>Danh sách sản phẩm</h4>
          <div className="slr-table-wrap">
            <table className="slr-table">
              <thead>
                <tr>
                  <th>Ảnh</th>
                  <th>Sản phẩm</th>
                  <th>SKU</th>
                  <th>Giá</th>
                  <th>Tồn kho</th>
                  <th>Đã bán</th>
                  <th>Lượt xem</th>
                  <th>Đánh giá</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {myProducts.map((p) => {
                  const category = productCategories.find((c) => c.id === p.category);
                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="slr-product-thumb">
                          {p.images?.[0] ? <img src={p.images[0]} alt="" /> : <span>—</span>}
                        </div>
                      </td>
                      <td>{p.name || category?.label || "Sản phẩm mới"}</td>
                      <td>{p.id}</td>
                      <td>{Number(p.price || 0).toLocaleString("vi-VN")}đ</td>
                      <td className={p.stock === 0 ? "warn" : ""}>{p.stock}</td>
                      <td>0</td>
                      <td>0</td>
                      <td>—</td>
                      <td>{STATUS_LABELS[p.status] || p.status}</td>
                    </tr>
                  );
                })}
                {productList.map((p) => (
                  <tr key={p.sku}>
                    <td>
                      <div className="slr-product-thumb">
                        <span>—</span>
                      </div>
                    </td>
                    <td>{p.name}</td>
                    <td>{p.sku}</td>
                    <td>{p.price}</td>
                    <td className={p.stock === 0 ? "warn" : ""}>{p.stock}</td>
                    <td>{p.sold}</td>
                    <td>{p.views.toLocaleString("vi-VN")}</td>
                    <td>★ {p.rating}</td>
                    <td>Đang bán</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
