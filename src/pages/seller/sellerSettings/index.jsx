import SellerSidebar from "../../../components/sellerSidebar";
import SellerHeader from "../../../components/sellerHeader";
import "./index.scss";

function SellerSettings() {
  return (
    <div className="seller-layout">
      <SellerSidebar />

      <div className="seller-content">
        <SellerHeader />

        <div className="settings-page">
          <h2>Cài đặt</h2>

          <div className="setting-card">
            <label>
              Ngôn ngữ
            </label>

            <select>
              <option>Tiếng Việt</option>
              <option>English</option>
            </select>
          </div>

          <div className="setting-card">
            <label>
              Nhận Email Thông Báo
            </label>

            <input type="checkbox" />
          </div>

          <button>
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}

export default SellerSettings;