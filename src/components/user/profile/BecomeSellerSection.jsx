import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { checkSellerPreconditions } from '../../../services/sellerService';
import * as reputationService from '../../../services/reputationService';

export default function BecomeSellerSection({ profile, application }) {
  const { user, isApprovedSeller } = useAuth();
  const checks = checkSellerPreconditions(profile);
  const allMet = checks.emailVerified && checks.phoneVerified && checks.bankAccountAdded;
  const [buyerScore, setBuyerScore] = useState(0);
  const [scoreLoading, setScoreLoading] = useState(true);

  useEffect(() => {
    if (!user?.id || !profile) return;
    reputationService.getUserReputation(user.id, profile, user.sellerStatus).then((data) => {
      setBuyerScore(data.buyerProfile.score);
      setScoreLoading(false);
    });
  }, [user?.id, profile, user?.sellerStatus]);

  const canApply = reputationService.canApplySeller(buyerScore);
  const preconditionsOk = allMet && canApply;

  if (isApprovedSeller) {
    return (
      <section className="profile-section" id="become-seller">
        <div className="profile-section-header">
          <h2>Người bán</h2>
        </div>
        <div className="profile-seller-approved">
          <span className="profile-badge verified">✓ Người bán đã được phê duyệt</span>
          <p>Bạn có thể truy cập Seller Dashboard để quản lý cửa hàng và phiên đấu giá.</p>
          <Link to="/seller" className="profile-btn profile-btn--primary">Mở Seller Dashboard</Link>
        </div>
      </section>
    );
  }

  if (user?.sellerStatus === 'PENDING' && application) {
    return (
      <section className="profile-section" id="become-seller">
        <div className="profile-section-header">
          <h2>Đăng ký người bán</h2>
        </div>
        <div className="profile-seller-pending">
          <span className="profile-badge pending">⏳ Đang chờ duyệt</span>
          <p>Mã đơn: <strong>{application.applicationId}</strong></p>
          <p>Ngày nộp: {new Date(application.submittedAt).toLocaleString('vi-VN')}</p>
          <Link to="/profile/become-seller" className="profile-btn profile-btn--outline">Xem chi tiết đơn</Link>
        </div>
      </section>
    );
  }

  if (user?.sellerStatus === 'REJECTED' && application) {
    return (
      <section className="profile-section" id="become-seller">
        <div className="profile-section-header">
          <h2>Đăng ký người bán</h2>
        </div>
        <div className="profile-seller-rejected">
          <span className="profile-badge rejected">✕ Bị từ chối</span>
          <p><strong>Lý do:</strong> {application.rejectionReason}</p>
          <p><strong>Ghi chú admin:</strong> {application.adminNote}</p>
          <Link to="/profile/become-seller" className="profile-btn profile-btn--primary">Nộp lại đơn</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="profile-section" id="become-seller">
      <div className="profile-section-header">
        <h2>Trở thành Người bán</h2>
      </div>

      {!scoreLoading && !canApply && (
        <div className="profile-warning-card">
          ⚠ Cần ít nhất 50 điểm uy tín Người mua (hiện tại: {buyerScore} điểm)
        </div>
      )}

      {!allMet && (
        <div className="profile-precondition-warnings">
          {!checks.emailVerified && (
            <div className="profile-warning-card">⚠ Email chưa được xác minh</div>
          )}
          {!checks.phoneVerified && (
            <div className="profile-warning-card">⚠ Số điện thoại chưa được xác minh</div>
          )}
          {!checks.bankAccountAdded && (
            <div className="profile-warning-card">⚠ Chưa thêm tài khoản ngân hàng</div>
          )}
        </div>
      )}

      <p className="profile-seller-desc">
        Mở cửa hàng trên Shop Auction, tạo phiên đấu giá và bán sản phẩm cho hàng triệu người mua.
      </p>

      <Link
        to="/profile/become-seller"
        className={`profile-btn profile-btn--primary ${!preconditionsOk ? 'disabled' : ''}`}
        aria-disabled={!preconditionsOk}
        onClick={(e) => { if (!preconditionsOk) e.preventDefault(); }}
      >
        Đăng ký trở thành Người bán
      </Link>
    </section>
  );
}
