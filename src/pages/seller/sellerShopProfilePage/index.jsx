import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/AuthContext";
import * as shopService from "../../../services/shopService";
import * as productService from "../../../services/productService";
import PageHeader from "../../../components/sellerdashboard/sellerPageHeader";
import { categoryStaffInfo, customerStats } from "../../../data/sellerMockData";
import { fileToDataUrl } from "../../../utils/fileToDataUrl";
import "./index.scss";

const TABS = [
  { id: "basic", label: "Thông tin cơ bản" },
  { id: "business", label: "Thông tin doanh nghiệp" },
  { id: "staff", label: "Thông tin Nhân viên ngành hàng", readOnly: true },
  { id: "identity", label: "Thông tin Định danh" },
];

const BUSINESS_TYPES = [
  { value: "individual", label: "Cá nhân" },
  { value: "household", label: "Hộ kinh doanh" },
  { value: "company", label: "Doanh nghiệp" },
];

export default function ShopProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("basic");
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState("summary");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [myProducts, setMyProducts] = useState([]);

  const activeTabDef = TABS.find((t) => t.id === activeTab);
  const approvedProducts = myProducts.filter((p) => p.status === "APPROVED");

  const closePreview = () => {
    setShowPreview(false);
    setPreviewMode("summary");
  };

  useEffect(() => {
    if (!user?.id) return;
    shopService.getShopProfile(user.id, user).then((data) => {
      setProfile(data);
      setLoading(false);
    });
    productService.getMyProducts(user.id).then(setMyProducts);
  }, [user?.id, user]);

  const startEditing = () => {
    setDraft(profile);
    setEditing(true);
  };

  const cancelEditing = () => {
    setDraft(null);
    setEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDraft((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (field, label, e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      setDraft((prev) => ({ ...prev, [field]: dataUrl }));
      toast.success(`Đã tải lên: ${label}`);
    } catch (err) {
      toast.error(err.message || "Tải ảnh lên thất bại");
    }
  };

  const handleSave = async () => {
    if (!draft.shopName.trim()) {
      toast.error("Vui lòng nhập tên Shop");
      return;
    }
    setSaving(true);
    try {
      const isCompany = draft.businessType === "company";
      const identityFilled = isCompany ? Boolean(draft.taxCode?.trim()) : Boolean(draft.identityNumber?.trim());
      const toSave = {
        ...draft,
        identityUpdatedAt: identityFilled ? new Date().toLocaleString("vi-VN") : draft.identityUpdatedAt,
      };
      await shopService.saveShopProfile(user.id, toSave);
      setProfile(toSave);
      setEditing(false);
      toast.success("Đã lưu hồ sơ Shop");
    } catch (err) {
      toast.error(err.message || "Lưu hồ sơ Shop thất bại");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="slr-page slr-shop-profile">
        <PageHeader title="Hồ Sơ Shop" subtitle="Đang tải..." />
      </div>
    );
  }

  const shown = editing ? draft : profile;

  return (
    <div className="slr-page slr-shop-profile">
      <PageHeader
        title="Hồ Sơ Shop"
        subtitle="Xem tình trạng Shop và cập nhật hồ sơ Shop của bạn"
        actions={
          <>
            <button type="button" className="slr-btn-outline" onClick={() => { setShowPreview(true); setPreviewMode("summary"); }}>
              Xem Shop của tôi
            </button>
            {!editing && !activeTabDef?.readOnly && (
              <button type="button" className="slr-btn-create" onClick={startEditing}>
                Chỉnh sửa
              </button>
            )}
          </>
        }
      />

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

      <div className="slr-panel-card slr-shop-profile__card">
        {activeTab === "basic" && (
          <div className="slr-cp__section">
            <div className="slr-cp__row">
              <label className="slr-cp__row-label">Tên Shop</label>
              <div className="slr-cp__row-body">
                {editing ? (
                  <input name="shopName" value={shown.shopName} onChange={handleChange} placeholder="Tên Shop của bạn" />
                ) : (
                  <p className="slr-shop-profile__value">{shown.shopName || "Chưa đặt tên Shop"}</p>
                )}
              </div>
            </div>

            <div className="slr-cp__row">
              <label className="slr-cp__row-label">Shop Logo</label>
              <div className="slr-cp__row-body">
                <label
                  className={`slr-cp__upload-slot slr-cp__upload-slot--square ${shown.logo ? "filled" : ""}`}
                >
                  {shown.logo ? (
                    <img src={shown.logo} alt="Logo Shop" />
                  ) : (
                    "+ Thêm logo"
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={!editing}
                    onChange={(e) => handleImageUpload("logo", "logo Shop", e)}
                    hidden
                  />
                </label>
                <small className="slr-create-image-hint">
                  Kích thước đề xuất: 300x300px — dung lượng tối đa 2MB — định dạng JPG, JPEG, PNG
                </small>
              </div>
            </div>

            <div className="slr-cp__row">
              <label className="slr-cp__row-label">Ảnh bìa Shop</label>
              <div className="slr-cp__row-body">
                <label
                  className={`slr-cp__upload-slot slr-cp__upload-slot--video ${shown.cover ? "filled" : ""}`}
                >
                  {shown.cover ? (
                    <img src={shown.cover} alt="Ảnh bìa Shop" />
                  ) : (
                    "+ Thêm ảnh bìa"
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={!editing}
                    onChange={(e) => handleImageUpload("cover", "ảnh bìa Shop", e)}
                    hidden
                  />
                </label>
                <small className="slr-create-image-hint">
                  Kích thước đề xuất: 1200x300px — hiển thị ở đầu trang Shop công khai
                </small>
              </div>
            </div>

            <div className="slr-cp__row">
              <label className="slr-cp__row-label">Mô tả Shop</label>
              <div className="slr-cp__row-body">
                {editing ? (
                  <textarea
                    name="description"
                    rows={5}
                    value={shown.description}
                    onChange={handleChange}
                    placeholder="Giới thiệu về Shop của bạn với người mua..."
                  />
                ) : (
                  <p className="slr-shop-profile__value">{shown.description || "Chưa có mô tả"}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "business" && (
          <div className="slr-cp__section">
            <div className="slr-cp__row">
              <label className="slr-cp__row-label">Mã số thuế</label>
              <div className="slr-cp__row-body">
                {editing ? (
                  <input name="taxCode" value={shown.taxCode} onChange={handleChange} placeholder="VD: 0312345678" />
                ) : (
                  <p className="slr-shop-profile__value">{shown.taxCode || "Chưa cập nhật"}</p>
                )}
              </div>
            </div>

            <div className="slr-cp__row">
              <label className="slr-cp__row-label">Địa chỉ đăng ký kinh doanh</label>
              <div className="slr-cp__row-body">
                {editing ? (
                  <input
                    name="businessAddress"
                    value={shown.businessAddress}
                    onChange={handleChange}
                    placeholder="Địa chỉ đăng ký kinh doanh"
                  />
                ) : (
                  <p className="slr-shop-profile__value">{shown.businessAddress || "Chưa cập nhật"}</p>
                )}
              </div>
            </div>

            <div className="slr-cp__row">
              <label className="slr-cp__row-label">Loại hình kinh doanh</label>
              <div className="slr-cp__row-body">
                {editing ? (
                  <select name="businessType" value={shown.businessType} onChange={handleChange}>
                    {BUSINESS_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="slr-shop-profile__value">
                    {BUSINESS_TYPES.find((t) => t.value === shown.businessType)?.label}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "staff" && (
          <div className="slr-cp__section">
            <div className="slr-cp__row">
              <label className="slr-cp__row-label">Email Nhân viên ngành hàng</label>
              <div className="slr-cp__row-body">
                <p className="slr-shop-profile__value">{categoryStaffInfo.email}</p>
              </div>
            </div>
            <div className="slr-cp__row">
              <label className="slr-cp__row-label">Cập nhật gần nhất</label>
              <div className="slr-cp__row-body">
                <p className="slr-shop-profile__value">{categoryStaffInfo.updatedAt}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "identity" && (() => {
          const isCompany = shown.businessType === "company";
          const isVerified = isCompany ? Boolean(shown.taxCode?.trim()) : Boolean(shown.identityNumber?.trim());
          return (
            <div className="slr-cp__section">
              <div className="slr-cp__row">
                <label className="slr-cp__row-label">Trạng thái định danh</label>
                <div className="slr-cp__row-body">
                  <span className={`slr-cp__badge ${isVerified ? "verified" : "pending"}`}>
                    {isVerified ? "Đã xác minh" : "Chưa xác minh"}
                  </span>
                </div>
              </div>
              <div className="slr-cp__row">
                <label className="slr-cp__row-label">Chủ Shop</label>
                <div className="slr-cp__row-body">
                  <p className="slr-shop-profile__value">{user?.fullName || "Chưa cập nhật"}</p>
                </div>
              </div>

              {isCompany ? (
                <div className="slr-cp__row">
                  <label className="slr-cp__row-label">Mã số thuế doanh nghiệp</label>
                  <div className="slr-cp__row-body">
                    {editing ? (
                      <input name="taxCode" value={shown.taxCode} onChange={handleChange} placeholder="VD: 0312345678" />
                    ) : (
                      <p className="slr-shop-profile__value">{shown.taxCode || "Chưa cập nhật"}</p>
                    )}
                    <small className="slr-create-image-hint">Chỉnh sửa đồng bộ với tab Thông tin doanh nghiệp</small>
                  </div>
                </div>
              ) : (
                <div className="slr-cp__row">
                  <label className="slr-cp__row-label">Số CCCD/Hộ chiếu</label>
                  <div className="slr-cp__row-body">
                    {editing ? (
                      <input
                        name="identityNumber"
                        value={shown.identityNumber}
                        onChange={handleChange}
                        placeholder="Nhập số CCCD/Hộ chiếu"
                      />
                    ) : (
                      <p className="slr-shop-profile__value">{shown.identityNumber || "Chưa cập nhật"}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="slr-cp__row">
                <label className="slr-cp__row-label">Cập nhật gần nhất</label>
                <div className="slr-cp__row-body">
                  <p className="slr-shop-profile__value">{shown.identityUpdatedAt || "Chưa cập nhật"}</p>
                </div>
              </div>
            </div>
          );
        })()}

        {editing && (
          <div className="slr-create-product__actions">
            <button type="button" className="slr-btn-plain" onClick={cancelEditing}>
              Hủy
            </button>
            <button type="button" className="slr-btn-create" disabled={saving} onClick={handleSave}>
              {saving ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        )}
      </div>

      {showPreview && (
        <div className="slr-shop-preview__overlay" onClick={closePreview}>
          <div
            className={`slr-shop-preview__card ${previewMode === "full" ? "slr-shop-preview__card--full" : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="slr-shop-preview__close" onClick={closePreview}>
              ×
            </button>
            <div
              className={`slr-shop-preview__cover ${profile.cover ? "filled" : ""}`}
              style={profile.cover ? { backgroundImage: `url(${profile.cover})` } : undefined}
            />
            <div className="slr-shop-preview__header">
              <div
                className={`slr-shop-preview__logo ${profile.logo ? "filled" : ""}`}
                style={profile.logo ? { backgroundImage: `url(${profile.logo})` } : undefined}
              >
                {!profile.logo && (profile.shopName?.[0]?.toUpperCase() || "S")}
              </div>
              <div>
                <h3>{profile.shopName || "Shop chưa đặt tên"}</h3>
                <span>Đây là giao diện Shop mà người mua sẽ nhìn thấy</span>
              </div>
            </div>

            {previewMode === "summary" ? (
              <>
                <p className="slr-shop-preview__desc">{profile.description || "Chưa có mô tả Shop"}</p>
                <div className="slr-shop-preview__quickstats">
                  <div>
                    <strong>{approvedProducts.length}</strong>
                    <span>Sản phẩm</span>
                  </div>
                  <div>
                    <strong>4.8</strong>
                    <span>Đánh giá</span>
                  </div>
                  <div>
                    <strong>{customerStats.total.toLocaleString("vi-VN")}</strong>
                    <span>Người theo dõi</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="slr-btn-create slr-shop-preview__expand"
                  onClick={() => setPreviewMode("full")}
                >
                  Xem đầy đủ Shop
                </button>
              </>
            ) : (
              <div className="slr-shop-preview__full">
                <p className="slr-shop-preview__desc">{profile.description || "Chưa có mô tả Shop"}</p>
                <h4>Sản phẩm của Shop</h4>
                {approvedProducts.length === 0 ? (
                  <p className="slr-shop-profile__value">
                    Chưa có sản phẩm nào được duyệt và hiển thị công khai.
                  </p>
                ) : (
                  <div className="slr-shop-preview__list">
                    {approvedProducts.map((p) => (
                      <div key={p.id} className="slr-shop-preview__row">
                        <div className="slr-shop-preview__row-thumb">
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt={p.name} />
                          ) : (
                            p.name?.[0]?.toUpperCase() || "?"
                          )}
                        </div>
                        <div className="slr-shop-preview__row-info">
                          <strong>{p.name}</strong>
                          <span>{Number(p.price || 0).toLocaleString("vi-VN")}đ</span>
                        </div>
                        <small className="slr-shop-preview__row-stock">Tồn kho {p.stock}</small>
                      </div>
                    ))}
                  </div>
                )}
                <button type="button" className="slr-btn-plain" onClick={() => setPreviewMode("summary")}>
                  ← Quay lại thông tin tóm tắt
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
