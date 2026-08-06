import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaPlus, FaTrash, FaEdit, FaTimes, FaCheck, FaBolt } from "react-icons/fa";
import { useAuth } from "../../../context/AuthContext";
import {
  createEcommerceProduct,
  uploadProductImage,
  attachProductImage,
  submitProductForReview,
  getApiErrorMessage,
} from "../../../services/ecommerceProductService";
import { getCategories } from "../../../services/adminCategoryService";
import * as shippingService from "../../../services/shippingService";
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

const DEFAULT_CATEGORY_OPTIONS = [
  { value: "00000000-0000-0000-0000-000000000003", label: "Thời trang & Phụ kiện > Áo quần" },
  { value: "00000000-0000-0000-0000-000000000002", label: "Điện thoại & Công nghệ > Thiết bị di động" },
  { value: "00000000-0000-0000-0000-000000000001", label: "Nghệ thuật & Sưu tầm" },
  { value: "00000000-0000-0000-0000-000000000004", label: "Ô tô & Xe máy" },
  { value: "00000000-0000-0000-0000-000000000005", label: "Điện gia dụng & Nhà cửa" },
  { value: "00000000-0000-0000-0000-000000000006", label: "Mỹ phẩm & Sức khỏe" },
];

const CONDITIONS = [
  { value: "new", label: "Mới" },
  { value: "used", label: "Đã qua sử dụng" },
];

const TABS = [
  { id: "basic", label: "Thông tin cơ bản" },
  { id: "detail", label: "Thông tin chi tiết" },
  { id: "sales", label: "Thông tin bán hàng" },
  { id: "shipping", label: "Vận chuyển" },
  { id: "other", label: "Thông tin khác" },
];

const MAX_IMAGES = 9;
const NAME_MAX = 120;

