import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/AuthContext";
import * as productService from "../../../services/productService";
import * as shippingService from "../../../services/shippingService";
import { productCategories } from "../../../data/auctionMockData";
import { fileToDataUrl } from "../../../utils/fileToDataUrl";
import "./index.scss";

const CONDITIONS = [
  { value: "new", label: "Hàng mới" },
  { value: "used", label: "Đã qua sử dụng" },
];

const TABS = [
  { id: "basic", label: "Thông tin cơ bản" },
  { id: "sales", label: "Thông tin bán hàng" },
  { id: "shipping", label: "Vận chuyển" },
  { id: "other", label: "Thông tin khác" },
];

const MAX_IMAGES = 9;
const NAME_MAX = 120;

const initialForm = {
  name: "",
  category: productCategories[0]?.id ?? "",
  brand: "",
  description: "",
  price: "",
  stock: "",
  condition: "new",
};

export default function CreateProductPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("basic");
  const [form, setForm] = useState(initialForm);
  const [imageRatio, setImageRatio] = useState("1:1");
  const [images, setImages] = useState([]);
  const [coverImage, setCoverImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState([]);
  const [shippingLoading, setShippingLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    shippingService.getShippingSettings(user.id).then((data) => {
      const enabled = data.filter((o) => o.enabled);
      setShippingOptions(enabled);
      setSelectedShipping(enabled.map((o) => o.id));
      setShippingLoading(false);
    });
  }, [user?.id]);

  const toggleShippingMethod = (id) => {
    setSelectedShipping((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const filledImages = images.filter(Boolean);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleImageUpload = async (index, e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      setImages((prev) => {
        const next = [...prev];
        next[index] = dataUrl;
        return next;
      });
      toast.success(`Đã tải lên ảnh ${index + 1}`);
    } catch (err) {
      toast.error(err.message || "Tải ảnh lên thất bại");
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      setCoverImage(dataUrl);
      toast.success("Đã tải lên ảnh bìa");
    } catch (err) {
      toast.error(err.message || "Tải ảnh lên thất bại");
    }
  };

  const handleMockVideoUpload = () => {
    setVideo("product_video_mock.mp4");
    toast.info("Đã tải lên (mock): video sản phẩm");
  };

  const tips = [
    { label: "Thêm ít nhất 3 hình ảnh", done: filledImages.length >= 3 },
    { label: "Thêm video sản phẩm", done: !!video },
    {
      label: "Thêm 20-100 ký tự cho tên sản phẩm",
      done: form.name.trim().length >= 20 && form.name.trim().length <= 100,
    },
    {
      label: "Thêm ít nhất 100 ký tự hoặc 1 hình ảnh trong mô tả sản phẩm",
      done: form.description.trim().length >= 100 || filledImages.length >= 1,
    },
    { label: "Thêm thương hiệu", done: !!form.brand.trim() },
  ];

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Vui lòng nhập tên sản phẩm";
    if (!form.price.trim()) next.price = "Vui lòng nhập giá bán";
    else if (Number.isNaN(Number(form.price))) next.price = "Giá bán phải là số";
    if (!form.stock.trim()) next.stock = "Vui lòng nhập số lượng tồn kho";
    else if (Number.isNaN(Number(form.stock))) next.stock = "Số lượng phải là số";
    setErrors(next);
    if (next.name) setActiveTab("basic");
    else if (next.price || next.stock) setActiveTab("sales");
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (hidden) => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await productService.createProduct(user.id, {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        images: filledImages,
        imageRatio,
        coverImage,
        video,
        shippingMethods: selectedShipping,
        hidden,
      });
      toast.success(hidden ? "Đã lưu sản phẩm ở chế độ ẩn" : "Đã tạo sản phẩm (chờ duyệt)");
      navigate("/seller-hub/products");
    } catch (err) {
      toast.error(err.message || "Tạo sản phẩm thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="slr-page slr-create-product">
      <nav className="slr-cp__breadcrumb">
        <span>Trang chủ</span>
        <span className="sep">›</span>
        <span>Sản phẩm</span>
        <span className="sep">›</span>
        <span className="current">Thêm 1 sản phẩm mới</span>
      </nav>

      <div className="slr-cp__layout">
        <aside className="slr-cp__tips">
          <h4>Gợi ý điền thông tin</h4>
          <ul>
            {tips.map((tip) => (
              <li key={tip.label} className={tip.done ? "done" : ""}>
                <span className="slr-cp__tip-dot" />
                {tip.label}
              </li>
            ))}
          </ul>
        </aside>

        <div className="slr-cp__main">
          <div className="slr-cp__tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={activeTab === tab.id ? "active" : ""}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form
            className="slr-panel-card slr-create-product__card"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(false);
            }}
          >
            {activeTab === "basic" && (
              <div className="slr-cp__section">
                <h3>Thông tin cơ bản</h3>

                <div className="slr-cp__row">
                  <label className="slr-cp__row-label">
                    Hình ảnh sản phẩm<span className="required"> *</span>
                  </label>
                  <div className="slr-cp__row-body">
                    <div className="slr-cp__ratio-toggle">
                      <label className={imageRatio === "1:1" ? "selected" : ""}>
                        <input
                          type="radio"
                          name="imageRatio"
                          checked={imageRatio === "1:1"}
                          onChange={() => setImageRatio("1:1")}
                        />
                        Hình ảnh tỷ lệ 1:1
                      </label>
                      <label className={imageRatio === "3:4" ? "selected" : ""}>
                        <input
                          type="radio"
                          name="imageRatio"
                          checked={imageRatio === "3:4"}
                          onChange={() => setImageRatio("3:4")}
                        />
                        Hình ảnh tỷ lệ 3:4
                      </label>
                      <button
                        type="button"
                        className="slr-cp__link"
                        onClick={() => toast.info("Đây là ảnh minh hoạ cho tỷ lệ hình ảnh đã chọn")}
                      >
                        Ví dụ
                      </button>
                    </div>

                    <div className="slr-create-image-grid">
                      {Array.from({ length: MAX_IMAGES }).map((_, i) => (
                        <label
                          key={i}
                          className={`slr-cp__upload-slot slr-cp__upload-slot--square ${
                            images[i] ? "filled" : ""
                          }`}
                        >
                          {images[i] ? <img src={images[i]} alt={`Ảnh ${i + 1}`} /> : "+ Thêm ảnh"}
                          <input type="file" accept="image/*" onChange={(e) => handleImageUpload(i, e)} hidden />
                        </label>
                      ))}
                    </div>
                    <small className="slr-create-image-hint">
                      Đã thêm {filledImages.length}/{MAX_IMAGES} ảnh — ảnh đang lưu tạm trên trình duyệt, cần
                      tích hợp lưu trữ ảnh trên cloud khi có backend
                    </small>
                  </div>
                </div>

                {imageRatio === "3:4" && (
                  <div className="slr-cp__row">
                    <label className="slr-cp__row-label">Ảnh bìa</label>
                    <div className="slr-cp__row-body">
                      <label
                        className={`slr-cp__upload-slot slr-cp__upload-slot--cover ${
                          coverImage ? "filled" : ""
                        }`}
                      >
                        {coverImage ? <img src={coverImage} alt="Ảnh bìa" /> : "+ Thêm ảnh bìa"}
                        <input type="file" accept="image/*" onChange={handleCoverUpload} hidden />
                      </label>
                      <small className="slr-create-image-hint">
                        Ảnh sẽ được hiển thị nổi bật với tỷ lệ 3:4 trên trang tìm kiếm và gợi ý sản phẩm
                      </small>
                    </div>
                  </div>
                )}

                <div className="slr-cp__row">
                  <label className="slr-cp__row-label">Video sản phẩm</label>
                  <div className="slr-cp__row-body">
                    <button
                      type="button"
                      className={`slr-cp__upload-slot slr-cp__upload-slot--video ${video ? "filled" : ""}`}
                      onClick={handleMockVideoUpload}
                    >
                      {video ? "✓ Đã tải video" : "+ Thêm video"}
                    </button>
                    <ul className="slr-cp__hint-list">
                      <li>Kích thước: tối đa 30MB, độ phân giải vượt quá 1200x1200px</li>
                      <li>Độ dài: 10s - 60s</li>
                      <li>Định dạng hỗ trợ: .mp4</li>
                    </ul>
                  </div>
                </div>

                <div className="slr-cp__row">
                  <label className="slr-cp__row-label" htmlFor="name">
                    Tên sản phẩm<span className="required"> *</span>
                  </label>
                  <div className="slr-cp__row-body">
                    <div className="slr-cp__input-counter">
                      <input
                        id="name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        maxLength={NAME_MAX}
                        placeholder="Tên sản phẩm • Thương hiệu • Model • Số sê-ri"
                        className={errors.name ? "input-error" : ""}
                      />
                      <span className="slr-cp__counter">
                        {form.name.length}/{NAME_MAX}
                      </span>
                    </div>
                    {errors.name && <span className="field-error">{errors.name}</span>}
                  </div>
                </div>

                <div className="slr-cp__row">
                  <label className="slr-cp__row-label" htmlFor="category">
                    Ngành hàng
                  </label>
                  <div className="slr-cp__row-body">
                    <div className="slr-cp__inline-field">
                      <select id="category" name="category" value={form.category} onChange={handleChange}>
                        {productCategories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="slr-cp__link"
                        onClick={() => toast.info("Chưa có ngành hàng sử dụng gần đây")}
                      >
                        Sử dụng gần đây
                      </button>
                    </div>
                  </div>
                </div>

                <div className="slr-cp__row">
                  <label className="slr-cp__row-label" htmlFor="brand">
                    Thương hiệu
                  </label>
                  <div className="slr-cp__row-body">
                    <input
                      id="brand"
                      name="brand"
                      value={form.brand}
                      onChange={handleChange}
                      placeholder="Chọn hoặc nhập thương hiệu"
                    />
                  </div>
                </div>

                <div className="slr-cp__row">
                  <label className="slr-cp__row-label" htmlFor="description">
                    Mô tả sản phẩm
                  </label>
                  <div className="slr-cp__row-body">
                    <textarea
                      id="description"
                      name="description"
                      rows={5}
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Mô tả tình trạng, thông số, phụ kiện đi kèm..."
                    />
                    <span className="slr-cp__counter slr-cp__counter--block">
                      {form.description.length} ký tự
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "sales" && (
              <div className="slr-cp__section">
                <h3>Thông tin bán hàng</h3>

                <div className="slr-cp__row">
                  <label className="slr-cp__row-label" htmlFor="price">
                    Giá bán (đ)<span className="required"> *</span>
                  </label>
                  <div className="slr-cp__row-body">
                    <input
                      id="price"
                      name="price"
                      inputMode="numeric"
                      value={form.price}
                      onChange={handleChange}
                      placeholder="0"
                      className={errors.price ? "input-error" : ""}
                    />
                    {errors.price && <span className="field-error">{errors.price}</span>}
                  </div>
                </div>

                <div className="slr-cp__row">
                  <label className="slr-cp__row-label" htmlFor="stock">
                    Số lượng tồn kho<span className="required"> *</span>
                  </label>
                  <div className="slr-cp__row-body">
                    <input
                      id="stock"
                      name="stock"
                      inputMode="numeric"
                      value={form.stock}
                      onChange={handleChange}
                      placeholder="0"
                      className={errors.stock ? "input-error" : ""}
                    />
                    {errors.stock && <span className="field-error">{errors.stock}</span>}
                  </div>
                </div>

                <div className="slr-cp__row">
                  <label className="slr-cp__row-label">Tình trạng</label>
                  <div className="slr-cp__row-body">
                    <div className="slr-create-condition-group">
                      {CONDITIONS.map((c) => (
                        <label key={c.value} className={form.condition === c.value ? "selected" : ""}>
                          <input
                            type="radio"
                            name="condition"
                            value={c.value}
                            checked={form.condition === c.value}
                            onChange={handleChange}
                          />
                          {c.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "shipping" && (
              <div className="slr-cp__section">
                <h3>Vận chuyển</h3>

                {shippingLoading ? (
                  <p>Đang tải phương thức vận chuyển...</p>
                ) : shippingOptions.length === 0 ? (
                  <div className="slr-cp__row">
                    <div className="slr-cp__row-body">
                      <p className="slr-shop-profile__value">
                        Shop chưa bật phương thức vận chuyển nào. Vào{" "}
                        <Link to="/seller-hub/shipping-settings">Cài Đặt Vận Chuyển</Link> để bật phương thức
                        (Giao hàng tiêu chuẩn, Giao hàng nhanh, Hoả tốc...) trước khi hiển thị sản phẩm.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="slr-cp__row">
                    <label className="slr-cp__row-label">Áp dụng cho sản phẩm này</label>
                    <div className="slr-cp__row-body">
                      <div className="slr-table-wrap">
                        <table className="slr-table">
                          <thead>
                            <tr>
                              <th style={{ width: "40%" }}>Đơn vị</th>
                              <th>Thời gian</th>
                              <th>Giá cơ sở</th>
                              <th>Giá/km</th>
                              <th style={{ width: "60px" }}>Chọn</th>
                            </tr>
                          </thead>
                          <tbody>
                            {shippingOptions.map((o) => (
                              <tr key={o.id}>
                                <td>{o.label}</td>
                                <td>{o.desc}</td>
                                <td>{o.basePrice}đ</td>
                                <td>{o.pricePerKm}đ</td>
                                <td style={{ textAlign: "center" }}>
                                  <input
                                    type="checkbox"
                                    checked={selectedShipping.includes(o.id)}
                                    onChange={() => toggleShippingMethod(o.id)}
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <small className="slr-create-image-hint">
                        Chọn các phương thức vận chuyển muốn áp dụng cho sản phẩm này. Giá được tính: Giá cơ sở + (Khoảng cách × Giá/km). Cấu hình chi tiết tại{" "}
                        <Link to="/seller-hub/shipping-settings">Cài Đặt Vận Chuyển</Link>.
                      </small>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "other" && (
              <div className="slr-cp__section slr-cp__section--placeholder">
                <h3>Thông tin khác</h3>
                <p>Chưa có thông tin bổ sung nào cho sản phẩm này.</p>
              </div>
            )}

            <div className="slr-create-product__actions">
              <button
                type="button"
                className="slr-btn-plain"
                onClick={() => navigate("/seller-hub/products")}
              >
                Hủy
              </button>
              <button
                type="button"
                className="slr-btn-outline"
                disabled={submitting}
                onClick={() => handleSubmit(true)}
              >
                {submitting ? "Đang lưu..." : "Lưu & Ẩn"}
              </button>
              <button type="submit" className="slr-btn-create" disabled={submitting}>
                {submitting ? "Đang lưu..." : "Lưu & Hiển thị"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
