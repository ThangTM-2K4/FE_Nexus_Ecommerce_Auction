import './index.scss';

const locations = [
  { id: 'hcm', name: 'TP. Hồ Chí Minh', address: 'Tòa nhà Bitexco, Q.1', status: 'Hoạt động', img: '/images/mock/hcm.jpg' },
  { id: 'hn', name: 'Hà Nội', address: 'Lotte Center, Ba Đình', status: 'Hoạt động', img: '/images/mock/hn.jpg' },
  { id: 'dn', name: 'Đà Nẵng', address: 'Vincom Center, Ngô Quyền', status: 'Hoạt động', img: '/images/mock/dn.jpg' },
  { id: 'bd', name: 'Bình Dương', address: 'Aeon Mall, Thuận An', status: 'Bảo trì', img: '/images/mock/bd.jpg' },
];

export default function AuctionLocationsPage() {
  return (
    <div className="auc-locations-page">
      <div className="auc-locations-page__header">
        <h1>Địa điểm đấu giá</h1>
        <p>Các trung tâm giao dịch và kho lưu trữ tài sản đấu giá của BidDoubleTK trên toàn quốc.</p>
      </div>
      
      <div className="auc-locations-page__grid">
        {locations.map(loc => (
          <div key={loc.id} className="location-card">
            <div className="location-card__img">
              <div className="placeholder-img" />
              <span className={`status-badge ${loc.status === 'Hoạt động' ? 'active' : 'maintenance'}`}>
                {loc.status}
              </span>
            </div>
            <div className="location-card__info">
              <h3>{loc.name}</h3>
              <p>{loc.address}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
