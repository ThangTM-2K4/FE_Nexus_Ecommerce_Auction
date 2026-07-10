// Single source of truth for order status metadata across the Seller Hub
// (Đơn hàng, Quản lý vận chuyển, Giao hàng loạt). Keeps Vietnamese labels
// and the CSS status-chip modifier in sync everywhere.

export const ORDER_STATUS = {
  Pending: { label: "Chờ xác nhận", cls: "pending" },
  Confirmed: { label: "Đã xác nhận", cls: "confirmed" },
  AwaitingPickup: { label: "Chờ lấy hàng", cls: "awaiting" },
  Shipping: { label: "Đang giao hàng", cls: "shipping" },
  Delivered: { label: "Đã giao hàng", cls: "delivered" },
  Completed: { label: "Hoàn thành", cls: "completed" },
  Cancelled: { label: "Đã hủy", cls: "cancelled" },
  Refunded: { label: "Đã hoàn trả", cls: "refunded" },
};

// Display order for status filter tabs / stat pills.
export const ORDER_STATUS_ORDER = [
  "Pending",
  "Confirmed",
  "AwaitingPickup",
  "Shipping",
  "Delivered",
  "Completed",
  "Cancelled",
  "Refunded",
];

// Statuses that belong to the shipping pipeline (Quản lý vận chuyển).
export const SHIPPING_STATUSES = [
  "Confirmed",
  "AwaitingPickup",
  "Shipping",
  "Delivered",
  "Cancelled",
  "Refunded",
];

export const statusLabel = (status) => ORDER_STATUS[status]?.label ?? status;
export const statusClass = (status) => ORDER_STATUS[status]?.cls ?? "pending";

// Thanh tab trạng thái kiểu Shopee (dùng chung Đơn hàng & Vận chuyển).
// Mỗi tab gộp một hoặc nhiều trạng thái nội bộ; `statuses: null` = tất cả.
export const ORDER_TABS = [
  { key: "all", label: "Tất cả", statuses: null },
  { key: "pending", label: "Chờ xác nhận", statuses: ["Pending"] },
  { key: "pickup", label: "Chờ lấy hàng", statuses: ["Confirmed", "AwaitingPickup"] },
  { key: "shipping", label: "Đang giao", statuses: ["Shipping"] },
  { key: "delivered", label: "Đã giao", statuses: ["Delivered", "Completed"] },
  { key: "cancelled", label: "Đơn huỷ", statuses: ["Cancelled"] },
  { key: "returns", label: "Trả hàng/Hoàn tiền", statuses: ["Refunded"] },
];

export const tabMatches = (tab, status) => !tab.statuses || tab.statuses.includes(status);
