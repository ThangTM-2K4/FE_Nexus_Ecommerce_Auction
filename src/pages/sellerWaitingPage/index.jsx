import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as sellerService from '../../services/sellerService';
import Header from '../../components/header';
import Footer from '../../components/footer';
import '../becomeSellerPage/index.scss';

export default function SellerWaitingPage() {
  const { user } = useAuth();
  const [application, setApplication] = useState(null);

  useEffect(() => {
    if (user?.id) {
      sellerService.getSellerApplication(user.id).then(setApplication);
    }
  }, [user?.id]);

  return (
    <div className="become-seller-page">
      <Header />
      <main className="become-seller-main">
        <div className="seller-status-card pending">
          <h1>Đang chờ phê duyệt</h1>
          <p>Đơn đăng ký người bán của bạn đang được xem xét. Vui lòng quay lại sau.</p>
          {application && (
            <>
              <div className="seller-status-meta">
                <div><span>Mã đơn</span><strong>{application.applicationId}</strong></div>
                <div><span>Ngày nộp</span><strong>{new Date(application.submittedAt).toLocaleString('vi-VN')}</strong></div>
              </div>
              <div className="seller-timeline">
                <h3>Tiến trình</h3>
                {application.timeline?.map((item) => (
                  <div key={item.step} className={`seller-timeline-item ${item.status}`}>
                    <span className="seller-timeline-dot" />
                    <div>
                      <strong>{item.step}</strong>
                      {item.date && <small>{new Date(item.date).toLocaleString('vi-VN')}</small>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          <Link to="/profile/become-seller" className="seller-action-btn">Xem chi tiết đơn</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
