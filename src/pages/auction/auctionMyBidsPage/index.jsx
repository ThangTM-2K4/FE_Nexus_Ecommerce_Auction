import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTh, FaList, FaGavel, FaTrophy, FaHistory, FaClock, FaTrash, FaTruck, FaMapMarkerAlt, FaCalendarAlt, FaCheckCircle, FaTimes, FaBoxOpen, FaReceipt, FaMoneyBillWave, FaBarcode,
} from "react-icons/fa";
import { toast } from "react-toastify";
import AuctionSidebarLayout from "../../../components/auction/auctionSidebarLayout";
import AuctionImage from "../../../components/auction/auctionImage";
import { myBidsAuctions } from "../../../data/auctionMockData";
import { useAuth } from "../../../context/AuthContext";
import "./index.scss";

const BID_HISTORY_KEY = "auc_bid_history";
const WON_ORDERS_KEY = "auc_orders";

const MOCK_WON_AUCTIONS = [
  {
    id: "AUC-WIN-101",
    auctionId: "auc-1",
    productTitle: "Đồng Hồ Patek Philippe Nautilus 5711/1A (Phiên Bản Giới Hạn)",
    productImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
    finalPrice: "325.500.000 ₫",
    startingPrice: "280.000.000 ₫",
    depositAmount: "5.000.000 ₫",
    paidAmount: "320.500.000 ₫",
    paidAt: "2026-07-29T09:15:00.000Z",
    paymentMethod: "Ví Nexus Pay",
    status: "delivering", // 'processing' | 'delivering' | 'completed'
    shippingCarrier: "Giao Hàng Nhanh (GHN Express)",
    trackingCode: "GHN-AUC-998241",
    estimatedDeliveryDate: "30/07/2026 - 01/08/2026 (2 - 3 ngày làm việc)",
    deliveryTimeSlot: "08:00 - 12:00 hoặc 13:00 - 17:00 (Giờ hành chính - Giao tất cả các ngày)",
    address: {
      recipient: "Nguyễn Minh Đức",
      phone: "0912 345 678",
      fullAddress: "123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
    },
    timeline: [
      { time: "09:15 - 29/07/2026", text: "Thanh toán trúng thầu thành công & Khấu trừ cọc 5.000.000 ₫", done: true },
      { time: "10:30 - 29/07/2026", text: "Người bán (Patek Official Store) kiểm tra & đóng gói bảo hiểm", done: true },
      { time: "14:15 - 29/07/2026", text: "Đã bàn giao cho đơn vị vận chuyển GHN Express (Kho HCM Central)", done: true },
      { time: "18:00 - 29/07/2026", text: "Đơn hàng đang trên đường vận chuyển đến Bưu cục giao Quận 1", done: true },
      { time: "Dự kiến 31/07/2026", text: "Nhân viên shipper giao hàng đến địa chỉ nhận", done: false },
    ],
  },
  {
    id: "AUC-WIN-102",
    auctionId: "auc-2",
    productTitle: "Rolex Submariner Date 126610LN Mới 100% Fullbox",
    productImage: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&auto=format&fit=crop&q=80",
    finalPrice: "215.000.000 ₫",
    startingPrice: "190.000.000 ₫",
    depositAmount: "5.000.000 ₫",
    paidAmount: "210.000.000 ₫",
    paidAt: "2026-07-28T14:30:00.000Z",
    paymentMethod: "Chuyển khoản Ngân hàng (Napas 24/7)",
    status: "completed",
    shippingCarrier: "Viettel Post Special Cargo",
    trackingCode: "VTP-AUC-881920",
    estimatedDeliveryDate: "29/07/2026 (Đã giao hàng)",
    deliveryTimeSlot: "13:00 - 17:00 (Đã hoàn tất)",
    address: {
      recipient: "Nguyễn Minh Đức",
      phone: "0912 345 678",
      fullAddress: "123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
    },
    timeline: [
      { time: "14:30 - 28/07/2026", text: "Thanh toán trúng thầu thành công", done: true },
      { time: "16:00 - 28/07/2026", text: "Bàn giao đơn vị vận chuyển Viettel Post", done: true },
      { time: "09:00 - 29/07/2026", text: "Shipper đang giao hàng đến người nhận", done: true },
      { time: "10:45 - 29/07/2026", text: "Giao hàng thành công & Khách hàng đã ký nhận", done: true },
    ],
  },
];

