import { toast } from "react-toastify";
import AdminPageHeader from "../../../components/admin/adminPageHeader";
import AdminToolbar from "../../../components/admin/adminToolbar";
import { AdminStaggerGrid } from "../../../components/admin/adminPageTransition";
import {
  OrderTimelineItem, AuctionOrderCard, BidFeedItem,
  PaymentCard, WalletCard, WithdrawalCard,
} from "../../../components/admin/adminViews";
import { useAdminList } from "../../../hooks/useAdminList";
import {
  mockOrders, mockAuctionOrders, mockBids, mockPayments, mockWallets, mockWithdrawals, STATUS_OPTIONS,
} from "../../../data/adminEntities";
import "../../../components/admin/adminViews/index.scss";

export const AdminOrders = () => {
  const list = useAdminList(mockOrders, ["id", "buyer", "seller"]);
  return (
    <div className="adm-page">
      <AdminPageHeader kicker="Đơn hàng" title="Quản lý đơn hàng" subtitle="Timeline đơn hàng — hủy, hoàn tiền, hoàn thành." />
      <AdminToolbar
        search={list.search} onSearchChange={list.setSearch} searchPlaceholder="Tìm mã đơn, người mua..."
        filters={[{ key: "status", label: "Trạng thái", value: list.filter.status || "", onChange: (v) => list.setFilterValue("status", v), options: STATUS_OPTIONS.order }]}
        actions={[{ label: "Xuất Excel", variant: "secondary", onClick: () => toast.info("Đang xuất...") }]}
      />
      <div className="adm-order-timeline">
        {list.filtered.map((order) => (
          <OrderTimelineItem
            key={order.id}
            order={order}
            actions={[
              { label: "Hoàn thành", variant: "success", onClick: () => { list.updateItem(order.id, { status: "Hoàn thành" }); toast.success("Đã hoàn thành"); }},
              { label: "Hủy", variant: "danger", onClick: () => { list.updateItem(order.id, { status: "Đã hủy" }); toast.warning("Đã hủy"); }},
              { label: "Hoàn tiền", onClick: () => toast.info(`Hoàn ${order.total}`) },
            ]}
          />
        ))}
      </div>
    </div>
  );
};

export const AdminAuctionOrders = () => {
  const list = useAdminList(mockAuctionOrders, ["id", "winner", "auction"]);
  return (
    <div className="adm-page">
      <AdminPageHeader kicker="Đấu giá" title="Đơn hàng đấu giá" subtitle="Pipeline thanh toán và giao hàng sau đấu giá." />
      <AdminToolbar search={list.search} onSearchChange={list.setSearch} searchPlaceholder="Tìm mã đơn, người thắng..." />
      <AdminStaggerGrid className="adm-auction-order-grid">
        {list.filtered.map((order) => (
          <AuctionOrderCard
            key={order.id}
            order={order}
            actions={[
              { label: "Hoàn thành", variant: "success", onClick: () => { list.updateItem(order.id, { deliveryStatus: "Đã giao" }); toast.success("Đã hoàn thành"); }},
              { label: "Hoàn tiền", onClick: () => toast.info("Đang hoàn tiền") },
              { label: "Hủy", variant: "danger", onClick: () => toast.warning("Đã hủy") },
            ]}
          />
        ))}
      </AdminStaggerGrid>
    </div>
  );
};

export const AdminBids = () => {
  const list = useAdminList(mockBids, ["bidder", "auction", "id"]);
  return (
    <div className="adm-page">
      <AdminPageHeader kicker="Đấu giá" title="Quản lý Bid" subtitle="Luồng bid theo thời gian — phát hiện spam và bid giả." />
      <AdminToolbar search={list.search} onSearchChange={list.setSearch} searchPlaceholder="Tìm bidder, phiên..." />
      <div className="adm-bid-feed">
        {list.filtered.map((bid) => (
          <BidFeedItem
            key={bid.id}
            bid={bid}
            actions={[
              { label: "Xóa bid", variant: "danger", onClick: () => { list.removeItem(bid.id); toast.warning("Đã xóa bid"); }},
              { label: "Cấm", variant: "danger", onClick: () => toast.error(`Đã cấm ${bid.bidder}`) },
              ...(bid.suspicious ? [{ label: "Spam", variant: "danger", onClick: () => toast.warning("Đã đánh dấu spam") }] : []),
            ]}
          />
        ))}
      </div>
    </div>
  );
};

export const AdminPayments = () => {
  const list = useAdminList(mockPayments, ["transaction", "buyer", "seller"]);
  return (
    <div className="adm-page">
      <AdminPageHeader kicker="Tài chính" title="Quản lý thanh toán" subtitle="Luồng giao dịch thanh toán." />
      <AdminToolbar search={list.search} onSearchChange={list.setSearch} actions={[{ label: "Xuất Excel", variant: "secondary", onClick: () => toast.info("Đang xuất...") }]} />
      <div className="adm-payment-list">
        {list.filtered.map((p) => (
          <PaymentCard
            key={p.id}
            payment={p}
            actions={[
              { label: "Hoàn tiền", onClick: () => toast.info(`Hoàn ${p.amount}`) },
              { label: "Thử lại", variant: "primary", onClick: () => toast.success("Đã gửi lại") },
            ]}
          />
        ))}
      </div>
    </div>
  );
};

export const AdminWallets = () => {
  const list = useAdminList(mockWallets, ["owner"]);
  return (
    <div className="adm-page">
      <AdminPageHeader kicker="Ví" title="Quản lý ví" subtitle="Thẻ số dư ví người dùng và seller." />
      <AdminToolbar search={list.search} onSearchChange={list.setSearch} searchPlaceholder="Tìm chủ ví..." />
      <AdminStaggerGrid className="adm-wallet-grid">
        {list.filtered.map((w) => (
          <WalletCard
            key={w.id}
            wallet={w}
            actions={[
              { label: "Chi tiết", onClick: () => toast.info(`Xem ví ${w.owner}`) },
              { label: "Đóng băng", onClick: () => toast.warning("Đã đóng băng") },
            ]}
          />
        ))}
      </AdminStaggerGrid>
    </div>
  );
};

export const AdminWithdrawals = () => {
  const list = useAdminList(mockWithdrawals, ["seller", "id"]);
  const handle = (row, status) => { list.updateItem(row.id, { status }); toast.success(`Đã ${status === "Đã duyệt" ? "duyệt" : status === "Từ chối" ? "từ chối" : "tạm giữ"}`); };

  return (
    <div className="adm-page">
      <AdminPageHeader kicker="Tài chính" title="Quản lý rút tiền" subtitle="Duyệt yêu cầu rút tiền của seller." />
      <AdminToolbar search={list.search} onSearchChange={list.setSearch} searchPlaceholder="Tìm seller..." />
      <AdminStaggerGrid className="adm-withdrawal-grid">
        {list.filtered.map((item) => (
          <WithdrawalCard
            key={item.id}
            item={item}
            actions={item.status === "Chờ duyệt" ? [
              { label: "Duyệt", variant: "success", onClick: () => handle(item, "Đã duyệt") },
              { label: "Từ chối", variant: "danger", onClick: () => handle(item, "Từ chối") },
              { label: "Tạm giữ", onClick: () => handle(item, "Tạm giữ") },
            ] : []}
          />
        ))}
      </AdminStaggerGrid>
    </div>
  );
};
