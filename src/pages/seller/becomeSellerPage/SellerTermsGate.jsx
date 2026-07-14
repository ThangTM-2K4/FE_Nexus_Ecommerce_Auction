import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../../components/homepage/header";
import Footer from "../../../components/homepage/footer";

// Nội dung điều khoản đăng ký Người bán, tách theo từng điều để dễ đọc.
const TERMS_SECTIONS = [
  {
    title: "1. Điều kiện đăng ký",
    intro: "Để trở thành Người bán, bạn cần đáp ứng các điều kiện sau:",
    items: [
      "Đã có tài khoản trên hệ thống.",
      "Đã xác thực địa chỉ email.",
      "Đã xác thực số điện thoại (nếu hệ thống yêu cầu).",
      "Cung cấp đầy đủ và chính xác thông tin cá nhân hoặc thông tin doanh nghiệp.",
      "Cung cấp giấy tờ xác minh danh tính theo yêu cầu của hệ thống (ví dụ: Căn cước công dân hoặc Giấy phép kinh doanh đối với doanh nghiệp).",
      "Có tài khoản ngân hàng hợp lệ để nhận thanh toán.",
    ],
    outro:
      "Mọi thông tin cung cấp phải trung thực, chính xác và thuộc quyền sở hữu hợp pháp của người đăng ký.",
  },
  {
    title: "2. Xét duyệt hồ sơ",
    intro: "Sau khi gửi đơn đăng ký:",
    items: [
      "Hồ sơ sẽ được bộ phận quản trị hoặc nhân viên phụ trách xem xét.",
      "Thời gian xét duyệt có thể thay đổi tùy theo số lượng hồ sơ và mức độ đầy đủ của thông tin.",
      "Trong quá trình xét duyệt, hệ thống có quyền yêu cầu bổ sung hoặc cập nhật thông tin.",
      "Chỉ những tài khoản được phê duyệt mới được phép đăng sản phẩm và tạo phiên đấu giá.",
    ],
    outro: "Việc gửi hồ sơ không đồng nghĩa với việc chắc chắn được chấp thuận.",
  },
  {
    title: "3. Cam kết của Người bán",
    intro: "Người bán cam kết:",
    items: [
      "Chỉ đăng bán các sản phẩm thuộc quyền sở hữu hợp pháp.",
      "Không đăng bán hàng giả, hàng nhái, hàng cấm hoặc hàng vi phạm pháp luật.",
      "Không đăng tải nội dung sai sự thật, gây hiểu nhầm hoặc lừa đảo người mua.",
      "Cung cấp đầy đủ thông tin về sản phẩm bao gồm hình ảnh, mô tả, tình trạng và các thông tin liên quan.",
      "Thực hiện đúng nghĩa vụ giao hàng sau khi phiên đấu giá kết thúc thành công.",
      "Chịu trách nhiệm về tính hợp pháp của sản phẩm và mọi giao dịch được thực hiện từ tài khoản của mình.",
    ],
  },
  {
    title: "4. Quy định về phiên đấu giá",
    intro: "Người bán phải đảm bảo:",
    items: [
      "Thông tin phiên đấu giá được tạo chính xác và đầy đủ.",
      "Giá khởi điểm, thời gian đấu giá và các điều kiện đấu giá được thiết lập minh bạch.",
      "Không tự ý thao túng kết quả đấu giá hoặc sử dụng tài khoản khác để tăng giá giả.",
      "Không hủy phiên đấu giá khi không có lý do chính đáng.",
      "Không thực hiện các hành vi gây ảnh hưởng đến tính công bằng của hệ thống.",
    ],
    outro: "Mọi hành vi gian lận sẽ bị xử lý theo quy định của nền tảng.",
  },
  {
    title: "5. Quy định về giao dịch",
    intro: "Sau khi phiên đấu giá kết thúc:",
    items: [
      "Người bán có trách nhiệm liên hệ và hoàn tất giao dịch với người chiến thắng.",
      "Đảm bảo giao đúng sản phẩm đã đăng bán.",
      "Đảm bảo chất lượng sản phẩm phù hợp với mô tả.",
      "Hợp tác giải quyết các khiếu nại phát sinh trong quá trình giao dịch.",
    ],
  },
  {
    title: "6. Quy định về thông tin cá nhân",
    intro: "Người bán đồng ý rằng:",
    items: [
      "Thông tin đăng ký có thể được sử dụng cho mục đích xác minh danh tính.",
      "Hệ thống có quyền lưu trữ thông tin theo quy định của pháp luật.",
      "Thông tin cá nhân sẽ được bảo mật và chỉ được sử dụng cho các mục đích vận hành, xác minh và hỗ trợ giao dịch theo Chính sách bảo mật của nền tảng.",
    ],
  },
  {
    title: "7. Các hành vi bị nghiêm cấm",
    intro: "Người bán không được phép:",
    items: [
      "Đăng bán hàng hóa bị pháp luật cấm.",
      "Đăng bán hàng giả, hàng nhái hoặc hàng vi phạm quyền sở hữu trí tuệ.",
      "Giả mạo thông tin cá nhân hoặc doanh nghiệp.",
      "Sử dụng nhiều tài khoản nhằm thao túng kết quả đấu giá.",
      "Tạo giao dịch giả hoặc thông đồng với người mua để gian lận.",
      "Quấy rối, đe dọa hoặc xúc phạm người dùng khác.",
      "Phát tán mã độc, thư rác hoặc các nội dung gây ảnh hưởng đến hệ thống.",
      "Thực hiện bất kỳ hành vi nào làm ảnh hưởng đến tính ổn định, an toàn và minh bạch của nền tảng.",
    ],
  },
  {
    title: "8. Quyền của nền tảng",
    intro: "Nền tảng có quyền:",
    items: [
      "Từ chối hoặc hủy yêu cầu đăng ký Seller nếu hồ sơ không đáp ứng điều kiện.",
      "Yêu cầu bổ sung thông tin xác minh bất cứ lúc nào.",
      "Tạm khóa hoặc khóa vĩnh viễn tài khoản nếu phát hiện hành vi vi phạm.",
      "Gỡ bỏ sản phẩm hoặc phiên đấu giá không phù hợp với quy định.",
      "Tạm dừng hoặc hạn chế quyền sử dụng của Người bán nhằm bảo vệ người mua và hệ thống.",
    ],
  },
  {
    title: "9. Chấm dứt quyền Người bán",
    intro: "Quyền Seller có thể bị đình chỉ hoặc chấm dứt trong các trường hợp sau:",
    items: [
      "Cung cấp thông tin sai sự thật.",
      "Gian lận trong đấu giá hoặc giao dịch.",
      "Vi phạm nhiều lần các quy định của hệ thống.",
      "Có hành vi gây thiệt hại đến người mua hoặc uy tín của nền tảng.",
      "Không hợp tác trong quá trình xác minh hoặc giải quyết khiếu nại.",
    ],
    outro:
      "Việc khóa tài khoản không làm miễn trừ các trách nhiệm phát sinh trước thời điểm khóa tài khoản.",
  },
  {
    title: "10. Đồng ý điều khoản",
    intro:
      'Bằng việc đánh dấu vào ô "Tôi đã đọc, hiểu và đồng ý với Điều khoản và Điều kiện trở thành Người bán" và gửi hồ sơ đăng ký, bạn xác nhận rằng:',
    items: [
      "Bạn đã đọc và hiểu toàn bộ các điều khoản trên.",
      "Mọi thông tin cung cấp là trung thực và chính xác.",
      "Bạn đồng ý tuân thủ mọi quy định của nền tảng trong suốt quá trình hoạt động với tư cách Người bán.",
      "Bạn chấp nhận rằng nền tảng có quyền từ chối hoặc thu hồi quyền Seller nếu phát hiện bất kỳ hành vi vi phạm nào.",
    ],
  },
];

