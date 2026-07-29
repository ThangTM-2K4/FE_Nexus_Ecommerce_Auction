import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import {
  REGISTER_TERMS_SECTIONS,
  REGISTER_TERMS_UPDATED_AT,
} from '../../../data/registerTerms';
import './index.scss';

// Trang Điều khoản & Điều kiện sử dụng — hiện khi người dùng bấm vào liên kết
// điều khoản ở trang Đăng ký. Đây là trang công khai (không cần đăng nhập).
export default function TermsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Mở trong CÙNG tab (link điều khoản không còn dùng target="_blank"), nên
  // navigate(-1) quay lại ĐÚNG trang trước đó (đăng ký/đăng nhập) — giữ nguyên
  // đường link cũ thay vì nhảy sang một trang đăng ký mới. Nếu không có lịch sử
  // (mở trực tiếp bằng URL) thì về nơi được truyền qua state, mặc định /register.
  const fallback = location.state?.from || '/register';
  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate(fallback);
  };

  return (
    <div className="terms-page">
      <div className="terms-card">
        <button type="button" className="terms-back" onClick={goBack}>
          <FaArrowLeft /> Quay lại
        </button>

        <header className="terms-head">
          <h1>Điều khoản &amp; Điều kiện sử dụng</h1>
          <p className="terms-subtitle">
            Vui lòng đọc kỹ các điều khoản dưới đây trước khi tạo tài khoản. Việc
            đăng ký và sử dụng nền tảng đồng nghĩa với việc bạn đồng ý tuân thủ
            toàn bộ các quy định này.
          </p>
          <span className="terms-updated">
            Cập nhật lần cuối: {REGISTER_TERMS_UPDATED_AT}
          </span>
        </header>

        <div className="terms-body">
          {REGISTER_TERMS_SECTIONS.map((section) => (
            <section key={section.title} className="terms-section">
              <h2>{section.title}</h2>
              {section.intro && <p>{section.intro}</p>}
              <ul>
                {section.items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
              {section.outro && <p className="terms-outro">{section.outro}</p>}
            </section>
          ))}
        </div>

        <div className="terms-footer">
          <button type="button" className="terms-primary-btn" onClick={goBack}>
            Tôi đã đọc — Quay lại
          </button>
        </div>
      </div>
    </div>
  );
}
