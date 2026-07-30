import { useNavigate } from 'react-router-dom';
import AuctionSidebarLayout from '../../../components/auction/auctionSidebarLayout';
import './index.scss';

const categories = [
  { id: 'watches', name: 'Đồng hồ', count: 124, icon: '⌚' },
  { id: 'electronics', name: 'Điện tử', count: 85, icon: '📱' },
  { id: 'collectibles', name: 'Đồ sưu tầm', count: 56, icon: '🏺' },
  { id: 'art', name: 'Nghệ thuật', count: 42, icon: '🎨' },
  { id: 'vehicles', name: 'Xe cộ', count: 18, icon: '🚗' },
  { id: 'fashion', name: 'Thời trang', count: 110, icon: '👕' },
  { id: 'jewelry', name: 'Trang sức', count: 75, icon: '💍' },
  { id: 'realestate', name: 'Bất động sản', count: 34, icon: '🏠' },
];

export default function AuctionCategoriesPage() {
  const navigate = useNavigate();

  return (
    <AuctionSidebarLayout sidebarActive="categories">
      <div className="auc-categories-page">
        <div className="auc-categories-page__header">
          <h1>Danh mục nổi bật</h1>
          <p>Khám phá hàng ngàn sản phẩm đấu giá được phân loại theo danh mục.</p>
        </div>
        
        <div className="auc-categories-page__grid">
          {categories.map(cat => (
            <div
              key={cat.id}
              className="category-card"
              onClick={() => navigate(`/auction?category=${cat.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  navigate(`/auction?category=${cat.id}`);
                }
              }}
            >
              <span className="category-card__icon">{cat.icon}</span>
              <div className="category-card__info">
                <h3>{cat.name}</h3>
                <p>{cat.count} phiên đấu giá</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AuctionSidebarLayout>
  );
}
