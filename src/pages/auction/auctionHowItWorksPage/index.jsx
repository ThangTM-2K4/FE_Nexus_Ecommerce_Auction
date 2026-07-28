import './index.scss';

const steps = [
  { num: 1, title: 'Đăng ký tài khoản', desc: 'Tạo tài khoản và xác thực danh tính bằng số điện thoại hoặc email để bắt đầu tham gia đấu giá an toàn.' },
  { num: 2, title: 'Khám phá sản phẩm', desc: 'Tìm kiếm, lọc các sản phẩm đấu giá theo danh mục, mức giá hoặc thời gian để tìm món đồ bạn yêu thích.' },
  { num: 3, title: 'Tham gia đặt giá', desc: 'Đưa ra mức giá cao nhất trước khi thời gian kết thúc. Bạn có thể sử dụng tính năng Đấu giá tự động.' },
  { num: 4, title: 'Thanh toán & Nhận hàng', desc: 'Nếu chiến thắng, hãy hoàn tất thanh toán trong 24h. Người bán sẽ đóng gói và giao sản phẩm đến tận tay bạn.' },
];

export default function AuctionHowItWorksPage() {
  return (
    <div className="auc-how-it-works-page">
      <div className="auc-how-it-works-page__header">
        <h1>Cách thức hoạt động</h1>
        <p>Tham gia BidDoubleTK Auction thật dễ dàng chỉ với 4 bước cơ bản dưới đây.</p>
      </div>
      
      <div className="auc-how-it-works-page__steps">
        {steps.map(step => (
          <div key={step.num} className="step-card">
            <div className="step-card__num">{step.num}</div>
            <div className="step-card__content">
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
