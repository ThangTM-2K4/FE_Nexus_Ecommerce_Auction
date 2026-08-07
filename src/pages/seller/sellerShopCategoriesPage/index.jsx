import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import PageHeader from "../../../components/sellerdashboard/sellerPageHeader";
import { getMyEcommerceProducts } from "../../../services/ecommerceProductService";
import { getCategories, getCategoryLabel, toSelectOptions } from "../../../services/categoryService";
import Select from "../../../components/common/select";

export default function ShopCategoriesPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const categoryOptions = useMemo(() => toSelectOptions(categories), [categories]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await getMyEcommerceProducts();
      let myProds = res?.items || [];
      let localProds = [];
      try {
        localProds = JSON.parse(localStorage.getItem("seller_created_products") || "[]");
      } catch {
        /* ignore */
      }

      // Gộp các sản phẩm local chưa có trên API
      const combined = [...myProds];
      localProds.forEach((lp) => {
        const exists = combined.some((p) => String(p.id).toLowerCase() === String(lp.id).toLowerCase());
        if (!exists) combined.push(lp);
      });

      setProducts(combined);
    } catch (err) {
      try {
        const localProds = JSON.parse(localStorage.getItem("seller_created_products") || "[]");
        setProducts(localProds);
      } catch {
        setProducts([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCategories().then((res) => {
      if (res.ok) setCategories(res.items);
      else toast.error(res.error || "Không tải được danh mục");
      setCategoriesLoading(false);
    });
    loadProducts();
  }, []);

  const countFor = (cat) => {
    const catId = String(cat.id || cat.categoryId || "").toLowerCase();
    const catName = String(cat.name || cat.categoryName || "").trim().toLowerCase();

    return products.filter((p) => {
      const pCatId = String(p.categoryId || p.category || "").toLowerCase();
      const pCatName = String(p.categoryName || p.category || "").trim().toLowerCase();

      return (
        (pCatId && catId && pCatId === catId) ||
        (pCatName && catName && (pCatName === catName || pCatName.includes(catName) || catName.includes(pCatName)))
      );
    }).length;
  };

  const handleCategoryChange = (product, newCatId) => {
    if (newCatId === product.category || newCatId === product.categoryId) return;
    const selectedCatObj = categories.find((c) => String(c.id).toLowerCase() === String(newCatId).toLowerCase());
    const newCatName = selectedCatObj?.name || selectedCatObj?.label || newCatId;

    // Cập nhật state local
    setProducts((prev) =>
      prev.map((p) =>
        String(p.id).toLowerCase() === String(product.id).toLowerCase()
          ? { ...p, category: newCatId, categoryId: newCatId, categoryName: newCatName }
          : p
      )
    );

    // Cập nhật localStorage
    try {
      const localList = JSON.parse(localStorage.getItem("seller_created_products") || "[]");
      const updatedLocal = localList.map((p) =>
        String(p.id).toLowerCase() === String(product.id).toLowerCase()
          ? { ...p, category: newCatId, categoryId: newCatId, categoryName: newCatName }
          : p
      );
      localStorage.setItem("seller_created_products", JSON.stringify(updatedLocal));
    } catch {
      /* ignore */
    }

    toast.success(`Đã gán danh mục "${newCatName}" cho sản phẩm!`);
  };

  const handleAutoClassify = () => {
    if (products.length === 0) {
      toast.info("Chưa có sản phẩm nào để tự động phân loại.");
      return;
    }
    // Tự động phân loại các sản phẩm dựa theo tên sản phẩm
    let classifiedCount = 0;
    const updatedProds = products.map((p) => {
      const pName = String(p.name || p.productName || p.title || "").toLowerCase();
      const matchedCat = categories.find((c) => pName.includes(c.name.toLowerCase()));
      if (matchedCat) {
        classifiedCount++;
        return {
          ...p,
          category: matchedCat.id,
          categoryId: matchedCat.id,
          categoryName: matchedCat.name,
        };
      }
      return p;
    });

    setProducts(updatedProds);
    toast.success(`Đã tự động phân loại thành công ${classifiedCount} sản phẩm!`);
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
            ⚡ Tự động phân loại
          </button>
        }
      />

      <section className="slr-section">
        <div className="slr-metrics-grid slr-metrics-grid--5">
          {categoriesLoading ? (
            <p>Đang tải danh mục...</p>
          ) : (
            categories.map((c, i) => {
              const productCount = countFor(c);
              return (
                <div
                  key={c.id}
                  className="slr-panel-card"
                  style={{
                    animationDelay: `${i * 60}ms`,
                    borderColor: productCount > 0 ? "#86efac" : undefined,
                    background: productCount > 0 ? "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)" : undefined,
                  }}
                >
                  <h4 style={{ color: productCount > 0 ? "#15803d" : undefined }}>{c.name}</h4>
                  <p className="slr-shop-profile__value" style={{ color: productCount > 0 ? "#166534" : undefined, fontWeight: productCount > 0 ? 700 : undefined }}>
                    {productCount} sản phẩm
                  </p>
                </div>
              );
            })
          )}
        </div>

        <div className="slr-panel-card" style={{ marginTop: "24px" }}>
          <h4 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>Gán danh mục cho sản phẩm</h4>
          {loading ? (
            <p>Đang tải danh sách sản phẩm...</p>
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
                  {products.map((p) => {
                    const currentCatLabel =
                      p.categoryName ||
                      getCategoryLabel(categories, p.category || p.categoryId) ||
                      "Chưa phân loại";

                    return (
                      <tr key={p.id}>
                        <td>
                          <strong style={{ fontSize: "14px", color: "#1e293b" }}>{p.name || p.productName || p.id}</strong>
                          <div style={{ fontSize: "12px", color: "#64748b" }}>Mã SP: {p.id}</div>
                        </td>
                        <td>
                          <span
                            style={{
                              padding: "4px 10px",
                              borderRadius: "12px",
                              background: currentCatLabel !== "Chưa phân loại" ? "#e0e7ff" : "#f1f5f9",
                              color: currentCatLabel !== "Chưa phân loại" ? "#3730a3" : "#64748b",
                              fontSize: "12px",
                              fontWeight: 600,
                            }}
                          >
                            {currentCatLabel}
                          </span>
                        </td>
                        <td>
                          <Select
                            value={p.category || p.categoryId || ""}
                            onChange={(e) => handleCategoryChange(p, e.target.value)}
                            options={categoryOptions}
                            placeholder={categoriesLoading ? "Đang tải..." : "Chưa phân loại"}
                            disabled={categoriesLoading || categoryOptions.length === 0}
                            className="common-select--sm"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <p className="slr-wallet-note" style={{ marginTop: "16px" }}>
            Chọn danh mục từ hệ thống. Xem đầy đủ danh sách tại{" "}
            <Link to="/seller-hub/products">Quản lý sản phẩm</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}
