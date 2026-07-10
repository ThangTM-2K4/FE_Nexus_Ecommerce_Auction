import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaSearch, FaTruck } from "react-icons/fa";
import SellerOrderDetailModal from "../sellerOrderDetailModal";
import { shippingCarriers, formatCurrency } from "../../../data/sellerMockData";
import { ORDER_TABS, tabMatches, statusLabel, statusClass } from "../../../utils/sellerOrderStatus";
import { exportCsv, todayStamp } from "../../../utils/exportCsv";
import "./index.scss";

const carrierName = (code) =>
  shippingCarriers.find((c) => c.code === code)?.name ?? code ?? "—";

// "11/06/2026 14:32" -> Date
const parseOrderDate = (str) => {
  const [d, m, y] = String(str).split(" ")[0].split("/").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

/**
 * Bảng đơn hàng kiểu Shopee: tab trạng thái ngang + toolbar tìm kiếm/ngày/xuất
 * + dòng tổng số đơn + sắp xếp + Giao Hàng Loạt. Dùng chung cho Đơn hàng và
 * Quản lý vận chuyển.
 */
export default function SellerOrderBoard({ orders, exportName = "don-hang", initialTab = "all" }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState("newest");
  const [selected, setSelected] = useState(null);

  // Số đếm mỗi tab tính trên toàn bộ danh sách (giống Shopee).
  const tabCounts = useMemo(() => {
    const map = {};
    ORDER_TABS.forEach((t) => {
      map[t.key] = t.statuses === null ? orders.length : orders.filter((o) => tabMatches(t, o.status)).length;
    });
    return map;
  }, [orders]);

  const visible = useMemo(() => {
    const tab = ORDER_TABS.find((t) => t.key === activeTab) ?? ORDER_TABS[0];
    const q = search.trim().toLowerCase();
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;

    let list = orders.filter((o) => {
      if (!tabMatches(tab, o.status)) return false;
      if (q && !`${o.id} ${o.customer} ${o.product}`.toLowerCase().includes(q)) return false;
      if (from || to) {
        const d = parseOrderDate(o.date);
        if (from && d < from) return false;
        if (to && d > new Date(to.getTime() + 86_400_000 - 1)) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) =>
      sort === "newest"
        ? parseOrderDate(b.date) - parseOrderDate(a.date)
        : parseOrderDate(a.date) - parseOrderDate(b.date)
    );
    return list;
  }, [orders, activeTab, search, dateFrom, dateTo, sort]);

  const handleExport = () => {
    const headers = ["Mã đơn", "Khách hàng", "Điện thoại", "Sản phẩm", "SL", "Giá trị", "Đơn vị VC", "Mã vận đơn", "Trạng thái", "Ngày"];
    const rows = visible.map((o) => [
      o.id, o.customer, o.phone, o.product, o.qty ?? 1, o.amount,
      carrierName(o.carrier), o.tracking, statusLabel(o.status), o.date,
    ]);
    exportCsv(`${exportName}-${todayStamp()}.csv`, headers, rows);
    toast.success(`Đã xuất ${visible.length} đơn hàng ra file CSV`);
  };

  const resetFilters = () => {
    setSearch("");
    setDateFrom("");
    setDateTo("");
  };

  return (
    <div className="slr-ob">
      <nav className="slr-ob__tabs" role="tablist">
        {ORDER_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={activeTab === t.key}
            className={`slr-ob__tab ${activeTab === t.key ? "active" : ""}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
            {tabCounts[t.key] > 0 && <span className="slr-ob__count">{tabCounts[t.key]}</span>}
          </button>
        ))}
      </nav>

      <div className="slr-ob__toolbar">
        <div className="slr-ob__search">
          <FaSearch />
          <input
            type="text"
            placeholder="Tìm đơn hàng (mã đơn, khách hàng, sản phẩm)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="slr-ob__daterange">
          <span>Ngày đặt hàng</span>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <em>–</em>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
        {(search || dateFrom || dateTo) && (
          <button type="button" className="slr-btn slr-btn--ghost" onClick={resetFilters}>Đặt lại</button>
        )}
        <button type="button" className="slr-btn slr-btn--ghost" onClick={handleExport}>Xuất</button>
      </div>

      <div className="slr-ob__subbar">
        <strong>{visible.length} Đơn hàng</strong>
        <div className="slr-ob__subbar-actions">
          <label className="slr-ob__sort">
            Sắp xếp theo
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="newest">Ngày đặt đơn mới nhất</option>
              <option value="oldest">Ngày đặt đơn cũ nhất</option>
            </select>
          </label>
          <Link to="/seller-hub/shipping-batch" className="slr-btn slr-btn--danger">
            <FaTruck /> Giao Hàng Loạt
          </Link>
        </div>
      </div>

      <div className="slr-table-wrap">
        <table className="slr-table slr-table--compact">
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Tổng đơn hàng</th>
              <th>Trạng thái</th>
              <th>Vận chuyển</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((o) => (
              <tr key={o.id} className="slr-row-clickable" onClick={() => setSelected(o)}>
                <td>
                  <div className="slr-product-cell">
                    <img src={o.image} alt="" />
                    <div className="slr-ob__product-meta">
                      <span>{o.product}</span>
                      <small>{o.id} · {o.customer}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <strong>{formatCurrency(o.amount)}</strong>
                  <small className="slr-ob__qty">x{o.qty ?? 1}</small>
                </td>
                <td>
                  <span className={`slr-status slr-status--${statusClass(o.status)}`}>
                    {statusLabel(o.status)}
                  </span>
                </td>
                <td>{carrierName(o.carrier)}</td>
                <td>
                  <button
                    type="button"
                    className="slr-btn-plain"
                    onClick={(e) => { e.stopPropagation(); setSelected(o); }}
                  >
                    Xem chi tiết
                  </button>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={5} className="muted" style={{ textAlign: "center", padding: "32px" }}>
                  Không có đơn hàng phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && <SellerOrderDetailModal order={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
