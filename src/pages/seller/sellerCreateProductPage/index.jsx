import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/AuthContext";
import {
  createEcommerceProduct,
  uploadProductImage,
  attachProductImage,
  createProductSku,
  submitProductForReview,
  getApiErrorMessage,
} from "../../../services/ecommerceProductService";
import * as shippingService from "../../../services/shippingService";
import { productCategories } from "../../../data/auctionMockData";
import { fileToDataUrl } from "../../../utils/fileToDataUrl";
import { dataUrlToFile } from "../../../utils/dataUrlToFile";
import Select from "../../../components/common/select";
import "./index.scss";

const SUBMIT_STEP_LABELS = {
  create: "Đang tạo sản phẩm...",
  images: "Đang tải ảnh lên...",
  sku: "Đang tạo SKU...",
  review: "Đang gửi duyệt...",
};

const CATEGORY_OPTIONS = productCategories.map((c) => ({ value: c.id, label: c.label }));

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
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState("");
  const [draftProductId, setDraftProductId] = useState(null);
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

  const handleSlotImageUpload = async (startIndex, e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    try {
      const dataUrls = await Promise.all(files.map(fileToDataUrl));
      setImages((prev) => {
        const next = [...prev];
        let curr = startIndex;
        for (let i = 0; i < dataUrls.length; i += 1) {
          while (curr < MAX_IMAGES && next[curr]) {
            curr += 1;
          }
          if (curr < MAX_IMAGES) {
            next[curr] = dataUrls[i];
            curr += 1;
          }
        }
        return next;
      });
      toast.success(`Đã thêm ${files.length} ảnh sản phẩm`);
    } catch (err) {
      toast.error(err.message || "Tải ảnh lên thất bại");
    }
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => {
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Dung lượng video không được vượt quá 50MB");
      return;
    }
    const url = URL.createObjectURL(file);
    setVideo({ file, url, name: file.name });
    toast.success(`Đã chọn video: ${file.name}`);
  };

  const handleRemoveVideo = () => {
    if (video?.url) URL.revokeObjectURL(video.url);
    setVideo(null);
  };

  const tips = [
    { label: "Thêm ít nhất 1-3 hình ảnh", done: filledImages.length >= 1 },
    { label: "Thêm video sản phẩm (không bắt buộc)", done: !!video },
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

    let productId = draftProductId;

    try {
      if (!productId) {
        setSubmitStep("create");
        const created = await createEcommerceProduct({
          name: form.name.trim(),
          categoryId: form.category,
          brand: form.brand.trim() || undefined,
          description: form.description.trim() || undefined,
          price: Number(form.price),
          stock: Number(form.stock),
          condition: form.condition,
        });
        productId = created.productId ?? created.id;
        if (!productId) {
          throw new Error("Không nhận được productId từ server.");
        }
        setDraftProductId(productId);
      }

      const imagesToUpload = [...filledImages];

      if (imagesToUpload.length > 0) {
        setSubmitStep("images");
        for (let i = 0; i < imagesToUpload.length; i += 1) {
          const dataUrl = imagesToUpload[i];
          const file = await dataUrlToFile(dataUrl, `product-${productId}-${i + 1}.jpg`);
          const { url, key } = await uploadProductImage(file);
          const isCover = i === 0;
          await attachProductImage(productId, { url, key, isCover });
        }
      }

      setSubmitStep("sku");
      await createProductSku(productId, {
        skuCode: "DEFAULT",
        price: Number(form.price),
        stock: Number(form.stock),
      });

      if (!hidden) {
        setSubmitStep("review");
        await submitProductForReview(productId);
      }

      toast.success(
        hidden
          ? "Đã lưu sản phẩm ở chế độ ẩn (DRAFT)"
          : "Đã tạo sản phẩm và gửi duyệt thành công"
      );
      navigate("/seller-hub/products");
    } catch (err) {
      const message = getApiErrorMessage(err, err.message || "Tạo sản phẩm thất bại");
      if (productId) {
        toast.error(
          `Sản phẩm #${productId} đã được tạo nhưng chưa hoàn tất (${SUBMIT_STEP_LABELS[submitStep] || "bước hiện tại"}). ${message} — bạn có thể thử lại mà không tạo trùng.`
        );
      } else {
        toast.error(message);
      }
    } finally {
      setSubmitting(false);
      setSubmitStep("");
    }
  };

  const submitLabel = submitting
    ? SUBMIT_STEP_LABELS[submitStep] || "Đang lưu..."
    : null;

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
                    <div className="slr-create-image-grid">
                      {Array.from({ length: MAX_IMAGES }).map((_, i) => {
                        const dataUrl = images[i];
                        const isCover = i === 0;
                        return (
                          <div key={i} className="slr-cp__upload-slot-wrapper">
                            {dataUrl ? (
                              <div className="slr-cp__upload-slot filled">
                                <img src={dataUrl} alt={`Ảnh ${i + 1}`} />
                                {isCover && <span className="slr-cp__cover-badge">Ảnh bìa</span>}
                                <button
                                  type="button"
                                  className="slr-cp__img-remove-btn"
                                  onClick={() => handleRemoveImage(i)}
                                  title="Xoá ảnh"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <label className="slr-cp__upload-slot">
                                <span className="slr-cp__upload-icon">+</span>
                                <span className="slr-cp__upload-text">{isCover ? "Ảnh bìa *" : "Thêm ảnh"}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  onChange={(e) => handleSlotImageUpload(i, e)}
                                  hidden
                                />
                              </label>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <small className="slr-create-image-hint">
                      Đã chọn {filledImages.length}/{MAX_IMAGES} ảnh (click vào ô bất kỳ để chọn 1 hoặc nhiều ảnh cùng lúc)
                    </small>
                  </div>
                </div>

                <div className="slr-cp__row">
                  <label className="slr-cp__row-label">Video sản phẩm</label>
                  <div className="slr-cp__row-body">
                    {video ? (
                      <div className="slr-cp__video-preview-card">
                        <video src={video.url} controls />
                        <div className="slr-cp__video-info">
                          <span className="slr-cp__video-name">📹 {video.name}</span>
                          <button
                            type="button"
                            className="slr-cp__video-delete-btn"
                            onClick={handleRemoveVideo}
                          >
                            Xoá video
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="slr-cp__upload-slot--video-card">
                        <div className="slr-cp__video-icon">📹</div>
                        <div className="slr-cp__video-label">+ Thêm video sản phẩm</div>
                        <span className="slr-cp__video-sub">(Không bắt buộc)</span>
                        <input type="file" accept="video/*" onChange={handleVideoUpload} hidden />
                      </label>
                    )}
                    <ul className="slr-cp__hint-list">
                      <li>Kích thước: tối đa 50MB, định dạng: .mp4, .webm, .mov</li>
                      <li>Video là tùy chọn (không bắt buộc)</li>
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
                  <span className="slr-cp__row-label">Ngành hàng</span>
                  <div className="slr-cp__row-body">
                    <div className="slr-cp__inline-field">
                      <Select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        options={CATEGORY_OPTIONS}
                        placeholder="Chọn ngành hàng"
                      />
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
                {submitLabel || "Lưu & Ẩn"}
              </button>
              <button type="submit" className="slr-btn-create" disabled={submitting}>
                {submitLabel || "Lưu & Hiển thị"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
