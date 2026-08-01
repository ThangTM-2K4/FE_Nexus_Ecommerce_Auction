import { useState } from "react";
import { toast } from "react-toastify";
import AdminPageHeader from "../../../components/admin/adminPageHeader";
import AdminToolbar from "../../../components/admin/adminToolbar";
import { AdminStaggerGrid } from "../../../components/admin/adminPageTransition";
import {
  OrderTimelineItem, AuctionOrderCard, BidFeedItem,
  PaymentCard, WalletCard, WithdrawalCard,
  OrderListRow, PaymentListRow, WalletListRow, WithdrawalListRow,
} from "../../../components/admin/adminViews";
import { useAdminList } from "../../../hooks/useAdminList";
import {
  mockOrders, mockAuctionOrders, mockBids, mockPayments, mockWallets, mockWithdrawals, STATUS_OPTIONS,
} from "../../../data/adminEntities";
import "../../../components/admin/adminViews/index.scss";

export const AdminOrders = () => {
  const list = useAdminList(mockOrders, ["id", "buyer", "seller"]);
  const [viewMode, setViewMode] = useState("grid");
  return (
    <div className="adm-page">
      <AdminPageHeader kicker="Đơn hàng" title="Quản lý đơn hàng" subtitle="Timeline đơn hàng — hủy, hoàn tiền, hoàn thành." />
      <AdminToolbar
        search={list.search} onSearchChange={list.setSearch} searchPlaceholder="Tìm mã đơn, người mua..."
        filters={[{ key: "status", label: "Trạng thái", value: list.filter.status || "", onChange: (v) => list.setFilterValue("status", v), options: STATUS_OPTIONS.order }]}
        actions={[
          { label: "Xuất Excel", variant: "secondary", onClick: () => toast.info("Đang xuất...") },
        ]}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      {viewMode === "grid" ? (
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
      ) : (
        <div className="adm-list-container">
          {list.filtered.map((order) => (
            <OrderListRow
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
      )}
    </div>
  );
};

export const AdminAuctionOrders = () => {
  const list = useAdminList(mockAuctionOrders, ["id", "winner", "auction"]);
  const [viewMode, setViewMode] = useState("grid");
  return (
    <div className="adm-page">
      <AdminPageHeader kicker="Đấu giá" title="Đơn hàng đấu giá" subtitle="Pipeline thanh toán và giao hàng sau đấu giá." />
      <AdminToolbar
        search={list.search} onSearchChange={list.setSearch} searchPlaceholder="Tìm mã đơn, người thắng..."
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      {viewMode === "grid" ? (
        <div className="adm-order-timeline">
          {list.filtered.map((order) => (
            <OrderTimelineItem
              key={order.id}
              order={{
                id: order.id,
                status: order.deliveryStatus !== "—" ? order.deliveryStatus : order.paymentStatus,
                buyer: order.winner,
                seller: order.seller,
                payment: order.paymentStatus,
                shipping: order.deliveryStatus,
                total: order.finalPrice,
                createdAt: order.createdAt
              }}
              actions={[
                { label: "Hoàn thành", variant: "success", onClick: () => { list.updateItem(order.id, { deliveryStatus: "Đã giao" }); toast.success("Đã hoàn thành"); }},
                { label: "Hoàn tiền", onClick: () => toast.info("Đang hoàn tiền") },
                { label: "Hủy", variant: "danger", onClick: () => toast.warning("Đã hủy") },
              ]}
            />
          ))}
        </div>
      ) : (
        <div className="adm-list-container">
          {list.filtered.map((order) => (
            <OrderListRow
              key={order.id}
              order={{
                id: order.id,
                status: order.deliveryStatus !== "—" ? order.deliveryStatus : order.paymentStatus,
                buyer: order.winner,
                seller: order.seller,
                payment: order.paymentStatus,
                shipping: order.deliveryStatus,
                total: order.finalPrice,
                createdAt: order.createdAt
              }}
              actions={[
                { label: "Hoàn thành", variant: "success", onClick: () => { list.updateItem(order.id, { deliveryStatus: "Đã giao" }); toast.success("Đã hoàn thành"); }},
                { label: "Hoàn tiền", onClick: () => toast.info("Đang hoàn tiền") },
                { label: "Hủy", variant: "danger", onClick: () => toast.warning("Đã hủy") },
              ]}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const AdminBids = () => {
  const list = useAdminList(mockBids, ["bidder", "auction", "id"]);
  const [viewMode, setViewMode] = useState("grid");
  return (
    <div className="adm-page">
      <AdminPageHeader kicker="Đấu giá" title="Quản lý Bid" subtitle="Luồng bid theo thời gian — phát hiện spam và bid giả." />
      <AdminToolbar
        search={list.search} onSearchChange={list.setSearch} searchPlaceholder="Tìm bidder, phiên..."
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      <div className={viewMode === "list" ? "adm-bid-feed adm-view-as-list" : "adm-bid-feed"}>
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
  const [viewMode, setViewMode] = useState("grid");
  return (
    <div className="adm-page">
      <AdminPageHeader kicker="Tài chính" title="Quản lý thanh toán" subtitle="Luồng giao dịch thanh toán." />
      <AdminToolbar
        search={list.search} onSearchChange={list.setSearch}
        actions={[
          { label: "Xuất Excel", variant: "secondary", onClick: () => toast.info("Đang xuất...") },
        ]}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      {viewMode === "grid" ? (
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
      ) : (
        <div className="adm-list-container">
          {list.filtered.map((p) => (
            <PaymentListRow
              key={p.id}
              payment={p}
              actions={[
                { label: "Hoàn tiền", onClick: () => toast.info(`Hoàn ${p.amount}`) },
                { label: "Thử lại", variant: "primary", onClick: () => toast.success("Đã gửi lại") },
              ]}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const AdminWallets = () => {
  const list = useAdminList(mockWallets, ["owner"]);
  const [viewMode, setViewMode] = useState("grid");
  return (
    <div className="adm-page">
      <AdminPageHeader kicker="Ví" title="Quản lý ví" subtitle="Thẻ số dư ví người dùng và seller." />
      <AdminToolbar
        search={list.search} onSearchChange={list.setSearch} searchPlaceholder="Tìm chủ ví..."
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      {viewMode === "grid" ? (
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
      ) : (
        <div className="adm-list-container">
          {list.filtered.map((w) => (
            <WalletListRow
              key={w.id}
              wallet={w}
              actions={[
                { label: "Chi tiết", onClick: () => toast.info(`Xem ví ${w.owner}`) },
                { label: "Đóng băng", onClick: () => toast.warning("Đã đóng băng") },
              ]}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const AdminWithdrawals = () => {
  const list = useAdminList(mockWithdrawals, ["seller", "id"]);
  const [viewMode, setViewMode] = useState("grid");

  return (
    <div className="adm-page">
      <AdminPageHeader kicker="Tài chính" title="Quản lý rút tiền" subtitle="Theo dõi các yêu cầu rút tiền tự động của seller." />
      <AdminToolbar
        search={list.search} onSearchChange={list.setSearch} searchPlaceholder="Tìm seller..."
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      
      <div style={{
        background: 'rgba(31, 169, 104, 0.1)',
        border: '1px solid #1fa968',
        padding: '16px 20px',
        borderRadius: '12px',
        marginBottom: '24px',
        color: '#1fa968',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <span style={{ fontSize: '24px' }}>🗓️</span>
        <div>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '15px' }}>Lịch rút tiền tự động</h4>
          <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>
            Hệ thống sẽ tự động chốt và thực hiện lệnh rút tiền vào <strong>Thứ 3 hàng tuần</strong>. 
            Tiền sẽ về tài khoản seller vào <strong>Thứ 4</strong>. Không cần duyệt thủ công.
          </p>
        </div>
      </div>

      {viewMode === "grid" ? (
        <AdminStaggerGrid className="adm-withdrawal-grid">
          {list.filtered.map((item) => (
            <WithdrawalCard
              key={item.id}
              item={item}
              actions={item.status === "Chờ duyệt" ? [
                { label: "Chi tiết", onClick: () => toast.info(`Xem chi tiết yêu cầu của ${item.seller}`) },
              ] : []}
            />
          ))}
        </AdminStaggerGrid>
      ) : (
        <div className="adm-list-container">
          {list.filtered.map((item) => (
            <WithdrawalListRow
              key={item.id}
              item={item}
              actions={item.status === "Chờ duyệt" ? [
                { label: "Chi tiết", onClick: () => toast.info(`Xem chi tiết yêu cầu của ${item.seller}`) },
              ] : []}
            />
          ))}
        </div>
      )}
    </div>
  );
};

