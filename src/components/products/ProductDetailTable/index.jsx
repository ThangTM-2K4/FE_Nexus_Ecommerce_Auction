import './index.scss';

/** Bảng chi tiết SP dạng key-value */
export default function ProductDetailTable({ attributes = {} }) {
  const rows = [
    { label: 'Danh Mục', value: attributes.category, isLink: true },
    { label: 'Kho', value: attributes.stock },
    { label: 'Loại bảo hành', value: attributes.warranty },
    { label: 'Xuất xứ', value: attributes.origin },
    { label: 'Gửi từ', value: attributes.shipFrom },
  ].filter((row) => row.value);

  return (
    <section className="product-detail-table">
      <h2 className="product-detail-table__title">CHI TIẾT SẢN PHẨM</h2>
      <dl className="product-detail-table__list">
        {rows.map((row) => (
          <div key={row.label} className="product-detail-table__row">
            <dt>{row.label}</dt>
            <dd>
              {row.isLink ? (
                <a href="#" className="product-detail-table__link">
                  {row.value}
                </a>
              ) : (
                row.value
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
