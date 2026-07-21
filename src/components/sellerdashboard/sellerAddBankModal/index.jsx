import { useState } from "react";
import { toast } from "react-toastify";
import { resolveBankLabel } from "../../../services/bankService";
import { addSellerBankAccount } from "../../../services/bankAccountService";
import BankSelect from "../../common/bankSelect";
import "../sellerWithdrawModal/index.scss";
import "./index.scss";

const emptyForm = {
  type: "personal",
  bankName: "",
  bankNameCustom: "",
  accountNumber: "",
  accountHolder: "",
};

export default function SellerAddBankModal({ userId, onClose, onSuccess }) {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const resolvedBank =
    form.bankName === "other" ? form.bankNameCustom.trim() : resolveBankLabel(form.bankName);

  const validate = () => {
    const next = {};
    if (form.bankName === "other" && !form.bankNameCustom.trim()) {
      next.bankNameCustom = "Vui lòng nhập tên ngân hàng";
    }
    if (!form.accountNumber.trim()) next.accountNumber = "Vui lòng nhập số tài khoản";
    if (!form.accountHolder.trim()) next.accountHolder = "Vui lòng nhập tên chủ tài khoản";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const account = await addSellerBankAccount(userId, {
        type: form.type,
        bankName: resolvedBank,
        accountNumber: form.accountNumber.trim(),
        accountHolder: form.accountHolder.trim(),
      });
      toast.success("Đã thêm tài khoản ngân hàng");
      onSuccess?.(account);
      onClose?.();
    } catch (err) {
      toast.error(err.message || "Không thể thêm tài khoản");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="slr-withdraw-overlay" onClick={onClose} role="presentation">
      <div
        className="slr-withdraw-modal slr-add-bank-modal"
        role="dialog"
        aria-labelledby="add-bank-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="slr-withdraw-modal__header">
          <div>
            <h3 id="add-bank-title">Thêm tài khoản ngân hàng</h3>
            <p>Liên kết tài khoản doanh nghiệp hoặc cá nhân để nhận tiền rút</p>
          </div>
          <button type="button" className="slr-withdraw-modal__close" onClick={onClose} aria-label="Đóng">
            ✕
          </button>
        </header>

        <form className="slr-withdraw-modal__body slr-add-bank-form" onSubmit={handleSubmit}>
          <fieldset className="slr-withdraw-type">
            <legend>Loại tài khoản</legend>
            <div className="slr-withdraw-type__options">
              <button
                type="button"
                className={form.type === "business" ? "active" : ""}
                onClick={() => setForm((p) => ({ ...p, type: "business" }))}
              >
                <span className="slr-withdraw-type__icon">🏢</span>
                <div>
                  <strong>Doanh nghiệp</strong>
                  <small>Tài khoản công ty</small>
                </div>
              </button>
              <button
                type="button"
                className={form.type === "personal" ? "active" : ""}
                onClick={() => setForm((p) => ({ ...p, type: "personal" }))}
              >
                <span className="slr-withdraw-type__icon">👤</span>
                <div>
                  <strong>Cá nhân</strong>
                  <small>Tài khoản cá nhân</small>
                </div>
              </button>
            </div>
          </fieldset>

          <div className="slr-add-bank-field">
            <BankSelect name="bankName" value={form.bankName} onChange={handleChange} includeOther />
          </div>

          {form.bankName === "other" && (
            <div className="slr-add-bank-field">
              <label htmlFor="add-bankNameCustom">Tên ngân hàng</label>
              <input
                id="add-bankNameCustom"
                name="bankNameCustom"
                value={form.bankNameCustom}
                onChange={handleChange}
                placeholder="Nhập tên ngân hàng"
                className={errors.bankNameCustom ? "has-error" : ""}
              />
              {errors.bankNameCustom && <span className="slr-add-bank-error">{errors.bankNameCustom}</span>}
            </div>
          )}

          <div className="slr-add-bank-field">
            <label htmlFor="add-accountNumber">Số tài khoản</label>
            <input
              id="add-accountNumber"
              name="accountNumber"
              value={form.accountNumber}
              onChange={handleChange}
              placeholder="0123456789"
              inputMode="numeric"
              className={errors.accountNumber ? "has-error" : ""}
            />
            {errors.accountNumber && <span className="slr-add-bank-error">{errors.accountNumber}</span>}
          </div>

          <div className="slr-add-bank-field">
            <label htmlFor="add-accountHolder">Tên chủ tài khoản</label>
            <input
              id="add-accountHolder"
              name="accountHolder"
              value={form.accountHolder}
              onChange={handleChange}
              placeholder="NGUYEN VAN A"
              className={errors.accountHolder ? "has-error" : ""}
            />
            {errors.accountHolder && <span className="slr-add-bank-error">{errors.accountHolder}</span>}
          </div>

          <p className="slr-add-bank-hint">
            Tài khoản đăng ký khi trở thành người bán sẽ tự động hiển thị tại đây. Bạn có thể thêm tài khoản phụ nếu cần.
          </p>

          <footer className="slr-withdraw-modal__footer">
            <button type="button" className="slr-withdraw-btn slr-withdraw-btn--ghost" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="slr-withdraw-btn slr-withdraw-btn--primary" disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu tài khoản"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
