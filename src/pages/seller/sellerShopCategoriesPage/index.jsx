import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import PageHeader from "../../../components/sellerdashboard/sellerPageHeader";
import { useAuth } from "../../../context/AuthContext";
import * as productService from "../../../services/productService";
import { productCategories } from "../../../data/auctionMockData";
import Select from "../../../components/common/select";

const CATEGORY_OPTIONS = productCategories.map((c) => ({ value: c.id, label: c.label }));

const CATEGORY_KEYWORDS = {
  tech: ["điện thoại", "iphone", "macbook", "laptop", "tai nghe", "đồng hồ thông minh", "máy ảnh", "camera", "tivi", "sạc", "loa"],
  fashion: ["áo", "quần", "giày", "dép", "túi", "vest", "đầm", "sneaker", "váy", "mũ"],
  art: ["tranh", "tượng", "gốm", "sứ", "đồ cổ", "thư pháp", "điêu khắc"],
  car: ["ô tô", "xe hơi", "xe máy", "moto", "lốp", "phụ tùng", "vành"],
};

const guessCategory = (product) => {
  const text = `${product.name || ""} ${product.description || ""}`.toLowerCase();
  for (const cat of productCategories) {
    const keywords = CATEGORY_KEYWORDS[cat.id] || [];
    if (keywords.some((k) => text.includes(k))) return cat.id;
  }
  return null;
};

export default function ShopCategoriesPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = () => {
    if (!user?.id) return;
    productService.getMyProducts(user.id).then((data) => {
      setProducts(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const countFor = (categoryId) => products.filter((p) => p.category === categoryId).length;

  const handleCategoryChange = async (product, category) => {
    if (category === product.category) return;
    await productService.updateProductCategory(user.id, product.id, category);
    toast.success("Đã cập nhật danh mục sản phẩm");
    loadProducts();
  };

  const handleAutoClassify = async () => {
    const suggestions = products
      .map((p) => ({ product: p, guess: guessCategory(p) }))
      .filter(({ product, guess }) => guess && guess !== product.category);

    if (suggestions.length === 0) {
      toast.info("Không có sản phẩm nào cần phân loại lại");
      return;
    }

    await Promise.all(
      suggestions.map(({ product, guess }) => productService.updateProductCategory(user.id, product.id, guess))
    );
    toast.success(`Đã tự động phân loại lại ${suggestions.length} sản phẩm`);
    loadProducts();
  };

  return (
    <div className="slr-page">
      <PageHeader
        title="Danh Mục Của Shop"
        subtitle="Nhóm sản phẩm theo danh mục để người mua dễ tìm kiếm"
        actions={
          <button type="button" className="slr-btn-outline" onClick={handleAutoClassify} disabled={loading}>
            Tự động phân loại
          </button>
        }
      />

      <section className="slr-section">
        <div className="slr-metrics-grid slr-metrics-grid--5">
          {productCategories.map((c, i) => (
            <div key={c.id} className="slr-panel-card" style={{ animationDelay: `${i * 60}ms` }}>
              <h4>{c.label}</h4>
              <img
                src={c.image}
                alt={c.label}
                style={{ width: "100%", aspectRatio: "16 / 9", objectFit: "cover", borderRadius: 8 }}
              />
              <p className="slr-shop-profile__value">{countFor(c.id)} sản phẩm</p>
            </div>
          ))}
        </div>

        <div className="slr-panel-card">
          <h4>Gán danh mục cho sản phẩm</h4>
          {loading ? (
            <p>Đang tải...</p>
          ) : products.length === 0 ? (
            <p className="slr-shop-profile__value">
              Chưa có sản phẩm nào. <Link to="/seller-hub/products/create">Tạo sản phẩm</Link> để bắt đầu.
            </p>
          ) : (
            <div className="slr-table-wrap">
              <table className="slr-table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Danh mục hiện tại</th>
                    <th>Đổi danh mục</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>{p.name || p.id}</td>
                      <td>{productCategories.find((c) => c.id === p.category)?.label || "Chưa phân loại"}</td>
                      <td>
                        <Select
                          value={p.category || ""}
                          onChange={(e) => handleCategoryChange(p, e.target.value)}
                          options={CATEGORY_OPTIONS}
                          placeholder="Chưa phân loại"
                          className="common-select--sm"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="slr-wallet-note">
            Bấm "Tự động phân loại" để hệ thống gợi ý danh mục dựa trên tên sản phẩm, hoặc tự chỉnh sửa từng
            dòng ở bảng trên. Xem đầy đủ tại <Link to="/seller-hub/products">Quản lý sản phẩm</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}
