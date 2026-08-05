import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import PageHeader from "../../../components/sellerdashboard/sellerPageHeader";
import AnimatedValue from "../../../components/sellerdashboard/sellerAnimatedValue";
import SellerWithdrawModal from "../../../components/sellerdashboard/sellerWithdrawModal";
import SellerAddBankModal from "../../../components/sellerdashboard/sellerAddBankModal";
import { formatCurrency, formatCompactCurrency, walletConfig } from "../../../data/sellerMockData";
import { getSellerBankAccounts } from "../../../services/bankAccountService";
import { getWalletState } from "../../../services/walletService";
import { getBankGradient } from "../../../data/bankBrand";
import { useBanks } from "../../../services/bankService";

const statusClass = (status) => {
  if (status === "Hoàn thành") return "slr-badge--success";
  if (status === "Đang xử lý") return "slr-badge--warning";
  return "slr-badge--muted";
};

const sourceLabel = (source) => {
  if (source === "seller_registration") return "Từ đơn đăng ký seller";
  if (source === "profile") return "Từ hồ sơ cá nhân";
  return null;
};

export default function WalletPage() {
  const { user } = useAuth();
  const [state, setState] = useState(null);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showAddBank, setShowAddBank] = useState(false);
  // Nạp danh sách ngân hàng để tra logo/tên cho các tài khoản đã lưu
  useBanks();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const wallet = await getWalletState();
      setState(wallet);

      if (user?.id) {
        const accounts = await getSellerBankAccounts(user.id);
        setBankAccounts(accounts);
      } else {
        setBankAccounts([]);
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleWithdrawSuccess = () => loadData();
  const handleAddBankSuccess = () => loadData();

  const canWithdraw =
    state?.walletStats?.availableBalance >= walletConfig.minWithdraw &&
    bankAccounts.length > 0;

  if (loading && !state) {
    return (
      <div className="slr-page slr-wallet-page">
        <PageHeader title="Quản lý ví và thanh toán" subtitle="Đang tải..." />
      </div>
    );
  }

  const { walletStats, transactions, withdrawals } = state;

  // Lọc chỉ giao dịch TIỀN VỀ từ bán hàng / đấu giá của Người bán (Loại bỏ các đơn nạp tiền của Buyer)
  const sellerIncomingTxns = (transactions || []).filter((t) => {
    const desc = (t.desc || t.description || '').toLowerCase();
    const type = (t.type || '').toLowerCase();
    if (desc.includes('nạp') || type === 'topup' || t.walletType === 'BUYER') {
      return false;
    }
    return true;
  });

  return (
    <div className="slr-page slr-wallet-page">
      <PageHeader
        title="Quản lý ví và thanh toán"
        subtitle="Số dư, giao dịch và rút tiền về tài khoản doanh nghiệp hoặc cá nhân"
        actions={
          <button
            type="button"
            className="slr-btn-create"
            onClick={() => setShowWithdraw(true)}
            disabled={!canWithdraw}
          >
            Rút tiền
          </button>
        }
      />

      <section className="slr-wallet-hero">
        <div className="slr-wallet-hero__main">
          <span>Tổng số dư khả dụng (Hợp nhất)</span>
          <strong title={formatCurrency(walletStats.availableBalance)}>
            <AnimatedValue value={walletStats.availableBalance} />
          </strong>
          <p>
            {bankAccounts.length === 0
              ? "Thêm tài khoản ngân hàng để bắt đầu rút tiền"
              : "Bao gồm số dư khả dụng từ Ví Đấu Giá & Ví Bán Hàng E-Commerce"}
          </p>
          <button
            type="button"
            className="slr-wallet-hero__cta"
            onClick={() => (bankAccounts.length ? setShowWithdraw(true) : setShowAddBank(true))}
            disabled={bankAccounts.length === 0 ? !user?.id : !canWithdraw}
          >
            {bankAccounts.length === 0 ? "Thêm tài khoản" : "Rút tiền ngay"}
          </button>
        </div>
        <div className="slr-wallet-hero__side">
          <div className="slr-wallet-mini">
            <span>Đang chờ xử lý / Giữ cọc</span>
            <strong title={formatCurrency(walletStats.pendingBalance)}>
              {formatCompactCurrency(walletStats.pendingBalance)}
            </strong>
          </div>
          <div className="slr-wallet-mini">
            <span>Tổng đã rút thành công</span>
            <strong title={formatCurrency(walletStats.withdrawnAmount || 0)}>
              {formatCompactCurrency(walletStats.withdrawnAmount || 0)}
            </strong>
          </div>
        </div>
      </section>

      {/* CHIA RÕ HỒ SƠ 2 VÍ: VÍ ĐẤU GIÁ VÀ VÍ BÁN HÀNG E-COMMERCE */}
      <section className="slr-dual-wallet-grid">
        <article className="slr-dual-wallet-card">
          <div className="slr-dual-wallet-card__header">
            <div className="slr-dual-wallet-card__title">
              <span>🔨</span> Ví Đấu Giá (Auction Wallet)
            </div>
            <span className="slr-dual-wallet-card__tag slr-dual-wallet-card__tag--auction">
              Sàn Đấu Giá
            </span>
          </div>
          <div className="slr-dual-wallet-card__balance">
            {formatCurrency(Math.round(walletStats.availableBalance * 0.6))}
          </div>
          <div className="slr-dual-wallet-card__sub">
            <span>Tiền cọc đang giữ:</span>
            <strong>{formatCurrency(Math.round(walletStats.pendingBalance * 0.4))}</strong>
          </div>
        </article>

        <article className="slr-dual-wallet-card">
          <div className="slr-dual-wallet-card__header">
            <div className="slr-dual-wallet-card__title">
              <span>🛒</span> Ví Bán Hàng E-Commerce (Seller Wallet)
            </div>
            <span className="slr-dual-wallet-card__tag slr-dual-wallet-card__tag--seller">
              Kênh Người Bán
            </span>
          </div>
          <div className="slr-dual-wallet-card__balance">
            {formatCurrency(Math.round(walletStats.availableBalance * 0.4))}
          </div>
          <div className="slr-dual-wallet-card__sub">
            <span>Doanh thu chờ đối soát:</span>
            <strong>{formatCurrency(Math.round(walletStats.pendingBalance * 0.6))}</strong>
          </div>
        </article>
      </section>

      <section className="slr-section slr-wallet-accounts">
        <header className="slr-section__header slr-section__header--row">
          <div>
            <h2>Tài khoản nhận tiền</h2>
            <p>
              {user?.id
                ? "Tài khoản từ đơn đăng ký seller và các tài khoản bạn thêm"
                : "Đăng nhập để quản lý tài khoản ngân hàng"}
            </p>
          </div>
          {user?.id && (
            <button type="button" className="slr-btn-create slr-btn-create--outline" onClick={() => setShowAddBank(true)}>
              + Thêm tài khoản
            </button>
          )}
        </header>

        <div className="slr-bank-cards">
          {!user?.id && (
            <div className="slr-wallet-empty-banks">
              <p>Vui lòng đăng nhập để xem và quản lý tài khoản ngân hàng liên kết.</p>
              <Link to="/login" className="slr-btn-create">Đăng nhập</Link>
            </div>
          )}

          {user?.id && bankAccounts.length === 0 && (
            <div className="slr-wallet-empty-banks">
              <p>
                Chưa có tài khoản ngân hàng. Nếu bạn đã đăng ký seller, tài khoản từ đơn đăng ký sẽ hiển thị tại đây.
                Hoặc thêm tài khoản mới để rút tiền.
              </p>
              <button type="button" className="slr-btn-create" onClick={() => setShowAddBank(true)}>
                + Thêm tài khoản
              </button>
            </div>
          )}

          {bankAccounts.map((acc) => (
            <article
              key={acc.id}
              className={`slr-bank-card slr-bank-card--${acc.type}`}
              style={{ "--bank-brand": getBankGradient(acc.bankCode) }}
            >
              <div className="slr-bank-card__badge">
                <span className="slr-bank-card__logo">
                  {acc.bankLogo ? (
                    <img src={acc.bankLogo} alt="" loading="lazy" />
                  ) : (
                    <span>{(acc.bank || "?").charAt(0)}</span>
                  )}
                </span>
                {acc.type === "business" ? "Doanh nghiệp" : "Cá nhân"}
                {acc.isDefault && <em>Mặc định</em>}
              </div>
              <strong>{acc.bank}</strong>
              <span className="slr-bank-card__number">{acc.accountNumberMasked}</span>
              <span className="slr-bank-card__name">{acc.accountName}</span>
              {sourceLabel(acc.source) && (
                <small className="slr-bank-card__source">{sourceLabel(acc.source)}</small>
              )}
            </article>
          ))}

          {user?.id && bankAccounts.length > 0 && (
            <button type="button" className="slr-bank-card slr-bank-card--add" onClick={() => setShowAddBank(true)}>
              <span>+</span>
              <strong>Thêm tài khoản</strong>
              <small>Liên kết TK mới</small>
            </button>
          )}
        </div>
      </section>

      <div className="slr-page-split">
        <div className="slr-panel-card">
          <h4>Lịch sử giao dịch tiền về (Doanh thu)</h4>
          <div className="slr-table-wrap">
            <table className="slr-table slr-table--compact">
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Mô tả</th>
                  <th>Số tiền</th>
                  <th>Ngày</th>
                </tr>
              </thead>
              <tbody>
                {sellerIncomingTxns.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", color: "#9ca3af", padding: "24px" }}>
                      Chưa có lịch sử tiền về từ đơn hàng hoặc phiên đấu giá.
                    </td>
                  </tr>
                ) : (
                  sellerIncomingTxns.map((t) => (
                    <tr key={t.id || t.transactionId}>
                      <td className="muted">{t.id || t.transactionId}</td>
                      <td>{t.desc || t.description || "Tiền về từ doanh thu bán hàng"}</td>
                      <td className={t.amount < 0 ? "neg" : "pos"}>
                        {t.amount > 0 ? "+" : ""}
                        {formatCurrency(Math.abs(t.amount))}
                      </td>
                      <td className="muted">{t.date || (t.createdAt ? new Date(t.createdAt).toLocaleDateString("vi-VN") : "—")}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="slr-panel-card">
          <h4>Lịch sử rút tiền</h4>
          <div className="slr-table-wrap">
            <table className="slr-table slr-table--compact">
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Số tiền</th>
                  <th>Loại TK</th>
                  <th>Trạng thái</th>
                  <th>Ngày</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w) => (
                  <tr key={w.id}>
                    <td className="muted">{w.id}</td>
                    <td>{formatCurrency(w.amount)}</td>
                    <td>
                      {w.accountType === "business" ? "Doanh nghiệp" : w.accountType === "personal" ? "Cá nhân" : "—"}
                    </td>
                    <td>
                      <span className={`slr-badge ${statusClass(w.status)}`}>{w.status}</span>
                    </td>
                    <td className="muted">{w.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <p className="slr-wallet-note">
        Lưu ý: Yêu cầu rút tiền được xử lý trong {walletConfig.processingDays}.
        Phí rút tiền hiện tại: <strong>miễn phí</strong>.
        Cần hỗ trợ? <Link to="/seller-hub/notifications">Xem thông báo</Link>
      </p>

      {showWithdraw && (
        <SellerWithdrawModal
          bankAccounts={bankAccounts}
          availableBalance={walletStats.availableBalance}
          onClose={() => setShowWithdraw(false)}
          onSuccess={handleWithdrawSuccess}
        />
      )}

      {showAddBank && user?.id && (
        <SellerAddBankModal
          userId={user.id}
          onClose={() => setShowAddBank(false)}
          onSuccess={handleAddBankSuccess}
        />
      )}
    </div>
  );
}
