import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserPlus, FaSearchLocation, FaGavel, FaShieldAlt, FaArrowRight,
  FaChevronDown, FaQuestionCircle, FaCheckCircle, FaLock, FaCreditCard, FaRegSmile
} from "react-icons/fa";
import "./index.scss";

const steps = [
  {
    num: "01",
    icon: <FaUserPlus />,
    title: "Đăng ký & Xác thực danh tính",
    subtitle: "Nhanh chóng & Bảo mật",
    desc: "Tạo tài khoản miễn phí bằng Email hoặc Số điện thoại. Xác thực CMND/CCCD để kích hoạt hạn mức đấu giá không giới hạn và bảo vệ quyền lợi cá nhân.",
    tags: ["Miễn phí 100%", "Xác thực OTP", "Bảo mật SSL"],
    cta: "Đăng ký ngay",
    ctaLink: "/register",
  },
  {
    num: "02",
    icon: <FaSearchLocation />,
    title: "Khám phá & Chọn sản phẩm",
    subtitle: "Hàng ngàn vật phẩm xa xỉ",
    desc: "Tìm kiếm sản phẩm yêu thích qua bộ lọc thông minh: Danh mục, mức giá, địa điểm, thời gian kết thúc. Xem chi tiết thông số và hồ sơ thẩm định uy tín.",
    tags: ["Đồng hồ hiệu", "Trang sức", "Xe sang", "Bất động sản"],
    cta: "Xem sảnh đấu giá",
    ctaLink: "/auction/browse",
  },
  {
    num: "03",
    icon: <FaGavel />,
    title: "Đặt giá & Đấu giá tự động",
    subtitle: "Cạnh tranh minh bạch realtime",
    desc: "Đưa ra mức giá thầu mong muốn. Bạn có thể sử dụng Đấu giá tự động (Auto-bid) để hệ thống tự động thầu giúp bạn mỗi khi có người vượt giá.",
    tags: ["Realtime Socket", "Auto-Bid AI", "Thông báo tức thì"],
    cta: "Khám phá phiên hot",
    ctaLink: "/auction/browse",
  },
  {
    num: "04",
    icon: <FaShieldAlt />,
    title: "Thanh toán & Nhận hàng tận nơi",
    subtitle: "Giao hàng đảm bảo 100%",
    desc: "Khi thắng thầu, hoàn tất thanh toán qua Ví Nexus Pay trong vòng 24h. Sản phẩm sẽ được niêm phong, đóng gói cao cấp và giao tận nơi kèm giấy chứng nhận.",
    tags: ["Ví Nexus Pay", "Bảo hiểm 100%", "Đồng kiểm khi nhận"],
    cta: "Bắt đầu ngay",
    ctaLink: "/auction/browse",
  },
];

const faqs = [
  {
    q: "Tiền cọc tạm giữ (Frozen Balance) hoạt động như thế nào?",
    a: "Khi bạn tham gia đặt giá ở một phiên thầu, hệ thống sẽ tạm giữ một khoản tiền cọc nhỏ (ví dụ 10% giá trị khởi điểm) trong Ví Nexus Pay để đảm bảo tính nghiêm túc. Nếu bạn không thắng thầu, tiền cọc sẽ được hoàn lại 100% vào tài khoản ngay khi phiên kết thúc.",
  },
  {
    q: "Tính năng Đấu giá tự động (Auto-Bid) là gì?",
    a: "Auto-Bid cho phép bạn nhập mức giá tối đa bạn sẵn sàng trả. Hệ thống sẽ tự động đặt giá thầu thay bạn với bước giá tối thiểu nhỏ nhất vừa đủ để bạn luôn giữ vị trí dẫn đầu, cho tới khi đạt tới mức giá tối đa bạn đã cài đặt.",
  },
  {
    q: "Làm thế nào nếu người bán không giao đúng mô tả?",
    a: "Tất cả sản phẩm trên BidDoubleTK Auction đều được qua quy trình kiểm định của chuyên gia. Ngoài ra, tiền thanh toán của bạn được tạm giữ an toàn. Bạn có 48h đồng kiểm khi nhận hàng trước khi tiền được chuyển cho người bán.",
  },
  {
    q: "Có mất phí khi tham gia đấu giá không?",
    a: "Việc tạo tài khoản, tìm kiếm và tham gia đặt giá hoàn toàn miễn phí. Chỉ khi bạn thắng thầu thành công, phí dịch vụ sàn nhỏ sẽ được tính dựa trên giá trị thầu cuối cùng.",
  },
];

export default function AuctionHowItWorksPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="auc-how-it-works-page">
      {/* Hero Banner */}
      <div className="auc-how-hero">
        <span className="auc-how-hero__badge">
          <FaRegSmile style={{ color: "#C3A05D" }} /> Hướng dẫn đấu giá cho người mới
        </span>
        <h1>Cách Thức Hoạt Động Trên BidDoubleTK Auction</h1>
        <p>
          Hệ thống đấu giá thương mại điện tử minh bạch, an toàn và hiện đại.
          Chỉ với 4 bước đơn giản để sở hữu những vật phẩm xa xỉ giá trị nhất.
        </p>
      </div>

      {/* 4 Steps Timeline Flow */}
      <div className="auc-steps-container">
        <div className="auc-timeline-line" />

        {steps.map((step) => (
          <div key={step.num} className="auc-step-row">
            {/* Step Number Circle Indicator */}
            <div className="auc-step-indicator">
              <div className="num-circle">{step.num}</div>
              <div className="icon-badge">{step.icon}</div>
            </div>

            {/* Step Content Card */}
            <div className="auc-step-card">
              <div className="auc-step-card__header">
                <div>
                  <span className="step-sub">{step.subtitle}</span>
                  <h2>{step.title}</h2>
                </div>
                <button
                  type="button"
                  className="auc-step-card__cta"
                  onClick={() => navigate(step.ctaLink)}
                >
                  {step.cta} <FaArrowRight />
                </button>
              </div>

              <p className="auc-step-card__desc">{step.desc}</p>

              <div className="auc-step-card__tags">
                {step.tags.map((tag) => (
                  <span key={tag} className="tag-item">
                    <FaCheckCircle style={{ color: "#53ADBE" }} /> {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Guarantees Banner */}
      <div className="auc-guarantees">
        <div className="guarantee-item">
          <FaLock className="g-icon" />
          <div>
            <strong>Bảo mật 100%</strong>
            <p>Mã hóa dữ liệu cá nhân & giao dịch</p>
          </div>
        </div>
        <div className="guarantee-item">
          <FaCreditCard className="g-icon" />
          <div>
            <strong>Nexus Pay Fast</strong>
            <p>Nạp rút tức thì, minh bạch tiền cọc</p>
          </div>
        </div>
        <div className="guarantee-item">
          <FaShieldAlt className="g-icon" />
          <div>
            <strong>Đảm bảo chính hãng</strong>
            <p>Thẩm định 100% trước khi lên sàn</p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="auc-faq-section">
        <div className="faq-header">
          <h2><FaQuestionCircle style={{ color: "#C3A05D" }} /> Câu Hỏi Thường Gặp</h2>
          <p>Giải đáp thắc mắc phổ biến của người tham gia đấu giá</p>
        </div>

        <div className="faq-list">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className={`faq-item ${isOpen ? "is-open" : ""}`}>
                <button
                  type="button"
                  className="faq-question"
                  onClick={() => toggleFaq(idx)}
                >
                  <span>{faq.q}</span>
                  <FaChevronDown className="arrow-icon" />
                </button>
                {isOpen && <div className="faq-answer">{faq.a}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
