import { useEffect, useMemo, useState } from "react";
import StaffPageHeader from "../../../components/staff/staffPageHeader";
import StaffKpiCard from "../../../components/staff/staffKpiCard";
import api from "../../../config/api";
import { unwrapPagedList } from "../../../utils/apiResponse";
import "./index.scss";

const STATUS_CLASS = {
  "Đang xử lý": "processing",
  "Đang giao": "shipping",
  "Hoàn thành": "done",
  "Đã hủy": "cancelled",
  PENDING: "processing",
  CONFIRMED: "processing",
  PROCESSING: "processing",
  SHIPPING: "shipping",
  DELIVERED: "done",
  COMPLETED: "done",
  CANCELLED: "cancelled",
  CANCEL: "cancelled",
};

const STATUS_LABELS = {
  PENDING: "Chờ xử lý",
  CONFIRMED: "Đang xử lý",
  PROCESSING: "Đang xử lý",
  SHIPPING: "Đang giao",
  DELIVERED: "Hoàn thành",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
  CANCEL: "Đã hủy",
};

const FILTERS = [
  { id: "all", label: "Tất cả" },
  { id: "PENDING", label: "Chờ xử lý" },
  { id: "PROCESSING", label: "Đang xử lý" },
  { id: "SHIPPING", label: "Đang giao" },
  { id: "COMPLETED", label: "Hoàn thành" },
  { id: "CANCELLED", label: "Đã hủy" },
];

const StaffOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/orders", { params: { page: 1, pageSize: 100 } });
        const paged = unwrapPagedList(data);
        const mapped = (paged.items || []).map(order => ({
          ...order,
          id: order.id || order.orderId,
          buyer: order.buyerName || order.customerName || order.userFullName || "—",
          seller: order.sellerName || order.shopName || "—",
          payment: order.paymentMethod || order.paymentType || order.payment || "—",
          shipping: order.shippingMethod || order.shippingType || order.shipping || "—",
          total: order.totalAmount || order.totalPrice || order.total,
          status: STATUS_LABELS[order.status] || order.status,
          createdAt: order.createdAt || order.createdDate || order.orderDate,
        }));
        setOrders(mapped);
      } catch (err) {
        console.error("Error loading orders:", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  const stats = useMemo(
    () => ({
      total: orders.length,
      processing: orders.filter((o) => o.status === "Đang xử lý" || o.status === "Chờ xử lý").length,
      shipping: orders.filter((o) => o.status === "Đang giao").length,
      done: orders.filter((o) => o.status === "Hoàn thành").length,
    }),
    [orders]
  );

  const shown = useMemo(() => {
    let list = orders;
    if (filter !== "all") list = list.filter((o) => o.status === filter);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((o) =>
        [o.id, o.buyer, o.seller, o.payment, o.shipping].some((v) => String(v || "").toLowerCase().includes(q))
      );
    }
    return list;
  }, [orders, filter, query]);

  const openDetail = async (order) => {
    try {
      const { data } = await api.get(`/orders/${order.id}`);
      const detailData = data?.data || data;
      setDetail(detailData || order);
    } catch {
      setDetail(order);
    }
  };

  return (
    <div className="stf-orders">
      <StaffPageHeader
        kicker="Tra cứu"
        title="Danh sách đơn hàng"
        subtitle="Chỉ xem đơn hàng — không được tạo đơn hoặc thực hiện refund."
      />

      <div className="stf-orders__kpis">
        <StaffKpiCard label="Tổng đơn" value={String(stats.total)} hint="Mẫu dữ liệu" />
        <StaffKpiCard label="Đang xử lý" value={String(stats.processing)} hint="Chờ xác nhận" warn={stats.processing > 0} />
        <StaffKpiCard label="Đang giao" value={String(stats.shipping)} hint="Đã bàn giao VC" />
        <StaffKpiCard label="Hoàn thành" value={String(stats.done)} hint="Đã giao thành công" highlight />
      </div>

      <div className="stf-orders__toolbar">
        <div className="stf-orders__filters">
          {FILTERS.map((f) => (
            <button key={f.id} type="button" className={filter === f.id ? "active" : ""} onClick={() => setFilter(f.id)}>
              {f.label}
            </button>
          ))}
        </div>
        <input
          type="search"
          placeholder="Tìm mã đơn, người mua, seller..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="stf-orders__empty">Đang tải...</p>
      ) : shown.length === 0 ? (
        <p className="stf-orders__empty">Không có đơn hàng nào khớp bộ lọc.</p>
      ) : (
        <div className="stf-orders__table-wrap">
          <table className="stf-orders__table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Người mua</th>
                <th>Người bán</th>
                <th>Thanh toán</th>
                <th>Vận chuyển</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {shown.map((order) => (
                <tr key={order.id}>
                  <td><strong>{order.id}</strong></td>
                  <td>{order.buyer}</td>
                  <td>{order.seller}</td>
                  <td>{order.payment}</td>
                  <td>{order.shipping}</td>
                  <td className="stf-orders__amount">{order.total ? Number(order.total).toLocaleString("vi-VN") + "đ" : "—"}</td>
                  <td>
                    <span className={`stf-orders__status stf-orders__status--${STATUS_CLASS[order.status] || "default"}`}>
                      {order.status}
                    </span>
                  </td>
                  <td><small>{order.createdAt}</small></td>
                  <td>
                    <button type="button" className="stf-orders__view" onClick={() => openDetail(order)}>
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detail && (
        <div className="stf-orders__overlay" onClick={() => setDetail(null)} role="presentation">
          <div className="stf-orders__panel" onClick={(e) => e.stopPropagation()} role="dialog">
            <header>
              <h3>Đơn {detail.id}</h3>
              <button type="button" onClick={() => setDetail(null)}>✕</button>
            </header>
            <dl>
              <dt>Người mua</dt><dd>{detail.buyer}</dd>
              <dt>Người bán</dt><dd>{detail.seller}</dd>
              <dt>Thanh toán</dt><dd>{detail.payment}</dd>
              <dt>Vận chuyển</dt><dd>{detail.shipping}</dd>
              <dt>Tổng tiền</dt><dd>{detail.total}</dd>
              <dt>Trạng thái</dt><dd>{detail.status}</dd>
              <dt>Ngày tạo</dt><dd>{detail.createdAt}</dd>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffOrders;
