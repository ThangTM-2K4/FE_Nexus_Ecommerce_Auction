import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTh, FaList, FaGavel, FaTrophy, FaHistory, FaClock, FaTrash, FaTruck, FaMapMarkerAlt, FaCalendarAlt, FaCheckCircle, FaTimes, FaBoxOpen, FaReceipt, FaMoneyBillWave, FaBarcode, FaSearch, FaFilter,
} from "react-icons/fa";
import { toast } from "react-toastify";
import AuctionSidebarLayout from "../../../components/auction/auctionSidebarLayout";
import AuctionImage from "../../../components/auction/auctionImage";
import AuctionCountdown from "../../../components/auction/auctionCountdown";
import { useAuth } from "../../../context/AuthContext";
import { getMyAuctionActivities, getWinnerOrder, placeBid as apiPlaceBid, mapActivityToLiveAuction, mapWinnerOrderToUi, mapBidToHistoryItem } from "../../../services/auctionService";
import "./index.scss";

const BID_HISTORY_KEY = "auc_bid_history";

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
  return names.includes(target);
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
  const [liveAuctions, setLiveAuctions] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [selectedWonOrder, setSelectedWonOrder] = useState(null);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'leading' | 'outbid' | 'watching'
  
  // Bid Confirmation Modal state
  const [pendingBidModal, setPendingBidModal] = useState(null);

  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Load hoạt động đấu giá từ API
  const loadActivities = useCallback(async () => {
    setActivitiesLoading(true);
    try {
      const activities = await getMyAuctionActivities();
      const list = Array.isArray(activities) ? activities : (activities?.items || []);

      const active = list
        .filter((a) => {
          const st = String(a.status || a.auctionStatus || '').toUpperCase();
          return st === 'LIVE' || st === 'REGISTERED' || a.isActive || a.participating;
        })
        .map(mapActivityToLiveAuction);
      setLiveAuctions(active);

      const historyFromApi = list.flatMap((a) => {
        const bids = a.myBids || a.bids || [];
        return bids.map((b, idx) => ({
          id: b.id || `${a.auctionId || a.id}-${idx}`,
          auctionId: a.auctionId || a.id,
          title: a.title || a.productName || 'Phiên đấu giá',
          image: a.imageUrl || a.image || '',
          category: a.categoryName || '',
          amount: b.amount ?? b.bidAmount ?? 0,
          currency: b.currency || a.currency || 'VND',
          bidAt: b.placedAtUtc || b.createdAt || b.bidAt || new Date().toISOString(),
          userName: user?.name || user?.fullName || user?.email || 'Bạn',
          userAvatar: user?.avatar || user?.avatarUrl || '',
          status: b.isLeading || b.status === 'LEADING' ? 'winning' : 'placed',
        }));
      });
      if (historyFromApi.length > 0) {
        setBidHistory(historyFromApi);
      }
    } catch {
      setLiveAuctions([]);
    } finally {
      setActivitiesLoading(false);
    }
  }, [user]);

  // Load won orders từ API
  const loadWonOrders = useCallback(async () => {
    try {
      const activities = await getMyAuctionActivities();
      const list = Array.isArray(activities) ? activities : (activities?.items || []);
      const wonActivities = list.filter(
        (a) => a.result === 'WINNER' || a.isWinner || a.winnerOrder || a.hasWinnerOrder,
      );

      if (wonActivities.length === 0) {
        setWonOrders([]);
        return;
      }

      const mapped = await Promise.all(
        wonActivities.map(async (a) => {
          const auctionId = a.auctionId || a.id;
          try {
            const order = await getWinnerOrder(auctionId);
            return mapWinnerOrderToUi(order || a.winnerOrder || {}, a);
          } catch {
            return mapWinnerOrderToUi(a.winnerOrder || {}, a);
          }
        }),
      );
      setWonOrders(mapped.filter(Boolean));
    } catch {
      setWonOrders([]);
    }
  }, []);

  useEffect(() => {
    loadActivities();
    loadWonOrders();
    const onStorage = (e) => {
      if (!e.key || e.key === BID_HISTORY_KEY) loadActivities();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [loadActivities, loadWonOrders]);

  useEffect(() => {
    if (activeTab === "won") loadWonOrders();
    if (activeTab === "current" || activeTab === "history") loadActivities();
  }, [activeTab, loadActivities, loadWonOrders]);

  const clearHistory = () => {
    localStorage.removeItem(BID_HISTORY_KEY);
    setBidHistory([]);
    toast.success("Đã xoá lịch sử đấu giá cục bộ!");
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

  // Filtered Lists for Search & Filter
  const filteredLiveAuctions = liveAuctions.filter((auction) => {
    const matchQuery = !searchQuery.trim() || auction.title.toLowerCase().includes(searchQuery.toLowerCase().trim());
    const matchStatus = statusFilter === "all" || auction.status.type === statusFilter;
    return matchQuery && matchStatus;
  });

  const filteredWonOrders = wonOrders.filter((order) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      order.productTitle?.toLowerCase().includes(q) ||
      order.id?.toLowerCase().includes(q)
    );
  });

  const filteredHistory = historyWithAttempts.filter((entry) => {
    if (!searchQuery.trim()) return true;
    return entry.title?.toLowerCase().includes(searchQuery.toLowerCase().trim());
  });

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

  // Trigger Bid Confirmation Modal
  const handleInitiateBid = (auction) => {
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

    const diff = amount - currentPriceNum;
    const formattedDiff = isUsd
      ? `$${diff.toLocaleString("en-US")}`
      : `${diff.toLocaleString("vi-VN")} ₫`;

    setPendingBidModal({
      auction,
      amount,
      formattedAmount,
      currentPrice: auction.currentPrice,
      diff: formattedDiff,
      isUsd,
    });
  };

  // Perform Bid Execution after modal confirmation
  const handleExecuteBid = async () => {
    if (!pendingBidModal) return;
    const { auction, amount, formattedAmount, isUsd } = pendingBidModal;

    try {
      await apiPlaceBid(auction.id, amount, auction.rowVersion, isUsd ? 'USD' : 'VND');
      toast.success(`🎉 Đặt giá ${formattedAmount} thành công cho ${auction.title}!`);
      setBidAmounts({ ...bidAmounts, [auction.id]: "" });
      setPendingBidModal(null);
      loadActivities();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Đặt giá thất bại, vui lòng thử lại!';
      toast.error(msg);
    }
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

        {/* ─── Search & Filter Toolbar ─── */}
        <div className="auc-my-bids__toolbar">
          <div className="auc-my-bids__search">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm trong danh sách..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button type="button" className="btn-clear-search" onClick={() => setSearchQuery("")}>
                <FaTimes />
              </button>
            )}
          </div>

          {activeTab === "current" && (
            <div className="auc-my-bids__filters">
              <FaFilter className="filter-icon" />
              <button
                type="button"
                className={statusFilter === "all" ? "active" : ""}
                onClick={() => setStatusFilter("all")}
              >
                Tất cả
              </button>
              <button
                type="button"
                className={statusFilter === "leading" ? "active" : ""}
                onClick={() => setStatusFilter("leading")}
              >
                🏆 Đang dẫn đầu
              </button>
              <button
                type="button"
                className={statusFilter === "outbid" ? "active" : ""}
                onClick={() => setStatusFilter("outbid")}
              >
                ⚡ Bị vượt giá
              </button>
              <button
                type="button"
                className={statusFilter === "watching" ? "active" : ""}
                onClick={() => setStatusFilter("watching")}
              >
                👀 Đang quan tâm
              </button>
            </div>
          )}
        </div>

        {activeTab === "won" ? (
          /* ─── Tab: Đấu giá đã thắng ─── */
          <div className="auc-won-panel">
            <div className="auc-won-panel__toolbar">
              <div className="auc-won-panel__title">
                <FaTrophy className="trophy-icon" />
                <span>Các sản phẩm bạn đã trúng thầu ({filteredWonOrders.length})</span>
              </div>
            </div>

            {filteredWonOrders.length === 0 ? (
              <div className="auc-bid-history-panel__empty">
                <FaTrophy className="empty-icon" style={{ color: "#e8c468" }} />
                <h3>Chưa tìm thấy sản phẩm trúng thầu phù hợp</h3>
                <p>Thử tìm kiếm với từ khóa khác hoặc tham gia các phiên đấu giá mới.</p>
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
                {filteredWonOrders.map((order) => (
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
                <span>Lịch sử các lần đấu giá của bạn ({filteredHistory.length})</span>
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

            {filteredHistory.length === 0 ? (
              <div className="auc-bid-history-panel__empty">
                <FaHistory className="empty-icon" />
                <h3>Chưa có lịch sử đấu giá phù hợp</h3>
                <p>Thử tìm kiếm với tên sản phẩm khác.</p>
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
                {filteredHistory.map((entry) => (
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
            {activitiesLoading ? (
              <div className="auc-bid-history-panel__empty" style={{ gridColumn: "1 / -1" }}>
                <p>Đang tải phiên đấu giá...</p>
              </div>
            ) : filteredLiveAuctions.length === 0 ? (
              <div className="auc-bid-history-panel__empty" style={{ gridColumn: "1 / -1" }}>
                <FaGavel className="empty-icon" />
                <h3>Không tìm thấy phiên đấu giá nào</h3>
                <p>Không có sản phẩm nào khớp với bộ lọc và tìm kiếm của bạn.</p>
              </div>
            ) : (
              filteredLiveAuctions.map((auction) => {
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
                        <span>Kết thúc trong:</span>
                        <AuctionCountdown endTime={auction.endTime || (Date.now() + 15120000)} />
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
                        onClick={() => handleInitiateBid(auction)}
                      >
                        <FaGavel /> Xác nhận đặt giá
                      </button>

                      <div className="bid-card__history">
                        <h4>LỊCH SỬ ĐẶT GIÁ</h4>
                        <ul>
                          {auction.bidHistory.map((bid, i) => {
                            const isMe = isAuthenticated && (isSameUser(user, bid.user) || (bid.userId && user?.id && String(bid.userId) === String(user?.id)));
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
              })
            )}
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

      {/* ─── Modal Xác Nhận Đặt Giá ─── */}
      {pendingBidModal && (
        <div className="auc-modal-overlay" onClick={() => setPendingBidModal(null)}>
          <div className="auc-modal auc-modal--confirm-bid" onClick={(e) => e.stopPropagation()}>
            <div className="auc-modal__header">
              <h3>
                <FaGavel style={{ color: "#e8c468" }} />
                Xác Nhận Đặt Giá Thầu
              </h3>
              <button type="button" onClick={() => setPendingBidModal(null)}><FaTimes /></button>
            </div>

            <div className="auc-modal__body">
              <div className="won-detail-product-card">
                <AuctionImage src={pendingBidModal.auction.image} alt={pendingBidModal.auction.title} />
                <div>
                  <strong>{pendingBidModal.auction.title}</strong>
                  <span style={{ color: "#8f7fbf", fontSize: "13px", display: "block", marginTop: "4px" }}>
                    Phiên đấu giá đang diễn ra
                  </span>
                </div>
              </div>

              <div className="confirm-bid-details">
                <div className="confirm-bid-row">
                  <span>Giá hiện tại:</span>
                  <strong>{pendingBidModal.currentPrice}</strong>
                </div>
                <div className="confirm-bid-row">
                  <span>Giá bạn muốn đặt:</span>
                  <strong style={{ color: "#e8c468", fontSize: "18px" }}>{pendingBidModal.formattedAmount}</strong>
                </div>
                <div className="confirm-bid-row">
                  <span>Mức tăng so với giá hiện tại:</span>
                  <strong style={{ color: "#10b981" }}>+{pendingBidModal.diff}</strong>
                </div>
              </div>

              <div className="confirm-bid-notice">
                <p>⚠️ <strong>Cam kết đặt giá:</strong> Lệnh đặt giá có hiệu lực ngay lập tức. Nếu thắng thầu, bạn có nghĩa vụ thanh toán sản phẩm này theo Quy chế Đấu giá của Nexus Platform.</p>
              </div>
            </div>

            <div className="auc-modal__footer">
              <button type="button" className="btn-cancel-modal" onClick={() => setPendingBidModal(null)}>
                Hủy bỏ
              </button>
              <button type="button" className="btn-confirm-bid-modal" onClick={handleExecuteBid}>
                <FaGavel /> Xác Nhận Đặt Giá Ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </AuctionSidebarLayout>
  );
}
