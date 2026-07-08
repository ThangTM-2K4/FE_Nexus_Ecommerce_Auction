import { Link } from "react-router-dom";

export default function SellerStockAlert({
  count,
  title,
  items,
  linkLabel = "Xem",
  href = "/seller-hub/products",
}) {
  if (!count) return null;

  return (
    <aside className="slr-stock-alert" aria-label="Cảnh báo tồn kho">
      <span className="slr-stock-alert__badge">{count}</span>
      <div>
        <strong>{title}</strong>
        {items ? (
          <ul>
            {items.slice(0, 3).map((item) => (
              <li key={item.sku}>
                {item.name} — còn {item.stock}
              </li>
            ))}
          </ul>
        ) : (
          <p>{count} sản phẩm cần nhập thêm</p>
        )}
      </div>
      <Link to={href}>{linkLabel}</Link>
    </aside>
  );
}
