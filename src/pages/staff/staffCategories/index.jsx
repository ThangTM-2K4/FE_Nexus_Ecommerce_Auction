import { useEffect, useMemo, useState } from "react";
import StaffPageHeader from "../../../components/staff/staffPageHeader";
import StaffKpiCard from "../../../components/staff/staffKpiCard";
import { getCategoryTree } from "../../../services/catalogService";
import { getAdminProducts } from "../../../services/adminProductService";
import "./index.scss";

const StaffCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let mounted = true;
    const loadCategoriesAndProducts = async () => {
      setLoading(true);
      try {
        const [catData, prodRes] = await Promise.all([
          getCategoryTree(),
          getAdminProducts().catch(() => ({ items: [] })),
        ]);

        const rawCats = catData || [];
        const prodItems = prodRes?.items || [];
        let localProds = [];
        try {
          localProds = JSON.parse(localStorage.getItem("seller_created_products") || "[]");
        } catch {
          /* ignore */
        }
        const allProducts = [...prodItems, ...localProds];

        const enrichedCats = rawCats.map((cat) => {
          const catIdStr = String(cat.id || cat.categoryId || "").toLowerCase();
          const catNameStr = String(cat.name || cat.categoryName || "").trim().toLowerCase();

          const matchedProds = allProducts.filter((p) => {
            const pCatId = String(p.categoryId || p.category || "").toLowerCase();
            const pCatName = String(p.categoryName || p.category || "").trim().toLowerCase();
            return (
              (pCatId && catIdStr && pCatId === catIdStr) ||
              (pCatName && catNameStr && (pCatName === catNameStr || pCatName.includes(catNameStr) || catNameStr.includes(pCatName)))
            );
          });

          const count = matchedProds.length;
          const existingCount = Number(cat.productCount || cat.count || 0);

          return {
            ...cat,
            productCount: existingCount > count ? existingCount : count,
          };
        });

        if (mounted) {
          setCategories(enrichedCats);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setCategories([]);
          setLoading(false);
        }
      }
    };

    loadCategoriesAndProducts();
    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(
    () => ({
      total: categories.length,
      active: categories.filter((c) => c.isActive !== false).length,
      products: categories.reduce((s, c) => s + (c.productCount || 0), 0),
      roots: categories.filter((c) => !c.parentId && !c.parent).length,
    }),
    [categories]
  );

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) =>
      [c.id, c.name, c.categoryName].some((v) => String(v || "").toLowerCase().includes(q))
    );
  }, [categories, query]);

  return (
    <div className="stf-categories">
      <StaffPageHeader
        kicker="Tra cứu"
        title="Danh mục sản phẩm"
        subtitle="Chỉ xem danh sách danh mục — không được tạo, sửa hoặc xoá."
      />

      <div className="stf-categories__kpis">
        <StaffKpiCard label="Tổng danh mục" value={String(stats.total)} hint="Bao gồm danh mục con" />
        <StaffKpiCard label="Đang hoạt động" value={String(stats.active)} hint="Trạng thái Hoạt động" highlight />
        <StaffKpiCard label="Danh mục gốc" value={String(stats.roots)} hint="Không có parent" />
        <StaffKpiCard label="Sản phẩm" value={stats.products.toLocaleString("vi-VN")} hint="Tổng SP gắn danh mục" />
      </div>

      <div className="stf-categories__toolbar">
        <input
          type="search"
          placeholder="Tìm mã, tên danh mục..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="stf-categories__empty">Đang tải danh mục...</p>
      ) : (
        <div className="stf-categories__table-wrap">
          <table className="stf-categories__table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Tên danh mục</th>
                <th>Danh mục cha</th>
                <th>Thứ tự</th>
                <th>Số SP</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((c) => (
                <tr key={c.id}>
                  <td><code>{String(c.id).slice(0, 8)}</code></td>
                  <td><strong>{c.name || c.categoryName}</strong></td>
                  <td>{c.parentId ? "—" : "Danh mục gốc"}</td>
                  <td>{c.sortOrder || c.order || "—"}</td>
                  <td style={{ fontWeight: 600, color: c.productCount > 0 ? "#2e7d32" : "#64748b" }}>
                    {c.productCount?.toLocaleString("vi-VN") || 0}
                  </td>
                  <td>
                    <span className={`stf-categories__status ${c.isActive !== false ? "ok" : "off"}`}>
                      {c.isActive !== false ? "Hoạt động" : "Tắt"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StaffCategories;
