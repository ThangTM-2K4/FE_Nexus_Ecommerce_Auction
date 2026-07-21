import { useNavigate } from 'react-router-dom';
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

  // Trang này thường mở ở TAB MỚI (link điều khoản ở trang đăng ký dùng target="_blank"),
  // nên tab mới không có lịch sử để navigate(-1). Nếu có lịch sử thì quay lại, nếu không
  // thì về thẳng trang đăng ký để nút luôn hoạt động.
  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/register');
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
          <button type="button" className="terms-primary-btn" onClick={() => navigate('/register')}>
            Tôi đã đọc — Quay lại đăng ký
          </button>
        </div>
      </div>
    </div>
  );
}
