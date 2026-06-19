import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCloudUploadAlt,
  FaTimes,
  FaCrown,
  FaShieldAlt,
  FaBolt,
  FaUsers,
} from "react-icons/fa";
import { toast } from "react-toastify";
import AuctionLayout from "../../../components/auction/auctionLayout";
import AuctionImage from "../../../components/auction/auctionImage";
import { productCategories } from "../../../data/auctionMockData";
import { auctionImages } from "../../../data/auctionImages";
import "./index.scss";

const initialForm = {
  title: "",
  category: "",
  brand: "",
  condition: "",
  description: "",
  startPrice: "",
  reservePrice: "",
  bidIncrement: "",
  startDate: "",
  endDate: "",
  agreeRules: false,
};

export default function AuctionCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(initialForm);
  const [previews, setPreviews] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (previews.length + files.length > 5) {
      toast.error("Tối đa 5 ảnh sản phẩm");
      return;
    }

    const newPreviews = files.map((file) => ({
      id: `${file.name}-${Date.now()}`,
      url: URL.createObjectURL(file),
      name: file.name,
    }));

    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (id) => {
    setPreviews((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((p) => p.id !== id);
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Vui lòng nhập tên sản phẩm";
    if (!formData.category) newErrors.category = "Vui lòng chọn danh mục";
    if (!formData.brand.trim()) newErrors.brand = "Vui lòng nhập thương hiệu";
    if (!formData.condition) newErrors.condition = "Vui lòng chọn tình trạng";
    if (!formData.description.trim()) {
      newErrors.description = "Vui lòng nhập mô tả sản phẩm";
    }
    if (!formData.startPrice.trim()) {
      newErrors.startPrice = "Vui lòng nhập giá khởi điểm";
    } else if (Number(formData.startPrice) <= 0) {
      newErrors.startPrice = "Giá khởi điểm phải lớn hơn 0";
    }
    if (!formData.bidIncrement.trim()) {
      newErrors.bidIncrement = "Vui lòng nhập bước giá";
    }
    if (!formData.startDate) newErrors.startDate = "Vui lòng chọn ngày bắt đầu";
    if (!formData.endDate) newErrors.endDate = "Vui lòng chọn ngày kết thúc";
    if (
      formData.startDate &&
      formData.endDate &&
      formData.endDate <= formData.startDate
    ) {
      newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
    }
    if (previews.length === 0) {
      newErrors.images = "Vui lòng tải lên ít nhất 1 ảnh";
    }
    if (!formData.agreeRules) {
      newErrors.agreeRules = "Vui lòng đồng ý quy định đấu giá";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1200));

      toast.success("Tạo phiên đấu giá thành công!");
      setTimeout(() => navigate("/auction/seller"), 1000);
    } catch {
      toast.error("Tạo đấu giá thất bại, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  const sellingTips = [
    "Chụp ảnh rõ nét, đủ góc và ánh sáng tự nhiên.",
    "Mô tả trung thực tình trạng và phụ kiện đi kèm.",
    "Đặt giá khởi điểm hấp dẫn để thu hút người mua.",
    "Chọn thời gian đấu giá phù hợp với nhóm khách hàng.",
  ];

  const auctionRules = [
    {
      id: 1,
      title: "Quyền sở hữu hợp pháp",
      desc: "Người bán phải là chủ sở hữu hợp pháp hoặc được ủy quyền bán sản phẩm.",
    },
    {
      id: 2,
      title: "Mô tả trung thực",
      desc: "Thông tin, hình ảnh phải chính xác. Cố ý sai lệch sẽ bị khóa tài khoản.",
    },
    {
      id: 3,
      title: "Giá & bước giá",
      desc: "Giá khởi điểm tối thiểu 100.000đ. Bước giá không nhỏ hơn 1% giá khởi điểm.",
    },
    {
      id: 4,
      title: "Thời gian phiên",
      desc: "Phiên đấu giá tối thiểu 24 giờ, tối đa 14 ngày kể từ lúc bắt đầu.",
    },
    {
      id: 5,
      title: "Giao dịch sau đấu giá",
      desc: "Người bán giao hàng trong 3 ngày làm việc sau khi phiên kết thúc.",
    },
    {
      id: 6,
      title: "Phí dịch vụ",
      desc: "Phí nền tảng 5% giá chốt, tự động trừ khi giao dịch hoàn tất.",
    },
    {
      id: 7,
      title: "Hủy & tranh chấp",
      desc: "Nền tảng có quyền hủy phiên gian lận. Tranh chấp xử lý theo Buyer Protection.",
    },
  ];

  const promoItems = [
    {
      id: "vip",
      icon: FaCrown,
      badge: "ƯU ĐÃI",
      title: "Nâng cấp VIP Seller",
      desc: "Đăng không giới hạn phiên đấu giá, ưu tiên hiển thị trang chủ và huy hiệu uy tín.",
      highlight: "Giảm 20% phí dịch vụ tháng đầu",
    },
    {
      id: "trust",
      icon: FaShieldAlt,
      badge: "AN TOÀN",
      title: "Buyer Protection",
      desc: "Giao dịch được bảo vệ, hoàn tiền nếu sản phẩm không đúng mô tả hoặc không giao hàng.",
      highlight: "Bồi thường lên đến 50 triệu đồng",
    },
    {
      id: "reach",
      icon: FaUsers,
      badge: "TIẾP CẬN",
      title: "Hơn 50.000 người mua",
      desc: "Kết nối với cộng đồng đấu giá sôi động, tăng cơ hội bán với giá tốt nhất.",
      highlight: "Trung bình 12 lượt bid / phiên",
    },
    {
      id: "fast",
      icon: FaBolt,
      badge: "NHANH",
      title: "Duyệt phiên trong 24h",
      desc: "Hệ thống xét duyệt tự động, phiên đấu giá của bạn sớm được đưa lên sàn.",
      highlight: "Hỗ trợ 24/7 qua chat & hotline",
    },
  ];

  return (
    <AuctionLayout activeTab="selling" sidebarActive="create">
      <div className="auc-create-page">
        <div className="auc-create-page__pattern" aria-hidden />

        <div className="auc-create">
          <div className="auc-create__main">
            <button
              type="button"
              className="auc-create__back"
              onClick={() => navigate("/auction/seller")}
            >
              <FaArrowLeft /> Quay lại
            </button>

            <div className="auc-create__header">
              <h1>Tạo đấu giá mới</h1>
              <p>Điền thông tin sản phẩm để mở phiên đấu giá trên nền tảng.</p>
            </div>

            <form className="auc-create__form" onSubmit={handleSubmit}>
          <section className="auc-create__card">
            <h2>Thông tin sản phẩm</h2>

            <div className="field">
              <label htmlFor="title">Tên sản phẩm *</label>
              <input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="VD: Rolex Submariner Date 41mm"
                className={errors.title ? "error" : ""}
              />
              {errors.title && <span className="field-error">{errors.title}</span>}
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="category">Danh mục *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={errors.category ? "error" : ""}
                >
                  <option value="">Chọn danh mục</option>
                  {productCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <span className="field-error">{errors.category}</span>
                )}
              </div>

              <div className="field">
                <label htmlFor="brand">Thương hiệu *</label>
                <input
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="VD: Rolex, Apple, Leica..."
                  className={errors.brand ? "error" : ""}
                />
                {errors.brand && (
                  <span className="field-error">{errors.brand}</span>
                )}
              </div>
            </div>

            <div className="field">
              <label htmlFor="condition">Tình trạng *</label>
              <select
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className={errors.condition ? "error" : ""}
              >
                <option value="">Chọn tình trạng</option>
                <option value="new">Mới 100%</option>
                <option value="likenew">Like New 95–99%</option>
                <option value="good">Tốt 85–94%</option>
                <option value="used">Đã qua sử dụng</option>
              </select>
              {errors.condition && (
                <span className="field-error">{errors.condition}</span>
              )}
            </div>

            <div className="field">
              <label htmlFor="description">Mô tả chi tiết *</label>
              <textarea
                id="description"
                name="description"
                rows={5}
                value={formData.description}
                onChange={handleChange}
                placeholder="Mô tả rõ tình trạng, xuất xứ, phụ kiện đi kèm..."
                className={errors.description ? "error" : ""}
              />
              {errors.description && (
                <span className="field-error">{errors.description}</span>
              )}
            </div>
          </section>

          <section className="auc-create__card">
            <h2>Hình ảnh sản phẩm</h2>
            <p className="hint">Tối đa 5 ảnh. Ảnh đầu tiên sẽ là ảnh đại diện.</p>

            <label className={`upload-zone ${errors.images ? "error" : ""}`}>
              <FaCloudUploadAlt />
              <span>Kéo thả hoặc nhấn để tải ảnh lên</span>
              <em>JPG, PNG — tối đa 5MB mỗi ảnh</em>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
              />
            </label>
            {errors.images && (
              <span className="field-error">{errors.images}</span>
            )}

            {previews.length > 0 && (
              <div className="preview-grid">
                {previews.map((img, index) => (
                  <div key={img.id} className="preview-item">
                    <AuctionImage src={img.url} alt={img.name} />
                    {index === 0 && <span className="preview-badge">Ảnh chính</span>}
                    <button
                      type="button"
                      className="preview-remove"
                      onClick={() => removeImage(img.id)}
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {previews.length === 0 && (
              <div className="preview-placeholder">
                <AuctionImage
                  src={auctionImages.fallback}
                  alt="Placeholder"
                />
                <span>Chưa có ảnh — hãy tải lên ít nhất 1 ảnh</span>
              </div>
            )}
          </section>

          <section className="auc-create__card">
            <h2>Cài đặt đấu giá</h2>

            <div className="field-row field-row--3">
              <div className="field">
                <label htmlFor="startPrice">Giá khởi điểm (VNĐ) *</label>
                <input
                  id="startPrice"
                  name="startPrice"
                  type="number"
                  min="0"
                  value={formData.startPrice}
                  onChange={handleChange}
                  placeholder="1000000"
                  className={errors.startPrice ? "error" : ""}
                />
                {errors.startPrice && (
                  <span className="field-error">{errors.startPrice}</span>
                )}
              </div>

              <div className="field">
                <label htmlFor="reservePrice">Giá dự trữ (VNĐ)</label>
                <input
                  id="reservePrice"
                  name="reservePrice"
                  type="number"
                  min="0"
                  value={formData.reservePrice}
                  onChange={handleChange}
                  placeholder="Tùy chọn"
                />
              </div>

              <div className="field">
                <label htmlFor="bidIncrement">Bước giá (VNĐ) *</label>
                <input
                  id="bidIncrement"
                  name="bidIncrement"
                  type="number"
                  min="0"
                  value={formData.bidIncrement}
                  onChange={handleChange}
                  placeholder="500000"
                  className={errors.bidIncrement ? "error" : ""}
                />
                {errors.bidIncrement && (
                  <span className="field-error">{errors.bidIncrement}</span>
                )}
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="startDate">Ngày bắt đầu *</label>
                <input
                  id="startDate"
                  name="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={errors.startDate ? "error" : ""}
                />
                {errors.startDate && (
                  <span className="field-error">{errors.startDate}</span>
                )}
              </div>

              <div className="field">
                <label htmlFor="endDate">Ngày kết thúc *</label>
                <input
                  id="endDate"
                  name="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={errors.endDate ? "error" : ""}
                />
                {errors.endDate && (
                  <span className="field-error">{errors.endDate}</span>
                )}
              </div>
            </div>
          </section>

          <div className="field field--checkbox">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="agreeRules"
                checked={formData.agreeRules}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    agreeRules: e.target.checked,
                  }));
                  setErrors((prev) => ({ ...prev, agreeRules: "" }));
                }}
              />
              <span>
                Tôi đã đọc và đồng ý với{" "}
                <strong>Quy định đấu giá</strong> của Auction House
              </span>
            </label>
            {errors.agreeRules && (
              <span className="field-error">{errors.agreeRules}</span>
            )}
          </div>

          <div className="auc-create__actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate("/auction/seller")}
            >
              Hủy
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Đang tạo..." : "Tạo phiên đấu giá"}
            </button>
          </div>
        </form>
          </div>

          <aside className="auc-create__aside">
            <div
              className="auc-create__aside-bg"
              style={{ backgroundImage: `url(${auctionImages.createBg})` }}
            />
            <div className="auc-create__aside-content">
              <span className="auc-create__aside-badge">NGƯỜI BÁN</span>
              <h3>Bán hàng hiệu quả trên Auction House</h3>
              <p>
                Hoàn thiện hồ sơ uy tín và đăng sản phẩm minh bạch để tăng
                tỉ lệ đấu giá thành công.
              </p>
              <div className="auc-create__tips">
                <h4>Mẹo đăng bán</h4>
                <ul>
                  {sellingTips.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </div>

              <div className="auc-create__rules">
                <h4>Quy định đấu giá</h4>
                <ol>
                  {auctionRules.map((rule) => (
                    <li key={rule.id}>
                      <strong>{rule.title}</strong>
                      <span>{rule.desc}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="auc-create__aside-stats">
                <div>
                  <strong>98%</strong>
                  <span>Tỉ lệ giao dịch thành công</span>
                </div>
                <div>
                  <strong>24h</strong>
                  <span>Duyệt phiên trung bình</span>
                </div>
              </div>
            </div>
          </aside>

          <section className="auc-create__promo">
          <div className="auc-create__promo-header">
            <h2>Tại sao bán trên Auction House?</h2>
            <p>Nền tảng đấu giá uy tín — kết nối người mua và người bán minh bạch, hiệu quả.</p>
          </div>
          <div className="auc-create__promo-grid">
            {promoItems.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.id} className="promo-card">
                  <span className="promo-card__badge">{item.badge}</span>
                  <div className="promo-card__icon">
                    <Icon />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                  <span className="promo-card__highlight">{item.highlight}</span>
                </article>
              );
            })}
          </div>
          </section>
        </div>
      </div>
    </AuctionLayout>
  );
}

