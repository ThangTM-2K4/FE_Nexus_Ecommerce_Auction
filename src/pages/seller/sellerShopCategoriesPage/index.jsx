import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import PageHeader from "../../../components/sellerdashboard/sellerPageHeader";
import { useAuth } from "../../../context/AuthContext";
import * as productService from "../../../services/productService";
import { getCategories, getCategoryLabel, toSelectOptions } from "../../../services/categoryService";
import Select from "../../../components/common/select";

export default function ShopCategoriesPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const categoryOptions = useMemo(() => toSelectOptions(categories), [categories]);

  const loadProducts = () => {
    if (!user?.id) return;
    productService.getMyProducts(user.id).then((data) => {
      setProducts(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    getCategories().then((res) => {
      if (res.ok) setCategories(res.items);
      else toast.error(res.error || "Không tải được danh mục");
      setCategoriesLoading(false);
    });
  }, []);

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

  const handleAutoClassify = () => {
    toast.info("Tính năng tự động phân loại đang cập nhật theo danh mục hệ thống (UUID)");
  };

  return (
    <div className="slr-page">
      <PageHeader
        title="Danh Mục Của Shop"
        subtitle="Nhóm sản phẩm theo danh mục để người mua dễ tìm kiếm"
        actions={
          <button
            type="button"
            className="slr-btn-outline"
            onClick={handleAutoClassify}
            disabled={loading || categoriesLoading}
          >
            Tự động phân loại
          </button>
        }
      />

      <section className="slr-section">
        <div className="slr-metrics-grid slr-metrics-grid--5">
          {categoriesLoading ? (
            <p>Đang tải danh mục...</p>
          ) : (
            categories.map((c, i) => (
              <div key={c.id} className="slr-panel-card" style={{ animationDelay: `${i * 60}ms` }}>
                <h4>{c.name}</h4>
                <p className="slr-shop-profile__value">{countFor(c.id)} sản phẩm</p>
              </div>
            ))
          )}
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
                      <td>{getCategoryLabel(categories, p.category) || "Chưa phân loại"}</td>
                      <td>
                        <Select
                          value={p.category || ""}
                          onChange={(e) => handleCategoryChange(p, e.target.value)}
                          options={categoryOptions}
                          placeholder={categoriesLoading ? "Đang tải..." : "Chưa phân loại"}
                          disabled={categoriesLoading || categoryOptions.length === 0}
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
            Chọn danh mục từ hệ thống (UUID thật). Xem đầy đủ tại{" "}
            <Link to="/seller-hub/products">Quản lý sản phẩm</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}