function maskUsername(name, isCurrentUser) {
  if (isCurrentUser) return name;
  if (!name) return "***";
  if (name.length <= 3) return name.slice(0, 1) + "***";
  return name.slice(0, 3) + "***";
}

function isSameUser(currentUser, bidUser) {
  if (!currentUser || !bidUser) return false;
  const target = String(bidUser).trim().toLowerCase();
  const names = [currentUser.name, currentUser.fullName, currentUser.email, currentUser.username]
    .filter(Boolean)
    .map((s) => String(s).trim().toLowerCase());
  return names.includes(target) || target === "bạn";
}

function formatCurrency(amount, currency) {
  if (currency === "USD") {
    return `$${Number(amount).toLocaleString("en-US")}`;
  }
  return `${Number(amount).toLocaleString("vi-VN")} ₫`;
}

function formatDateTime(isoStr) {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export default function AuctionMyBidsPage() {
  const [view, setView] = useState("grid");
  const [activeTab, setActiveTab] = useState("current"); // 'current' | 'won' | 'history'
  const [bidAmounts, setBidAmounts] = useState({});
  const [bidHistory, setBidHistory] = useState([]);
  const [wonOrders, setWonOrders] = useState([]);
  const [liveAuctions, setLiveAuctions] = useState(myBidsAuctions);
  const [selectedWonOrder, setSelectedWonOrder] = useState(null);

  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Sync live auctions from bidHistory & myBidsAuctions
  const syncLiveAuctions = useCallback((historyData) => {
    setLiveAuctions((prevList) => {
      return prevList.map((auction) => {
        const bidsForThis = historyData.filter(
          (b) => String(b.auctionId) === String(auction.id)
        );
        if (bidsForThis.length === 0) return auction;

        // Top bid is highest amount
        const sortedBids = [...bidsForThis].sort((a, b) => b.amount - a.amount);
        const topBid = sortedBids[0];
        const isUsd = String(auction.currentPrice).includes("$");
        const formattedPrice = isUsd
          ? `$${topBid.amount.toLocaleString("en-US")}`
          : `${topBid.amount.toLocaleString("vi-VN")} ₫`;

        const userBidsFormatted = sortedBids.map((b) => ({
          user: b.userName,
          avatar: b.userAvatar || "",
          amount: isUsd ? `$${b.amount.toLocaleString("en-US")}` : `${b.amount.toLocaleString("vi-VN")} ₫`,
          isYou: true,
          isLeader: b.id === topBid.id,
        }));

        const otherBids = (auction.bidHistory || []).filter((b) => !b.isYou);
        const mergedHistory = [...userBidsFormatted, ...otherBids];

        return {
          ...auction,
          currentPrice: formattedPrice,
          status: { label: "ĐANG DẪN ĐẦU", type: "leading" },
          bidHistory: mergedHistory,
        };
      });
    });
  }, []);

  // Load bid history from localStorage
  const loadHistory = useCallback(() => {
    try {
      const data = JSON.parse(localStorage.getItem(BID_HISTORY_KEY) || "[]");
      setBidHistory(data);
      syncLiveAuctions(data);
    } catch {
      setBidHistory([]);
    }
  }, [syncLiveAuctions]);

  // Load won orders from localStorage
  const loadWonOrders = useCallback(() => {
    try {
      const local = JSON.parse(localStorage.getItem(WON_ORDERS_KEY) || "[]");
      const normalizedLocal = local.map((item) => ({
        id: item.id || `AUC-WIN-${item.productTitle?.slice(0, 5)}-${Date.now()}`,
        productTitle: item.productTitle || "Sản phẩm trúng thầu",
        productImage: item.productImage || MOCK_WON_AUCTIONS[0].productImage,
        finalPrice: item.finalPrice || "100.000.000 ₫",
        startingPrice: "80.000.000 ₫",
        depositAmount: "5.000.000 ₫",
        paidAmount: item.finalPrice || "95.000.000 ₫",
        paidAt: item.paidAt || new Date().toISOString(),
        paymentMethod: item.paymentMethod === "wallet" ? "Ví Nexus Pay" : "Chuyển khoản Ngân hàng",
        status: item.status || "delivering",
        shippingCarrier: "Giao Hàng Nhanh (GHN Express)",
        trackingCode: `GHN-AUC-${Math.floor(100000 + Math.random() * 900000)}`,
        estimatedDeliveryDate: "30/07/2026 - 01/08/2026 (2 - 3 ngày làm việc)",
        deliveryTimeSlot: "08:00 - 12:00 hoặc 13:00 - 17:00 (Giờ hành chính)",
        address: item.address || {
          recipient: user?.name || user?.fullName || "Nguyễn Minh Đức",
          phone: user?.phone || "0912 345 678",
          fullAddress: user?.address || "123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
        },
        timeline: [
          { time: formatDateTime(item.paidAt || new Date().toISOString()), text: "Thanh toán trúng thầu thành công & Khấu trừ cọc 5.000.000 ₫", done: true },
          { time: "Hôm nay 10:30", text: "Người bán xác nhận đơn hàng & Đóng gói bảo hiểm sản phẩm", done: true },
          { time: "Hôm nay 14:15", text: "Đã bàn giao cho đơn vị vận chuyển GHN Express", done: true },
          { time: "Dự kiến 31/07/2026", text: "Shipper giao hàng tận nhà", done: false },
        ],
      }));
      setWonOrders([...normalizedLocal, ...MOCK_WON_AUCTIONS]);
    } catch {
      setWonOrders(MOCK_WON_AUCTIONS);
    }
  }, [user]);

  useEffect(() => {
    loadHistory();
    loadWonOrders();
    const onStorage = (e) => {
      if (!e.key || e.key === BID_HISTORY_KEY) loadHistory();
      if (!e.key || e.key === WON_ORDERS_KEY) loadWonOrders();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [loadHistory, loadWonOrders]);

  useEffect(() => {
    if (activeTab === "history") loadHistory();
    if (activeTab === "won") loadWonOrders();
    if (activeTab === "current") loadHistory();
  }, [activeTab, loadHistory, loadWonOrders]);

  const clearHistory = () => {
    localStorage.removeItem(BID_HISTORY_KEY);
    setBidHistory([]);
    syncLiveAuctions([]);
    toast.success("Đã xoá toàn bộ lịch sử đấu giá!");
  };

  // Compute attempt number per auction
  const historyWithAttempts = (() => {
    const totals = {};
    bidHistory.forEach((item) => {
      totals[item.auctionId] = (totals[item.auctionId] || 0) + 1;
    });

    const running = {};
    return bidHistory.map((entry) => {
      const total = totals[entry.auctionId] || 1;
      const current = running[entry.auctionId] !== undefined ? running[entry.auctionId] : total;
      running[entry.auctionId] = current - 1;
      return { ...entry, attemptNumber: current };
    });
  })();

  const parseIncrement = (str) => {
    const clean = str.replace(/[^0-9]/g, "");
    const val = Number(clean);
    if (str.toUpperCase().includes("K")) return val * 1000;
    if (str.toUpperCase().includes("M")) return val * 1000000;
    return val;
  };

  const handleIncrement = (auction, incStr) => {
    const currentInput = bidAmounts[auction.id] || "";
    const currentVal = currentInput
      ? Number(currentInput.replace(/[^0-9]/g, ""))
      : Number(String(auction.currentPrice).replace(/[^0-9]/g, ""));
    const inc = parseIncrement(incStr);
    const newVal = currentVal + inc;
    const isUsd = String(auction.currentPrice).includes("$");
    setBidAmounts({ ...bidAmounts, [auction.id]: newVal.toLocaleString(isUsd ? "en-US" : "vi-VN") });
  };

  const handleInputChange = (auctionId, value, isUsd = false) => {
    const rawVal = value.replace(/[^0-9]/g, "");
    const numVal = Number(rawVal);
    setBidAmounts({ ...bidAmounts, [auctionId]: rawVal ? numVal.toLocaleString(isUsd ? "en-US" : "vi-VN") : "" });
  };

  const handleConfirmBid = (auction) => {
    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để đặt giá!");
      navigate("/login", { state: { redirectTo: "/auction/my-bids" } });
      return;
    }
    const amountStr = bidAmounts[auction.id];
    if (!amountStr) {
      toast.error("Vui lòng nhập giá hoặc chọn mức tăng!");
      return;
    }
    const amount = Number(amountStr.replace(/[^0-9]/g, ""));
    const currentPriceNum = Number(String(auction.currentPrice).replace(/[^0-9]/g, ""));
    if (amount <= currentPriceNum) {
      toast.error(`Giá thầu mới phải lớn hơn giá hiện tại (${auction.currentPrice})!`);
      return;
    }

    const isUsd = String(auction.currentPrice).includes("$");
    const formattedAmount = isUsd
      ? `$${amount.toLocaleString("en-US")}`
      : `${amount.toLocaleString("vi-VN")} ₫`;

    const userName = user?.name || user?.fullName || user?.email || "Bạn";
    const userAvatar = user?.avatar || user?.avatarUrl || "";

    const existing = JSON.parse(localStorage.getItem(BID_HISTORY_KEY) || "[]");
    const entry = {
      id: Date.now(),
      auctionId: auction.id,
      title: auction.title,
      image: auction.image || "",
      category: "",
      amount,
      currency: isUsd ? "USD" : "VND",
      bidAt: new Date().toISOString(),
      userName,
      userAvatar,
      status: "winning",
    };

    const updatedHistory = [entry, ...existing].slice(0, 200);
    localStorage.setItem(BID_HISTORY_KEY, JSON.stringify(updatedHistory));
    window.dispatchEvent(new Event("storage"));
    setBidHistory(updatedHistory);
    syncLiveAuctions(updatedHistory);

    toast.success(`🎉 Đặt giá ${formattedAmount} thành công cho ${auction.title}! Bạn đang dẫn đầu.`);
    setBidAmounts({ ...bidAmounts, [auction.id]: "" });
  };

  return (
    <AuctionSidebarLayout sidebarActive="bids">
      <div className="auc-my-bids">
        <div className="auc-my-bids__header">
          <div>
            <h1>Đấu Giá Của Tôi</h1>
            <div className="auc-my-bids__tabs">
              <button
                type="button"
                className={activeTab === "current" ? "active" : ""}
                onClick={() => setActiveTab("current")}
              >
                Phiên hiện tại
              </button>
              <button
                type="button"
                className={activeTab === "won" ? "active" : ""}
                onClick={() => setActiveTab("won")}
              >
                <FaTrophy style={{ marginRight: 6, color: "#e8c468" }} />
                Đấu giá đã thắng
                {wonOrders.length > 0 && (
                  <span className="auc-my-bids__tab-badge auc-my-bids__tab-badge--won">
                    {wonOrders.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                className={activeTab === "history" ? "active" : ""}
                onClick={() => setActiveTab("history")}
              >
                <FaHistory style={{ marginRight: 6 }} />
                Lịch sử đấu giá
                {bidHistory.length > 0 && (
                  <span className="auc-my-bids__tab-badge">{bidHistory.length}</span>
                )}
              </button>
            </div>
          </div>
          <div className="auc-my-bids__view-toggle">
            <button
              type="button"
              className={view === "grid" ? "active" : ""}
              onClick={() => setView("grid")}
            >
              <FaTh />
            </button>
            <button
              type="button"
              className={view === "list" ? "active" : ""}
              onClick={() => setView("list")}
            >
              <FaList />
            </button>
          </div>
        </div>

        {activeTab === "won" ? (
          /* ─── Tab: Đấu giá đã thắng ─── */
          <div className="auc-won-panel">
            <div className="auc-won-panel__toolbar">
              <div className="auc-won-panel__title">
                <FaTrophy className="trophy-icon" />
                <span>Các sản phẩm bạn đã trúng thầu ({wonOrders.length})</span>
              </div>
            </div>

            {wonOrders.length === 0 ? (
              <div className="auc-bid-history-panel__empty">
                <FaTrophy className="empty-icon" style={{ color: "#e8c468" }} />
                <h3>Chưa có sản phẩm trúng thầu nào</h3>
                <p>Tham gia đấu giá ngay để trở thành người chiến thắng sản phẩm yêu thích.</p>
                <button
                  type="button"
                  className="auc-bid-history-panel__browse-btn"
                  onClick={() => navigate("/auction")}
                >
                  <FaGavel /> Khám phá các phiên đấu giá
                </button>
              </div>
            ) : (
              <div className={`auc-won-grid ${view}`}>
                {wonOrders.map((order) => (
                  <div key={order.id} className="auc-won-card">
                    <div className="auc-won-card__image-container">
                      <AuctionImage src={order.productImage} alt={order.productTitle} />
                      <span className={`auc-won-card__badge auc-won-card__badge--${order.status}`}>
                        {order.status === "completed" ? "✅ Đã giao thành công" : "🚚 Đang giao hàng"}
                      </span>
                    </div>

                    <div className="auc-won-card__content">
                      <div className="auc-won-card__order-meta">
                        <span className="order-id">Mã ĐH: <strong>#{order.id}</strong></span>
                        <span className="paid-date"><FaClock /> {formatDateTime(order.paidAt)}</span>
                      </div>

                      <h3 className="auc-won-card__title">{order.productTitle}</h3>

                      <div className="auc-won-card__price-row">
                        <span>Giá trúng thầu:</span>
                        <strong className="final-price">{order.finalPrice}</strong>
                      </div>

                      <div className="auc-won-card__shipping-box">
                        <div className="shipping-info-item">
                          <FaCalendarAlt className="icon" />
                          <div>
                            <span className="label">Thời gian ship dự kiến:</span>
                            <strong className="value">{order.estimatedDeliveryDate}</strong>
                          </div>
                        </div>

                        <div className="shipping-info-item">
                          <FaClock className="icon" />
                          <div>
                            <span className="label">Khung giờ giao hàng:</span>
                            <strong className="value">{order.deliveryTimeSlot}</strong>
                          </div>
                        </div>

                        <div className="shipping-info-item">
                          <FaTruck className="icon" />
                          <div>
                            <span className="label">Đơn vị vận chuyển:</span>
                            <strong className="value">{order.shippingCarrier} (Mã: {order.trackingCode})</strong>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn-view-won-detail"
                        onClick={() => setSelectedWonOrder(order)}
                      >
                        <FaReceipt /> Xem chi tiết đơn hàng & Vận chuyển
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === "history" ? (
          /* ─── Tab: Lịch sử đấu giá ─── */
          <div className="auc-bid-history-panel">
            <div className="auc-bid-history-panel__toolbar">
              <div className="auc-bid-history-panel__title">
                <FaTrophy className="trophy-icon" />
                <span>Lịch sử các lần đấu giá của bạn</span>
              </div>
              {bidHistory.length > 0 && (
                <button
                  type="button"
                  className="auc-bid-history-panel__clear"
                  onClick={clearHistory}
                >
                  <FaTrash /> Xoá lịch sử
                </button>
              )}
            </div>

            {bidHistory.length === 0 ? (
              <div className="auc-bid-history-panel__empty">
                <FaHistory className="empty-icon" />
                <h3>Chưa có lịch sử đấu giá</h3>
                <p>Khi bạn đặt giá thành công, lịch sử sẽ xuất hiện tại đây.</p>
                <button
                  type="button"
                  className="auc-bid-history-panel__browse-btn"
                  onClick={() => navigate("/auction")}
                >
                  <FaGavel /> Khám phá đấu giá ngay
                </button>
              </div>
            ) : (
              <div className="auc-bid-history-panel__list">
                {historyWithAttempts.map((entry) => (
                  <div key={entry.id} className="auc-bid-history-item">
                    <div className="auc-bid-history-item__image">
                      {entry.image ? (
                        <AuctionImage src={entry.image} alt={entry.title} />
                      ) : (
                        <div className="auc-bid-history-item__image-placeholder">
                          <FaGavel />
                        </div>
                      )}
                      <span className={`auc-bid-history-item__status auc-bid-history-item__status--${entry.status}`}>
                        {entry.status === "winning" ? "🏆 Đang dẫn đầu" : "Đã đặt"}
                      </span>
                    </div>

                    <div className="auc-bid-history-item__info">
                      <h3
                        className="auc-bid-history-item__title"
                        onClick={() => navigate(`/auction/detail/${entry.auctionId}`)}
                        title="Xem phiên đấu giá"
                      >
                        {entry.title}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {entry.category && (
                          <span className="auc-bid-history-item__category">{entry.category}</span>
                        )}
                        <span className="auc-bid-attempt-tag">Lần bid thứ #{entry.attemptNumber}</span>
                      </div>
                      <div className="auc-bid-history-item__meta">
                        <span>
                          <FaClock /> {formatDateTime(entry.bidAt)}
                        </span>
                        <span className="auc-bid-history-item__user">
                          {entry.userAvatar ? (
                            <AuctionImage
                              src={entry.userAvatar}
                              alt={entry.userName}
                              className="auc-bid-history-item__avatar"
                            />
                          ) : (
                            <span className="auc-bid-history-item__avatar-placeholder">
                              {(entry.userName || "?")[0].toUpperCase()}
                            </span>
                          )}
                          {entry.userName}
                        </span>
                      </div>
                    </div>

                    <div className="auc-bid-history-item__amount">
                      <span className="label">Giá đã đặt</span>
                      <strong>{formatCurrency(entry.amount, entry.currency)}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ─── Tab: Phiên hiện tại ─── */
          <div className={`auc-my-bids__grid ${view}`}>
            {liveAuctions.map((auction) => {
              const isUsd = String(auction.currentPrice).includes("$");
              return (
                <div key={auction.id} className="bid-card">
                  <div className="bid-card__image">
                    <AuctionImage src={auction.image} alt={auction.title} />
                    <span className={`bid-card__status bid-card__status--${auction.status.type}`}>
                      {auction.status.label}
                    </span>
                  </div>

                  <div className="bid-card__body">
                    <h3>{auction.title}</h3>

                    <div className="bid-card__timer">
                      Kết thúc trong: <em>{auction.timeLeft}</em>
                    </div>

                    <div className="bid-card__price">
                      <span>GIÁ HIỆN TẠI</span>
                      <strong>{auction.currentPrice}</strong>
                    </div>

                    <div className="bid-card__increments">
                      {auction.bidIncrements.map((inc) => (
                        <button
                          key={inc}
                          type="button"
                          onClick={() => handleIncrement(auction, inc)}
                        >
                          {inc}
                        </button>
                      ))}
                    </div>

                    <div className="bid-card__input">
                      <input
                        type="text"
                        placeholder="Nhập giá của bạn..."
                        value={bidAmounts[auction.id] || ""}
                        onChange={(e) => handleInputChange(auction.id, e.target.value, isUsd)}
                      />
                      <span>{isUsd ? "USD" : "VNĐ"}</span>
                    </div>

                    <button
                      type="button"
                      className={`bid-card__confirm bid-card__confirm--${auction.buttonStyle}`}
                      onClick={() => handleConfirmBid(auction)}
                    >
                      <FaGavel /> Xác nhận đặt giá
                    </button>

                    <div className="bid-card__history">
                      <h4>LỊCH SỬ ĐẶT GIÁ</h4>
                      <ul>
                        {auction.bidHistory.map((bid, i) => {
                          const isMe = isSameUser(user, bid.user) || bid.isYou;
                          const displayName = maskUsername(bid.user, isMe);
                          const attemptNum = auction.bidHistory.length - i;
                          return (
                            <li
                              key={i}
                              className={bid.isYou ? (bid.isLeader ? "you-leading" : "you-outbid") : ""}
                            >
                              <span className="bid-history-user">
                                {bid.avatar ? (
                                  <AuctionImage
                                    src={bid.avatar}
                                    alt={displayName}
                                    className="bid-history-avatar"
                                  />
                                ) : (
                                  <span className="bid-history-avatar-placeholder">
                                    {(displayName || "?")[0].toUpperCase()}
                                  </span>
                                )}
                                {displayName}
                                <span className="auc-bid-attempt-tag">Lần {attemptNum}</span>
                              </span>
                              <em>{bid.amount}</em>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Modal Chi tiết sản phẩm trúng thầu & Vận chuyển ─── */}
      {selectedWonOrder && (
        <div className="auc-modal-overlay" onClick={() => setSelectedWonOrder(null)}>
          <div className="auc-modal auc-modal--won-detail" onClick={(e) => e.stopPropagation()}>
            <div className="auc-modal__header">
              <h3>
                <FaTrophy style={{ color: "#e8c468" }} />
                Chi Tiết Đơn Trúng Thầu & Vận Chuyển
              </h3>
              <button type="button" onClick={() => setSelectedWonOrder(null)}><FaTimes /></button>
            </div>

            <div className="auc-modal__body">
              {/* Product Header */}
              <div className="won-detail-product-card">
                <AuctionImage src={selectedWonOrder.productImage} alt={selectedWonOrder.productTitle} />
                <div>
                  <strong>{selectedWonOrder.productTitle}</strong>
                  <div className="meta-tags">
                    <span className="badge-id">Mã ĐH: #{selectedWonOrder.id}</span>
                    <span className="badge-status">
                      {selectedWonOrder.status === "completed" ? "✅ Đã giao hàng" : "🚚 Đang giao hàng"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping info */}
              <div className="won-detail-shipping-card">
                <h4><FaTruck /> Thông Tin Giao Hàng & Thời Gian Ship</h4>
                <div className="shipping-grid">
                  <div className="shipping-grid-item">
                    <span className="label">Đơn vị vận chuyển:</span>
                    <strong className="value">{selectedWonOrder.shippingCarrier}</strong>
                  </div>
                  <div className="shipping-grid-item">
                    <span className="label">Mã vận đơn:</span>
                    <strong className="value" style={{ color: "#e8c468" }}>{selectedWonOrder.trackingCode}</strong>
                  </div>
                  <div className="shipping-grid-item">
                    <span className="label">Thời gian ship dự kiến:</span>
                    <strong className="value">{selectedWonOrder.estimatedDeliveryDate}</strong>
                  </div>
                  <div className="shipping-grid-item">
                    <span className="label">Khung giờ nhận hàng:</span>
                    <strong className="value">{selectedWonOrder.deliveryTimeSlot}</strong>
                  </div>
                </div>
              </div>

              {/* Address & Recipient */}
              <div className="won-detail-shipping-card">
                <h4><FaMapMarkerAlt /> Địa Chỉ Nhận Hàng</h4>
                <p style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: 700, color: "#ede7f6" }}>
                  {selectedWonOrder.address?.recipient} - {selectedWonOrder.address?.phone}
                </p>
                <p style={{ margin: 0, fontSize: "13px", color: "#8f7fbf" }}>
                  {selectedWonOrder.address?.fullAddress}
                </p>
              </div>

              {/* Financial summary */}
              <div className="won-detail-shipping-card">
                <h4><FaMoneyBillWave /> Chi Tiết Thanh Toán</h4>
                <div className="shipping-grid">
                  <div className="shipping-grid-item">
                    <span className="label">Giá trúng thầu:</span>
                    <strong className="value" style={{ color: "#e8c468" }}>{selectedWonOrder.finalPrice}</strong>
                  </div>
                  <div className="shipping-grid-item">
                    <span className="label">Tiền cọc đã trừ:</span>
                    <strong className="value" style={{ color: "#34d399" }}>-{selectedWonOrder.depositAmount}</strong>
                  </div>
                  <div className="shipping-grid-item">
                    <span className="label">Số tiền thực thanh toán:</span>
                    <strong className="value">{selectedWonOrder.paidAmount}</strong>
                  </div>
                  <div className="shipping-grid-item">
                    <span className="label">Hình thức thanh toán:</span>
                    <strong className="value">{selectedWonOrder.paymentMethod}</strong>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="won-detail-shipping-card">
                <h4><FaClock /> Hành Trình Đơn Hàng</h4>
                <div className="won-timeline">
                  {selectedWonOrder.timeline?.map((step, idx) => (
                    <div key={idx} className={`won-timeline-item ${step.done ? "done" : ""}`}>
                      <div className="node">{step.done ? <FaCheckCircle /> : idx + 1}</div>
                      <div className="content">
                        <span className="time">{step.time}</span>
                        <p className="text">{step.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="auc-modal__footer">
              <button type="button" className="btn-close-won-modal" onClick={() => setSelectedWonOrder(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </AuctionSidebarLayout>
  );
}
