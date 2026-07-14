import { useEffect, useMemo, useState } from "react";
import StaffPageHeader from "../../../components/staff/staffPageHeader";
import StaffKpiCard from "../../../components/staff/staffKpiCard";
import { getStaffCategories } from "../../../services/staffService";
import "./index.scss";

const StaffCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    getStaffCategories().then((data) => {
      setCategories(data);
      setLoading(false);
    });
  }, []);

  const stats = useMemo(
    () => ({
      total: categories.length,
      active: categories.filter((c) => c.status === "Hoạt động").length,
      products: categories.reduce((s, c) => s + (c.productCount || 0), 0),
      roots: categories.filter((c) => c.parent === "—").length,
    }),
    [categories]
  );

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) =>
      [c.id, c.name, c.parent].some((v) => String(v).toLowerCase().includes(q))
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
        <p className="stf-categories__empty">Đang tải...</p>
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
                  <td><code>{c.id}</code></td>
                  <td><strong>{c.name}</strong></td>
                  <td>{c.parent}</td>
                  <td>{c.sortOrder}</td>
                  <td>{c.productCount?.toLocaleString("vi-VN")}</td>
                  <td>
                    <span className={`stf-categories__status ${c.status === "Hoạt động" ? "ok" : "off"}`}>
                      {c.status}
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
