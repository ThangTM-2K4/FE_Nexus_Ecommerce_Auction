import SellerSidebar from "../../../components/sellerSidebar";
import SellerHeader from "../../../components/sellerHeader";
import "./index.scss";

function SellerWallet() {
  return (
    <>
      <SellerSidebar />

      <div className="seller-page">
        <SellerHeader />

        <div className="seller-wallet">
          <h2>Ví Người Bán</h2>

          <div className="wallet-card">
            <h3>Số dư hiện tại</h3>

            <div className="balance">
              250.000.000đ
            </div>

            <div className="wallet-actions">
              <button>Nạp tiền</button>
              <button>Rút tiền</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SellerWallet;