const initialForm = {
  name: "",
  category: "00000000-0000-0000-0000-000000000003",
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
  const [categoryOptions, setCategoryOptions] = useState(DEFAULT_CATEGORY_OPTIONS);
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState("");
  const [draftProductId, setDraftProductId] = useState(null);
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState([]);
  const [shippingLoading, setShippingLoading] = useState(true);

  // Tab 2: Thông tin chi tiết - Free text custom preset name & fields
  const [customPresetName, setCustomPresetName] = useState("");
  const [detailFields, setDetailFields] = useState({
    brand: "",
    origin: "",
    material: "",
  });
  const [customAttributes, setCustomAttributes] = useState([]);

  // Tab 3: Thông tin bán hàng
  const [productTypeMode, setProductTypeMode] = useState("single"); // 'single' | 'multi'
  
  // Dynamic Variation Builder (Clean & empty by default)
  const [group1Name, setGroup1Name] = useState("");
  const [group1Options, setGroup1Options] = useState([]);
  const [inputOpt1, setInputOpt1] = useState("");

  const [hasGroup2, setHasGroup2] = useState(false);
  const [group2Name, setGroup2Name] = useState("");
  const [group2Options, setGroup2Options] = useState([]);
  const [inputOpt2, setInputOpt2] = useState("");

  // Detailed variation rows
  const [variationRows, setVariationRows] = useState([]);

  // Batch Apply inputs for seller convenience
  const [batchPrice, setBatchPrice] = useState("");
  const [batchStock, setBatchStock] = useState("");

  // Other Info
  const [isPreOrder, setIsPreOrder] = useState(false);
  const [preOrderDays, setPreOrderDays] = useState("7");
  const [schedulePublishDate, setSchedulePublishDate] = useState("");
  const [productSku, setProductSku] = useState("");

  useEffect(() => {
    getCategories({ includeInactive: false })
      .then((cats) => {
        const flatList = [];
        (cats || []).forEach((parent) => {
          if (parent.id && !String(parent.id).startsWith("cat-")) {
            flatList.push({ value: String(parent.id), label: parent.name });
          }
          (parent.children || []).forEach((child) => {
            if (child.id && !String(child.id).startsWith("cat-")) {
              flatList.push({ value: String(child.id), label: `— ${child.name}` });
            }
          });
        });

        if (flatList.length > 0) {
          setCategoryOptions(flatList);
          setForm((prev) => ({ ...prev, category: flatList[0].value }));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    shippingService.getShippingSettings(user.id).then((data) => {
      const enabled = data.filter((o) => o.enabled);
      setShippingOptions(enabled);
      setSelectedShipping(enabled.map((o) => o.id));
      setShippingLoading(false);
    });
  }, [user?.id]);

  const getCategoryTypeKey = () => {
    const selectedObj = categoryOptions.find((c) => c.value === form.category);
    const label = (selectedObj?.label || "").toLowerCase();
    if (label.includes("điện thoại") || label.includes("công nghệ") || label.includes("máy tính") || label.includes("điện tử")) {
      return "tech";
    }
    if (label.includes("thời trang") || label.includes("áo") || label.includes("quần") || label.includes("giày")) {
      return "fashion";
    }
    if (label.includes("gia dụng") || label.includes("nhà cửa") || label.includes("thiết bị")) {
      return "home";
    }
    if (label.includes("mỹ phẩm") || label.includes("sức khỏe") || label.includes("sắc đẹp")) {
      return "beauty";
    }
    if (label.includes("ô tô") || label.includes("xe máy") || label.includes("phụ tùng")) {
      return "auto_parts";
    }
    return "general";
  };

  const catTypeKey = getCategoryTypeKey();

  // Smart suggestion pills per category
  const getSuggestionsForCategory = () => {
    if (catTypeKey === "tech") {
      return [
        { label: "Dung lượng bộ nhớ", options: ["128GB", "256GB", "512GB"] },
        { label: "Màu sắc", options: ["Đen Titanium", "Trắng Xà Cừ", "Xanh Vàng"] },
        { label: "Dung lượng RAM", options: ["8GB", "12GB", "16GB"] },
      ];
    }
    if (catTypeKey === "fashion") {
      return [
        { label: "Màu sắc", options: ["Đen", "Trắng", "Xanh"] },
        { label: "Kích thước", options: ["S", "M", "L", "XL"] },
      ];
    }
    if (catTypeKey === "home") {
      return [
        { label: "Dung tích / Công suất", options: ["3.5 Lít", "5 Lít", "7 Lít"] },
        { label: "Màu sắc", options: ["Bạc", "Đen"] },
      ];
    }
    if (catTypeKey === "beauty") {
      return [
        { label: "Tone màu", options: ["Tone 01 Tự nhiên", "Tone 02 Sáng"] },
        { label: "Dung tích", options: ["30ml", "50ml", "100ml"] },
      ];
    }
    return [
      { label: "Phân loại chính", options: ["Mẫu A", "Mẫu B"] },
      { label: "Phiên bản", options: ["Tiêu chuẩn", "Cao cấp"] },
    ];
  };

  const categorySuggestions = getSuggestionsForCategory();

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

  const handleDetailChange = (e) => {
    const { name, value } = e.target;
    setDetailFields((prev) => ({ ...prev, [name]: value }));
  };

  // Custom attributes handling
  const handleAddCustomAttr = () => {
    setCustomAttributes((prev) => [...prev, { name: "", value: "" }]);
  };

  const handleRemoveCustomAttr = (idx) => {
    setCustomAttributes((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCustomAttrChange = (idx, field, val) => {
    setCustomAttributes((prev) => {
      const next = [...prev];
      next[idx][field] = val;
      return next;
    });
  };

  // Images upload
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

  // Variation builder helpers
  const handleApplySuggestion = (sug) => {
    if (!group1Name) {
      setGroup1Name(sug.label);
      setGroup1Options(sug.options);
      rebuildVariationTable(sug.options, group2Options, hasGroup2);
    } else if (!hasGroup2) {
      setHasGroup2(true);
      setGroup2Name(sug.label);
      setGroup2Options(sug.options);
      rebuildVariationTable(group1Options, sug.options, true);
    } else {
      toast.info("Đã đạt tối đa 2 nhóm phân loại sản phẩm.");
    }
  };

  const handleAddOpt1 = () => {
    const trimmed = inputOpt1.trim();
    if (!trimmed) return;
    if (group1Options.includes(trimmed)) {
      toast.info("Tùy chọn này đã tồn tại");
      return;
    }
    const updated = [...group1Options, trimmed];
    setGroup1Options(updated);
    setInputOpt1("");
    rebuildVariationTable(updated, group2Options, hasGroup2);
  };

  const handleRemoveOpt1 = (opt) => {
    const updated = group1Options.filter((o) => o !== opt);
    setGroup1Options(updated);
    rebuildVariationTable(updated, group2Options, hasGroup2);
  };

  const handleAddOpt2 = () => {
    const trimmed = inputOpt2.trim();
    if (!trimmed) return;
    if (group2Options.includes(trimmed)) {
      toast.info("Tùy chọn này đã tồn tại");
      return;
    }
    const updated = [...group2Options, trimmed];
    setGroup2Options(updated);
    setInputOpt2("");
    rebuildVariationTable(group1Options, updated, true);
  };

  const handleRemoveOpt2 = (opt) => {
    const updated = group2Options.filter((o) => o !== opt);
    setGroup2Options(updated);
    rebuildVariationTable(group1Options, updated, true);
  };

  const rebuildVariationTable = (g1Opts, g2Opts, useG2) => {
    const list1 = g1Opts.length > 0 ? g1Opts : ["Tùy chọn 1"];
    const list2 = useG2 && g2Opts.length > 0 ? g2Opts : [null];

    const newRows = [];
    list1.forEach((v1) => {
      list2.forEach((v2) => {
        const skuTag = v2 ? `${v1}-${v2}` : v1;
        newRows.push({
          val1: v1,
          val2: v2,
          price: form.price || "",
          stock: form.stock || "",
          sku: `SKU-${skuTag.substring(0, 10).toUpperCase().replace(/\s+/g, "")}`,
        });
      });
    });
    setVariationRows(newRows);
  };

  const handleBatchApply = () => {
    if (!batchPrice && !batchStock) {
      toast.info("Vui lòng nhập giá bán hoặc số lượng kho chung để áp dụng hàng loạt.");
      return;
    }
    setVariationRows((prev) =>
      prev.map((r) => ({
        ...r,
        price: batchPrice || r.price,
        stock: batchStock || r.stock,
      }))
    );
    toast.success("Đã áp dụng giá & kho hàng cho tất cả các phân loại!");
  };

  const handleRowChange = (idx, field, val) => {
    setVariationRows((prev) => {
      const next = [...prev];
      next[idx][field] = val;
      return next;
    });
  };

  const tips = [
    { label: "Tên sản phẩm từ 25~120 kí tự", done: form.name.trim().length >= 25 },
    { label: "Chọn Ngành hàng phù hợp", done: !!form.category },
    { label: "Mô tả chi tiết sản phẩm", done: form.description.trim().length >= 50 },
    { label: "Thêm ít nhất 1 hình ảnh sản phẩm", done: filledImages.length >= 1 },
    { label: "Nhập giá bán & số lượng kho", done: !!form.price && !!form.stock },
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
    let rowVersion = null;

    try {
      setSubmitStep("images");
      const uploadedImages = [];
      const imagesToUpload = [...filledImages];

      for (let i = 0; i < imagesToUpload.length; i += 1) {
        try {
          const dataUrl = imagesToUpload[i];
          const file = await dataUrlToFile(dataUrl, `product-${Date.now()}-${i + 1}.jpg`);
          const { url, key } = await uploadProductImage(file);
          if (url || key) {
            uploadedImages.push({
              imageUrl: url,
              storageObjectKey: key || url,
              altText: form.name.trim(),
              isPrimary: i === 0,
              sortOrder: i,
            });
          }
        } catch (imgErr) {
          console.warn("Upload image warning:", imgErr);
        }
      }

      if (!productId) {
        setSubmitStep("create");
        const priceNum = Number(form.price) > 0 ? Number(form.price) : 1000;
        const stockNum = Number(form.stock) >= 0 ? Number(form.stock) : 0;
        const uniqueSku = productSku.trim() || `SKU-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;

        const createPayload = {
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          categoryId: form.category,
          salesChannel: "ECOMMERCE",
          brand: form.brand.trim() || detailFields.brand.trim() || undefined,
          originCountry: "VN",
          skus: [
            {
              skuCode: uniqueSku,
              skuName: form.name.trim() || "Mặc định",
              unitPrice: priceNum,
              price: priceNum,
              currency: "VND",
              salesChannel: "ECOMMERCE",
              isDefault: true,
              attributes: JSON.stringify({ stock: stockNum, condition: form.condition || "new" }),
              barcode: "",
            },
          ],
          images: uploadedImages,
        };

        const created = await createEcommerceProduct(createPayload);
        productId = created.productId ?? created.id;
        rowVersion = created.rowVersion || created.version || created.data?.rowVersion;
        if (!productId) {
          throw new Error("Không nhận được productId từ server.");
        }
        setDraftProductId(productId);
      }

      // Gắn bổ sung từng ảnh vào sản phẩm làm phương án dự phòng & Lưu Cache FE
      if (productId && uploadedImages.length > 0) {
        try {
          const imageMap = JSON.parse(localStorage.getItem("seller_product_images_map") || "{}");
          const urls = uploadedImages.map((img) => img.imageUrl || img.storageObjectKey).filter(Boolean);
          if (urls.length > 0) {
            imageMap[productId] = urls;
            localStorage.setItem("seller_product_images_map", JSON.stringify(imageMap));
          }
        } catch {
          /* ignore */
        }

        for (let i = 0; i < uploadedImages.length; i += 1) {
          try {
            const img = uploadedImages[i];
            await attachProductImage(productId, {
              imageKey: img.storageObjectKey,
              imageUrl: img.imageUrl,
              isCover: img.isPrimary,
              isPrimary: img.isPrimary,
              sortOrder: img.sortOrder,
            }, rowVersion);
          } catch (imgErr) {
            console.warn("Upload image warning:", imgErr);
          }
        }
      }

      if (!hidden) {
        setSubmitStep("review");
        try {
          await submitProductForReview(productId, rowVersion);
        } catch (revErr) {
          console.warn("Submit review warning:", revErr);
        }
      }

      try {
        const localList = JSON.parse(localStorage.getItem("seller_created_products") || "[]");
        const newProd = {
          id: productId,
          name: form.name.trim(),
          category: form.category,
          price: Number(form.price),
          stock: Number(form.stock),
          stockQuantity: Number(form.stock),
          status: hidden ? "DRAFT" : "PENDING",
          moderationStatus: hidden ? "NONE" : "PENDING_MANUAL_REVIEW",
          createdAt: new Date().toISOString(),
          description: form.description.trim(),
          images: filledImages,
          details: detailFields,
          customAttributes,
          productTypeMode,
          variationRows: productTypeMode === "multi" ? variationRows : [],
          isPreOrder,
          preOrderDays,
          sku: productSku.trim() || undefined,
        };
        const updated = [newProd, ...localList.filter((p) => p.id !== productId)];
        localStorage.setItem("seller_created_products", JSON.stringify(updated));
      } catch {
        /* ignore */
      }

      toast.success(
        hidden
          ? "Đã lưu sản phẩm ở chế độ ẩn (DRAFT)"
          : "Đã tạo sản phẩm thành công và chuyển sang chờ duyệt!"
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
          <h4>Gợi ý điền Thông tin</h4>
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
            {/* TAB 1: THÔNG TIN CƠ BẢN */}
            {activeTab === "basic" && (
              <div className="slr-cp__section">
                <h3>Thông tin cơ bản</h3>

                {/* Tên sản phẩm */}
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
                        placeholder="Vui lòng nhập tên sản phẩm..."
                        className={errors.name ? "input-error" : ""}
                      />
                      <span className="slr-cp__counter">
                        {form.name.length}/{NAME_MAX}
                      </span>
                    </div>
                    {errors.name && <span className="field-error">{errors.name}</span>}
                  </div>
                </div>

                {/* Ngành hàng */}
                <div className="slr-cp__row">
                  <span className="slr-cp__row-label">Ngành hàng<span className="required"> *</span></span>
                  <div className="slr-cp__row-body">
                    <div className="slr-cp__inline-field">
                      <Select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        options={categoryOptions}
                        placeholder="Vui lòng chọn ngành hàng phù hợp..."
                      />
                    </div>
                  </div>
                </div>

                {/* Thương hiệu */}
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
                      placeholder="Vui lòng nhập thương hiệu sản phẩm..."
                    />
                  </div>
                </div>

                {/* Mô tả sản phẩm */}
                <div className="slr-cp__row">
                  <label className="slr-cp__row-label" htmlFor="description">
                    Mô tả sản phẩm<span className="required"> *</span>
                  </label>
                  <div className="slr-cp__row-body">
                    <textarea
                      id="description"
                      name="description"
                      rows={6}
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Vui lòng nhập chi tiết mô tả sản phẩm..."
                    />
                    <span className="slr-cp__counter slr-cp__counter--block">
                      {form.description.length}/5000 ký tự
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: THÔNG TIN CHI TIẾT */}
            {activeTab === "detail" && (
              <div className="slr-cp__section">
                <h3>Thông tin chi tiết</h3>
                <p className="slr-cp__subtext">
                  Người bán có thể tự do nhập tên mẫu thuộc tính và các giá trị chi tiết cho sản phẩm của mình.
                </p>

                {/* Mẫu thuộc tính */}
                <div className="slr-cp__row">
                  <label className="slr-cp__row-label">Mẫu thuộc tính</label>
                  <div className="slr-cp__row-body">
                    <input
                      type="text"
                      placeholder="Vui lòng nhập tên mẫu thuộc tính (Ví dụ: Thông số kỹ thuật, Thuộc tính sản phẩm...)"
                      value={customPresetName}
                      onChange={(e) => setCustomPresetName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Các Field chính: Thương hiệu, Xuất xứ, Chất liệu */}
                <div className="slr-cp__detail-grid" style={{ marginTop: "16px" }}>
                  <div className="slr-cp__grid-field">
                    <label>Thương hiệu</label>
                    <input
                      name="brand"
                      value={detailFields.brand}
                      onChange={handleDetailChange}
                      placeholder="Vui lòng nhập thương hiệu sản phẩm..."
                    />
                  </div>

                  <div className="slr-cp__grid-field">
                    <label>Xuất xứ</label>
                    <input
                      name="origin"
                      value={detailFields.origin}
                      onChange={handleDetailChange}
                      placeholder="Vui lòng nhập xuất xứ (Ví dụ: Việt Nam, Nhật Bản...)..."
                    />
                  </div>

                  <div className="slr-cp__grid-field">
                    <label>Chất liệu / Quy cách</label>
                    <input
                      name="material"
                      value={detailFields.material}
                      onChange={handleDetailChange}
                      placeholder="Vui lòng nhập chất liệu hoặc quy cách..."
                    />
                  </div>
                </div>

                {/* Thuộc tính tùy chỉnh thêm */}
                <div className="slr-cp__custom-attr-section">
                  <h4>Thuộc tính bổ sung khác</h4>
                  {customAttributes.map((attr, idx) => (
                    <div key={idx} className="slr-cp__custom-attr-row">
                      <input
                        type="text"
                        placeholder="Tên thuộc tính (Ví dụ: Trọng lượng, Bảo hành...)"
                        value={attr.name}
                        onChange={(e) => handleCustomAttrChange(idx, "name", e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Giá trị thuộc tính (Ví dụ: 500g, 12 tháng...)"
                        value={attr.value}
                        onChange={(e) => handleCustomAttrChange(idx, "value", e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn-del"
                        onClick={() => handleRemoveCustomAttr(idx)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="slr-cp__btn-dashed-sm"
                    onClick={handleAddCustomAttr}
                  >
                    <FaPlus /> Thêm thuộc tính tùy chỉnh
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: THÔNG TIN BÁN HÀNG */}
            {activeTab === "sales" && (
              <div className="slr-cp__section">
                <h3>Thông tin bán hàng</h3>

                {/* 1. UPLOAD HÌNH ẢNH SẢN PHẨM */}
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
                      Đã chọn {filledImages.length}/{MAX_IMAGES} ảnh (tối thiểu 1 hình ảnh)
                    </small>
                  </div>
                </div>

                {/* Chế độ sản phẩm */}
                <div className="slr-cp__row">
                  <label className="slr-cp__row-label">Loại sản phẩm</label>
                  <div className="slr-cp__row-body">
                    <div className="slr-cp__radio-group">
                      <label className={`slr-cp__radio-label ${productTypeMode === "single" ? "checked" : ""}`}>
                        <input
                          type="radio"
                          name="productTypeMode"
                          checked={productTypeMode === "single"}
                          onChange={() => setProductTypeMode("single")}
                        />
                        <span>Sản phẩm 1 loại duy nhất</span>
                      </label>
                      <label className={`slr-cp__radio-label ${productTypeMode === "multi" ? "checked" : ""}`}>
                        <input
                          type="radio"
                          name="productTypeMode"
                          checked={productTypeMode === "multi"}
                          onChange={() => {
                            setProductTypeMode("multi");
                            if (group1Options.length === 0) {
                              rebuildVariationTable(["Tùy chọn A", "Tùy chọn B"], [], false);
                              setGroup1Name("Phân loại 1");
                              setGroup1Options(["Tùy chọn A", "Tùy chọn B"]);
                            }
                          }}
                        />
                        <span>Sản phẩm nhiều loại (Phân loại theo Dung lượng, Màu, Version...)</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* SẢN PHẨM 1 LOẠI DUY NHẤT */}
                {productTypeMode === "single" ? (
                  <>
                    {/* Giá bán */}
                    <div className="slr-cp__row">
                      <label className="slr-cp__row-label" htmlFor="price">
                        Giá bán<span className="required"> *</span>
                      </label>
                      <div className="slr-cp__row-body">
                        <div className="slr-cp__input-prefix">
                          <span className="prefix">₫</span>
                          <input
                            id="price"
                            name="price"
                            inputMode="numeric"
                            value={form.price}
                            onChange={handleChange}
                            placeholder="Vui lòng nhập giá bán sản phẩm..."
                            className={errors.price ? "input-error" : ""}
                          />
                        </div>
                        {errors.price && <span className="field-error">{errors.price}</span>}
                      </div>
                    </div>

                    {/* Kho hàng */}
                    <div className="slr-cp__row">
                      <label className="slr-cp__row-label" htmlFor="stock">
                        Kho hàng (Số lượng)<span className="required"> *</span>
                      </label>
                      <div className="slr-cp__row-body">
                        <input
                          id="stock"
                          name="stock"
                          inputMode="numeric"
                          value={form.stock}
                          onChange={handleChange}
                          placeholder="Vui lòng nhập số lượng tồn kho..."
                          className={errors.stock ? "input-error" : ""}
                        />
                        {errors.stock && <span className="field-error">{errors.stock}</span>}
                      </div>
                    </div>
                  </>
                ) : (
                  /* SẢN PHẨM NHIỀU LOẠI (CLEAN, NO FORCED CLOTHING TAGS, CATEGORY SUGGESTION PILLS & BATCH APPLY) */
                  <div className="slr-cp__variation-section">
                    
                    {/* Smart Quick Suggestion Pills */}
                    <div className="slr-cp__row" style={{ paddingTop: 0 }}>
                      <label className="slr-cp__row-label" style={{ color: "#6b3ba7" }}>Gợi ý mẫu phân loại</label>
                      <div className="slr-cp__row-body">
                        <div className="slr-cp__suggestion-pills">
                          {categorySuggestions.map((sug, sIdx) => (
                            <button
                              key={sIdx}
                              type="button"
                              className="slr-cp__pill-btn"
                              onClick={() => handleApplySuggestion(sug)}
                            >
                              <FaPlus style={{ fontSize: 10 }} /> {sug.label} ({sug.options.join(", ")})
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Cấu hình Nhóm Phân Loại 1 */}
                    <div className="slr-cp__row">
                      <label className="slr-cp__row-label">Nhóm phân loại 1</label>
                      <div className="slr-cp__row-body">
                        <input
                          type="text"
                          value={group1Name}
                          onChange={(e) => setGroup1Name(e.target.value)}
                          placeholder="Tên nhóm 1 (VD: Dung lượng, Màu sắc, Công suất, Tone màu...)"
                          style={{ maxWidth: "340px", fontWeight: 600 }}
                        />

                        <div className="slr-cp__tag-builder" style={{ marginTop: 12 }}>
                          <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>
                            Các tùy chọn thuộc {group1Name || "Nhóm 1"}:
                          </label>
                          <div className="slr-cp__tags" style={{ marginTop: 6, marginBottom: 10 }}>
                            {group1Options.map((opt) => (
                              <span key={opt} className="slr-cp__tag">
                                {opt}
                                <button type="button" onClick={() => handleRemoveOpt1(opt)}>✕</button>
                              </span>
                            ))}
                          </div>
                          <div className="slr-cp__inline-field" style={{ maxWidth: "360px" }}>
                            <input
                              type="text"
                              placeholder="Nhập tùy chọn mới (VD: 128GB, Bạc, 5L...)"
                              value={inputOpt1}
                              onChange={(e) => setInputOpt1(e.target.value)}
                              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddOpt1(); } }}
                            />
                            <button type="button" className="slr-cp__btn-outline-sm" onClick={handleAddOpt1}>
                              + Thêm
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Nút Thêm / Cấu hình Nhóm Phân Loại 2 (Không bắt buộc) */}
                    {!hasGroup2 ? (
                      <div className="slr-cp__row">
                        <div className="slr-cp__row-body">
                          <button
                            type="button"
                            className="slr-cp__btn-dashed"
                            onClick={() => {
                              setHasGroup2(true);
                              setGroup2Name("Nhóm phân loại 2");
                            }}
                          >
                            <FaPlus /> Thêm nhóm phân loại 2 (Không bắt buộc)
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="slr-cp__row">
                        <div className="slr-cp__row-label" style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Nhóm phân loại 2</span>
                        </div>
                        <div className="slr-cp__row-body">
                          <div className="slr-cp__inline-field">
                            <input
                              type="text"
                              value={group2Name}
                              onChange={(e) => setGroup2Name(e.target.value)}
                              placeholder="Tên nhóm 2 (VD: Kích thước, Màu phụ, Phiên bản...)"
                              style={{ maxWidth: "340px", fontWeight: 600 }}
                            />
                            <button
                              type="button"
                              className="slr-cp__btn-link-danger"
                              onClick={() => {
                                setHasGroup2(false);
                                setGroup2Options([]);
                                rebuildVariationTable(group1Options, [], false);
                              }}
                            >
                              Xoá nhóm 2
                            </button>
                          </div>

                          <div className="slr-cp__tag-builder" style={{ marginTop: 12 }}>
                            <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>
                              Các tùy chọn thuộc {group2Name || "Nhóm 2"}:
                            </label>
                            <div className="slr-cp__tags" style={{ marginTop: 6, marginBottom: 10 }}>
                              {group2Options.map((opt) => (
                                <span key={opt} className="slr-cp__tag">
                                  {opt}
                                  <button type="button" onClick={() => handleRemoveOpt2(opt)}>✕</button>
                                </span>
                              ))}
                            </div>
                            <div className="slr-cp__inline-field" style={{ maxWidth: "360px" }}>
                              <input
                                type="text"
                                placeholder="Nhập tùy chọn mới..."
                                value={inputOpt2}
                                onChange={(e) => setInputOpt2(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddOpt2(); } }}
                              />
                              <button type="button" className="slr-cp__btn-outline-sm" onClick={handleAddOpt2}>
                                + Thêm
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* BATCH APPLY BAR (ÁP DỤNG HÀNG LOẠT CHO NGƯỜI BÁN) */}
                    <div className="slr-cp__batch-bar">
                      <div className="slr-cp__batch-title">
                        <FaBolt /> Áp dụng hàng loạt cho tất cả phân loại:
                      </div>
                      <div className="slr-cp__batch-inputs">
                        <input
                          type="number"
                          placeholder="Giá bán chung (₫)..."
                          value={batchPrice}
                          onChange={(e) => setBatchPrice(e.target.value)}
                        />
                        <input
                          type="number"
                          placeholder="Số lượng kho chung..."
                          value={batchStock}
                          onChange={(e) => setBatchStock(e.target.value)}
                        />
                        <button type="button" className="slr-btn-create" onClick={handleBatchApply}>
                          Áp dụng cho tất cả
                        </button>
                      </div>
                    </div>

                    {/* BẢNG CHI TIẾT PHÂN LOẠI HÀNG DỘNG */}
                    <div className="slr-cp__row">
                      <label className="slr-cp__row-label">Bảng phân loại SKU & Giá</label>
                      <div className="slr-cp__row-body">
                        <div className="slr-table-wrap">
                          <table className="slr-table">
                            <thead>
                              <tr>
                                <th>{group1Name || "Phân loại 1"}</th>
                                {hasGroup2 && <th>{group2Name || "Phân loại 2"}</th>}
                                <th>Giá bán (₫)<span className="required"> *</span></th>
                                <th>Kho hàng<span className="required"> *</span></th>
                                <th>Mã SKU Phân loại</th>
                              </tr>
                            </thead>
                            <tbody>
                              {variationRows.map((r, idx) => (
                                <tr key={idx}>
                                  <td><strong>{r.val1}</strong></td>
                                  {hasGroup2 && <td>{r.val2 || "—"}</td>}
                                  <td>
                                    <input
                                      type="number"
                                      placeholder="Nhập giá ₫..."
                                      value={r.price}
                                      onChange={(e) => handleRowChange(idx, "price", e.target.value)}
                                      style={{ width: "120px" }}
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="number"
                                      placeholder="Kho..."
                                      value={r.stock}
                                      onChange={(e) => handleRowChange(idx, "stock", e.target.value)}
                                      style={{ width: "100px" }}
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="text"
                                      placeholder="Mã SKU nội bộ..."
                                      value={r.sku}
                                      onChange={(e) => handleRowChange(idx, "sku", e.target.value)}
                                      style={{ width: "160px" }}
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: VẬN CHUYỂN */}
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
                        Chọn các phương thức vận chuyển muốn áp dụng cho sản phẩm này. Cấu hình chi tiết tại{" "}
                        <Link to="/seller-hub/shipping-settings">Cài Đặt Vận Chuyển</Link>.
                      </small>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: THÔNG TIN KHÁC (Pre-order, Condition, Schedule, SKU) */}
            {activeTab === "other" && (
              <div className="slr-cp__section">
                <h3>Thông tin khác</h3>

                {/* Hàng Đặt Trước */}
                <div className="slr-cp__row">
                  <label className="slr-cp__row-label">Hàng Đặt Trước</label>
                  <div className="slr-cp__row-body">
                    <div className="slr-cp__radio-group">
                      <label className={`slr-cp__radio-label ${!isPreOrder ? "checked" : ""}`}>
                        <input
                          type="radio"
                          name="preOrderRadio"
                          checked={!isPreOrder}
                          onChange={() => setIsPreOrder(false)}
                        />
                        <span>Không</span>
                      </label>
                      <label className={`slr-cp__radio-label ${isPreOrder ? "checked" : ""}`}>
                        <input
                          type="radio"
                          name="preOrderRadio"
                          checked={isPreOrder}
                          onChange={() => setIsPreOrder(true)}
                        />
                        <span>Đồng ý</span>
                      </label>
                    </div>
                    {isPreOrder ? (
                      <div className="slr-cp__subrow">
                        <span>Tôi sẽ gửi hàng trong</span>
                        <input
                          type="number"
                          min="7"
                          max="30"
                          value={preOrderDays}
                          onChange={(e) => setPreOrderDays(e.target.value)}
                          style={{ width: "80px", textAlign: "center" }}
                        />
                        <span>ngày (tối thiểu 7, tối đa 30 ngày)</span>
                      </div>
                    ) : (
                      <p className="slr-cp__hint-text">
                        Tôi sẽ gửi hàng trong 3 ngày (không bao gồm các ngày nghỉ lễ, Tết và những ngày đơn vị vận chuyển không làm việc).
                      </p>
                    )}
                  </div>
                </div>

                {/* Tình trạng */}
                <div className="slr-cp__row">
                  <label className="slr-cp__row-label">Tình trạng</label>
                  <div className="slr-cp__row-body">
                    <div style={{ maxWidth: "240px" }}>
                      <Select
                        name="condition"
                        value={form.condition}
                        onChange={handleChange}
                        options={CONDITIONS}
                      />
                    </div>
                  </div>
                </div>

                {/* Cài đặt thời gian */}
                <div className="slr-cp__row">
                  <label className="slr-cp__row-label">Cài đặt thời gian</label>
                  <div className="slr-cp__row-body">
                    <input
                      type="datetime-local"
                      value={schedulePublishDate}
                      onChange={(e) => setSchedulePublishDate(e.target.value)}
                      style={{ maxWidth: "280px" }}
                    />
                    <small className="slr-cp__hint-text">
                      Để trống nếu muốn đăng bán ngay sau khi được duyệt. Chọn ngày giờ nếu muốn hẹn giờ xuất bản sản phẩm.
                    </small>
                  </div>
                </div>

                {/* SKU sản phẩm */}
                <div className="slr-cp__row">
                  <label className="slr-cp__row-label">SKU sản phẩm</label>
                  <div className="slr-cp__row-body">
                    <input
                      type="text"
                      placeholder="Vui lòng nhập mã SKU nội bộ của sản phẩm (Không bắt buộc)..."
                      value={productSku}
                      onChange={(e) => setProductSku(e.target.value)}
                      style={{ maxWidth: "360px" }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions Footer */}
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
                Lưu & Ẩn
              </button>
              <button type="submit" className="slr-btn-create" disabled={submitting}>
                {submitStep ? SUBMIT_STEP_LABELS[submitStep] : "Gửi duyệt"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
