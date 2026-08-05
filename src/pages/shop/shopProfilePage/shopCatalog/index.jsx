import ProductCard from '../../../../components/homepage/productCard';
import Select from '../../../../components/common/select';
import ShopPagination from '../shopPagination';
import './index.scss';

const SORT_OPTIONS = [
  { key: 'popular', label: 'Phổ Biến' },
  { key: 'newest', label: 'Mới Nhất' },
  { key: 'bestselling', label: 'Bán Chạy' },
];

const PRICE_OPTIONS = [
  { value: 'all', label: 'Tất Cả' },
  { value: 'price-asc', label: 'Giá: Thấp → Cao' },
  { value: 'price-desc', label: 'Giá: Cao → Thấp' },
  { value: 'under-200k', label: 'Dưới 200.000₫' },
  { value: '200k-500k', label: '200.000₫ - 500.000₫' },
  { value: '500k-1m', label: '500.000₫ - 1.000.000₫' },
  { value: 'over-1m', label: 'Trên 1.000.000₫' },
];

export default function ShopCatalog({
  categories,
  activeCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  priceFilter,
  onPriceChange,
  products,
  page,
  totalPages,
  onPageChange,
  onProductClick,
}) {
  return (
    <section className="shop-catalog" aria-label="Danh mục sản phẩm shop">
      <aside className="shop-catalog__sidebar">
        <h2 className="shop-catalog__sidebar-title">Danh Mục</h2>
        <ul className="shop-catalog__category-list">
          <li>
            <button
              type="button"
              className={`shop-catalog__category ${!activeCategory ? 'is-active' : ''}`}
              onClick={() => onCategoryChange(null)}
            >
              Tất Cả Sản Phẩm
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                type="button"
                className={`shop-catalog__category ${
                  activeCategory === cat.id ? 'is-active' : ''
                }`}
                onClick={() => onCategoryChange(cat.id)}
              >
                {cat.label}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className="shop-catalog__main">
        <div className="shop-catalog__toolbar">
          <div className="shop-catalog__sort">
            <span className="shop-catalog__sort-label">Sắp Xếp Theo</span>
            <div className="shop-catalog__sort-pills" role="group" aria-label="Sắp xếp sản phẩm">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  className={`shop-catalog__sort-pill ${
                    sortBy === opt.key ? 'is-active' : ''
                  }`}
                  onClick={() => onSortChange(opt.key)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="shop-catalog__toolbar-right">
            <div className="shop-catalog__price-select">
              <Select
                name="priceFilter"
                value={priceFilter}
                onChange={(e) => onPriceChange(e.target.value)}
                options={PRICE_OPTIONS}
                placeholder="Giá"
              />
            </div>
            <ShopPagination
              variant="compact"
              page={page}
              totalPages={totalPages}
              onChange={onPageChange}
            />
          </div>
        </div>

        {products.length === 0 ? (
          <p className="shop-catalog__empty">Không có sản phẩm phù hợp.</p>
        ) : (
          <div className="shop-catalog__grid">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} onClick={onProductClick} />
            ))}
          </div>
        )}

        <ShopPagination
          variant="full"
          page={page}
          totalPages={totalPages}
          onChange={onPageChange}
        />
      </div>
    </section>
  );
}
