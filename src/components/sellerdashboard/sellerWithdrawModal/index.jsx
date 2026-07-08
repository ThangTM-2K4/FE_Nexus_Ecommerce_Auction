import { useEffect, useState } from "react";
import { formatCurrency, walletConfig } from "../../../data/sellerMockData";
import { requestWithdrawal } from "../../../services/walletService";
import "./index.scss";

const parseAmount = (raw) => {
  const num = parseInt(String(raw).replace(/[^\d]/g, ""), 10);
  return Number.isNaN(num) ? 0 : num;
};

export default function SellerWithdrawModal({ bankAccounts = [], availableBalance, onClose, onSuccess }) {
  const defaultAccount =
    bankAccounts.find((a) => a.isDefault) || bankAccounts[0] || null;

  const [accountType, setAccountType] = useState(defaultAccount?.type || "personal");
  const [selectedAccountId, setSelectedAccountId] = useState(defaultAccount?.id || "");
  const [amountRaw, setAmountRaw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filteredAccounts = bankAccounts.filter((a) => a.type === accountType);
  const selectedAccount =
    filteredAccounts.find((a) => a.id === selectedAccountId) || filteredAccounts[0];
  const amount = parseAmount(amountRaw);

  useEffect(() => {
    if (filteredAccounts.length > 0 && !filteredAccounts.find((a) => a.id === selectedAccountId)) {
      setSelectedAccountId(filteredAccounts[0].id);
    }
  }, [accountType, filteredAccounts, selectedAccountId]);

  const handleTypeChange = (type) => {
    setAccountType(type);
    const first = bankAccounts.find((a) => a.type === type);
    if (first) setSelectedAccountId(first.id);
    setError("");
  };

  const handleQuickAmount = (pct) => {
    const val = Math.floor((availableBalance * pct) / 100);
    setAmountRaw(String(val));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (bankAccounts.length === 0) {
      setError("Chưa có tài khoản ngân hàng. Vui lòng thêm tài khoản trước.");
      return;
    }
    if (!selectedAccount) {
      setError("Vui lòng chọn tài khoản nhận tiền");
      return;
    }
    if (amount < walletConfig.minWithdraw) {
      setError(`Số tiền rút tối thiểu là ${formatCurrency(walletConfig.minWithdraw)}`);
      return;
    }
    if (amount > availableBalance) {
      setError("Số dư khả dụng không đủ");
      return;
    }

    setLoading(true);
    try {
      const result = await requestWithdrawal({
        amount,
        accountId: selectedAccount.id,
        accountType: selectedAccount.type,
        accountName: selectedAccount.accountName,
        bank: selectedAccount.bank,
      });
      onSuccess?.(result);
      onClose?.();
    } catch (err) {
      setError(err.message || "Không thể tạo yêu cầu rút tiền");
    } finally {
      setLoading(false);
    }
  };

  const hasBusiness = bankAccounts.some((a) => a.type === "business");
  const hasPersonal = bankAccounts.some((a) => a.type === "personal");

  return (
    <div className="slr-withdraw-overlay" onClick={onClose} role="presentation">
      <div
        className="slr-withdraw-modal"
        role="dialog"
        aria-labelledby="withdraw-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="slr-withdraw-modal__header">
          <div>
            <h3 id="withdraw-title">Rút tiền về tài khoản</h3>
            <p>Chuyển số dư khả dụng về tài khoản doanh nghiệp hoặc cá nhân đã liên kết</p>
          </div>
          <button type="button" className="slr-withdraw-modal__close" onClick={onClose} aria-label="Đóng">
            ✕
          </button>
        </header>

        <form className="slr-withdraw-modal__body" onSubmit={handleSubmit}>
          <div className="slr-withdraw-balance">
            <span>Số dư khả dụng</span>
            <strong>{formatCurrency(availableBalance)}</strong>
          </div>

          {bankAccounts.length === 0 ? (
            <p className="slr-withdraw-error">Chưa có tài khoản ngân hàng. Hãy thêm tài khoản trước khi rút tiền.</p>
          ) : (
            <>
              <fieldset className="slr-withdraw-type">
                <legend>Loại tài khoản nhận</legend>
                <div className="slr-withdraw-type__options">
                  <button
                    type="button"
                    className={accountType === "business" ? "active" : ""}
                    onClick={() => handleTypeChange("business")}
                    disabled={!hasBusiness}
                  >
                    <span className="slr-withdraw-type__icon">🏢</span>
                    <div>
                      <strong>Doanh nghiệp</strong>
                      <small>{hasBusiness ? "Tài khoản công ty" : "Chưa có TK doanh nghiệp"}</small>
                    </div>
                  </button>
                  <button
                    type="button"
                    className={accountType === "personal" ? "active" : ""}
                    onClick={() => handleTypeChange("personal")}
                    disabled={!hasPersonal}
                  >
                    <span className="slr-withdraw-type__icon">👤</span>
                    <div>
                      <strong>Cá nhân</strong>
                      <small>{hasPersonal ? "Tài khoản cá nhân" : "Chưa có TK cá nhân"}</small>
                    </div>
                  </button>
                </div>
              </fieldset>

              <div className="slr-withdraw-accounts">
                <label>Chọn tài khoản</label>
                {filteredAccounts.length === 0 ? (
                  <p className="slr-withdraw-empty">Không có tài khoản loại này. Thêm tài khoản mới hoặc chọn loại khác.</p>
                ) : (
                  filteredAccounts.map((acc) => (
                    <label
                      key={acc.id}
                      className={`slr-withdraw-account ${selectedAccount?.id === acc.id ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="bankAccount"
                        value={acc.id}
                        checked={selectedAccount?.id === acc.id}
                        onChange={() => setSelectedAccountId(acc.id)}
                      />
                      <div>
                        <strong>{acc.bank}</strong>
                        <span>{acc.accountNumberMasked} · {acc.accountName}</span>
                        {acc.source === "seller_registration" && (
                          <em>Từ đơn đăng ký seller</em>
                        )}
                      </div>
                    </label>
                  ))
                )}
              </div>
            </>
          )}

          <div className="slr-withdraw-amount">
            <label htmlFor="withdraw-amount">Số tiền rút</label>
            <div className="slr-withdraw-amount__input">
              <input
                id="withdraw-amount"
                type="text"
                inputMode="numeric"
                placeholder="Nhập số tiền"
                value={amountRaw ? formatCurrency(parseAmount(amountRaw)).replace("đ", "") : ""}
                onChange={(e) => setAmountRaw(e.target.value.replace(/[^\d]/g, ""))}
                disabled={bankAccounts.length === 0}
              />
              <span>đ</span>
            </div>
            <div className="slr-withdraw-amount__quick">
              <button type="button" onClick={() => handleQuickAmount(25)} disabled={bankAccounts.length === 0}>25%</button>
              <button type="button" onClick={() => handleQuickAmount(50)} disabled={bankAccounts.length === 0}>50%</button>
              <button type="button" onClick={() => handleQuickAmount(75)} disabled={bankAccounts.length === 0}>75%</button>
              <button type="button" onClick={() => handleQuickAmount(100)} disabled={bankAccounts.length === 0}>Tối đa</button>
            </div>
          </div>

          <ul className="slr-withdraw-info">
            <li>Phí rút tiền: <strong>Miễn phí</strong></li>
            <li>Thời gian xử lý: <strong>{walletConfig.processingDays}</strong></li>
            <li>Tối thiểu: <strong>{formatCurrency(walletConfig.minWithdraw)}</strong></li>
          </ul>

          {error && <p className="slr-withdraw-error">{error}</p>}

          <footer className="slr-withdraw-modal__footer">
            <button type="button" className="slr-withdraw-btn slr-withdraw-btn--ghost" onClick={onClose}>
              Hủy
            </button>
            <button
              type="submit"
              className="slr-withdraw-btn slr-withdraw-btn--primary"
              disabled={loading || bankAccounts.length === 0}
            >
              {loading ? "Đang xử lý..." : "Xác nhận rút tiền"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