export default function SellerTermsGate({ onAgree }) {
  const [checked, setChecked] = useState(false);
  const [scrolledToEnd, setScrolledToEnd] = useState(false);

  const handleScroll = (e) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 24) {
      setScrolledToEnd(true);
    }
  };

  return (
    <div className="become-seller-page">
      <Header />
      <main className="become-seller-main">
        <div className="seller-card seller-terms-card">
          <Link to="/profile" className="seller-back">
            ← Quay lại hồ sơ
          </Link>

          <h1>Điều khoản &amp; Điều kiện đăng ký trở thành Người bán</h1>
          <p className="subtitle">
            Vui lòng đọc kỹ các điều khoản dưới đây. Việc gửi đơn đăng ký đồng
            nghĩa với việc bạn xác nhận đã đọc, hiểu và đồng ý tuân thủ toàn bộ
            các quy định của nền tảng.
          </p>

          <div className="seller-terms-body" onScroll={handleScroll}>
            {TERMS_SECTIONS.map((section) => (
              <section key={section.title} className="seller-terms-section">
                <h2>{section.title}</h2>
                {section.intro && <p>{section.intro}</p>}
                <ul>
                  {section.items.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
                {section.outro && <p className="seller-terms-outro">{section.outro}</p>}
              </section>
            ))}

            <p className="seller-terms-note">
              <strong>Lưu ý:</strong> Việc không tuân thủ các điều khoản trên có
              thể dẫn đến việc từ chối hồ sơ đăng ký, tạm khóa hoặc khóa vĩnh
              viễn tài khoản người bán, đồng thời nền tảng có quyền thực hiện các
              biện pháp cần thiết theo quy định của pháp luật để bảo vệ quyền lợi
              của người dùng và hệ thống.
            </p>
          </div>

          <label className={`seller-terms-agree ${!scrolledToEnd ? "disabled" : ""}`}>
            <input
              type="checkbox"
              checked={checked}
              disabled={!scrolledToEnd}
              onChange={(e) => setChecked(e.target.checked)}
            />
            <span>
              Tôi đã đọc, hiểu và đồng ý với Điều khoản và Điều kiện trở thành
              Người bán.
            </span>
          </label>
          {!scrolledToEnd && (
            <small className="seller-terms-hint">
              Vui lòng cuộn xuống đọc hết điều khoản để tiếp tục.
            </small>
          )}

          <div className="seller-wizard-nav">
            <Link to="/profile" className="seller-nav-btn outline">
              Hủy
            </Link>
            <button
              type="button"
              className="seller-submit-btn"
              disabled={!checked}
              onClick={onAgree}
            >
              Đồng ý &amp; Tiếp tục
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
