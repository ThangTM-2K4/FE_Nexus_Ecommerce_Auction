import PageHeader from "../../../components/seller/sellerPageHeader";
import MiniStat from "../../../components/seller/sellerMiniStat";
import { productStats, topProducts, productList } from "../../../data/sellerMockData";

export default function ProductsPage() {
  return (
    <div className="slr-page">
      <PageHeader title="Quản lý sản phẩm" subtitle="Thống kê và danh sách sản phẩm" />

      <section className="slr-section">
        <div className="slr-metrics-grid slr-metrics-grid--5">
          {[
            { label: "Tổng SP", value: productStats.total },
            { label: "Đang hoạt động", value: productStats.active },
            { label: "Hết hàng", value: productStats.outOfStock, warn: true },
            { label: "Bị khóa", value: productStats.locked },
            { label: "Chờ duyệt", value: productStats.pending },
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
                      {item.views && `${item.views.toLocaleString("vi-VN")} views`}
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
          <table className="slr-table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>SKU</th>
                <th>Giá</th>
                <th>Tồn kho</th>
                <th>Đã bán</th>
                <th>Lượt xem</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {productList.map((p) => (
                <tr key={p.sku}>
                  <td>{p.name}</td>
                  <td>{p.sku}</td>
                  <td>{p.price}</td>
                  <td className={p.stock === 0 ? "warn" : ""}>{p.stock}</td>
                  <td>{p.sold}</td>
                  <td>{p.views.toLocaleString("vi-VN")}</td>
                  <td>★ {p.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
