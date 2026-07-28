import './index.scss';

const categories = [
  { id: 1, name: 'Đồng hồ', count: 124, icon: '⌚' },
  { id: 2, name: 'Điện tử', count: 85, icon: '📱' },
  { id: 3, name: 'Đồ sưu tầm', count: 56, icon: '🏺' },
  { id: 4, name: 'Nghệ thuật', count: 42, icon: '🎨' },
  { id: 5, name: 'Xe cộ', count: 18, icon: '🚗' },
  { id: 6, name: 'Thời trang', count: 110, icon: '👕' },
  { id: 7, name: 'Trang sức', count: 75, icon: '💍' },
  { id: 8, name: 'Nhà cửa', count: 34, icon: '🏠' },
];

export default function AuctionCategoriesPage() {
  return (
    <div className="auc-categories-page">
      <div className="auc-categories-page__header">
        <h1>Danh mục nổi bật</h1>
        <p>Khám phá hàng ngàn sản phẩm đấu giá được phân loại theo danh mục.</p>
      </div>
      
      <div className="auc-categories-page__grid">
        {categories.map(cat => (
          <div key={cat.id} className="category-card">
            <span className="category-card__icon">{cat.icon}</span>
            <div className="category-card__info">
              <h3>{cat.name}</h3>
              <p>{cat.count} phiên đấu giá</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
