import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import * as sellerService from "../../../services/sellerService";
import Header from "../../../components/homepage/header";
import Footer from "../../../components/homepage/footer";
import "../becomeSellerPage/index.scss";

export default function SellerRejectedPage() {
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
        <div className="seller-status-card rejected">
          <h1>Đơn đăng ký bị từ chối</h1>
          {application && (
            <>
              <p>
                <strong>Lý do:</strong> {application.rejectionReason}
              </p>
              <p>
                <strong>Ghi chú admin:</strong> {application.adminNote}
              </p>
            </>
          )}
          <Link to="/profile/become-seller" className="seller-action-btn">
            Nộp lại đơn
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
