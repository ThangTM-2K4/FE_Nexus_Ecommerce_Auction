import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaGavel, FaTrash, FaClock, FaTh, FaList } from "react-icons/fa";
import { toast } from "react-toastify";
import AuctionSidebarLayout from "../../../components/auction/auctionSidebarLayout";
import AuctionImage from "../../../components/auction/auctionImage";
import "./index.scss";

const WATCHLIST_KEY = "auc_watchlist";

function formatDateTime(isoStr) {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AuctionWatchlistPage() {
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState([]);
  const [view, setView] = useState("grid");

  const loadWatchlist = useCallback(() => {
    try {
      const data = JSON.parse(localStorage.getItem(WATCHLIST_KEY) || "[]");
      setWatchlist(data);
    } catch {
      setWatchlist([]);
    }
  }, []);

  useEffect(() => {
    loadWatchlist();
    const onStorage = (e) => {
      if (!e.key || e.key === WATCHLIST_KEY) loadWatchlist();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [loadWatchlist]);

  const removeFromWatchlist = (id) => {
    const updated = watchlist.filter((item) => String(item.id) !== String(id));
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
    setWatchlist(updated);
    toast.info("Đã gỡ sản phẩm khỏi danh sách theo dõi");
  };

  const clearAll = () => {
    localStorage.removeItem(WATCHLIST_KEY);
    window.dispatchEvent(new Event("storage"));
    setWatchlist([]);
    toast.success("Đã xoá toàn bộ danh sách theo dõi!");
  };

  return (
    <AuctionSidebarLayout sidebarActive="watchlist">
      <div className="auc-watchlist-page">
        {/* Header */}
        <div className="auc-watchlist-page__header">
          <div className="auc-watchlist-page__title-area">
            <div className="auc-watchlist-page__icon">
              <FaHeart />
            </div>
            <div>
              <h1>Đang Theo Dõi</h1>
              <p>{watchlist.length > 0 ? `${watchlist.length} sản phẩm đang được theo dõi` : "Chưa có sản phẩm nào"}</p>
            </div>
          </div>
          <div className="auc-watchlist-page__controls">
            {watchlist.length > 0 && (
              <button type="button" className="btn-clear-all" onClick={clearAll}>
                <FaTrash /> Xoá tất cả
              </button>
            )}
            <div className="view-toggle">
              <button
                type="button"
                className={view === "grid" ? "active" : ""}
                onClick={() => setView("grid")}
                title="Dạng lưới"
              >
                <FaTh />
              </button>
              <button
                type="button"
                className={view === "list" ? "active" : ""}
                onClick={() => setView("list")}
                title="Dạng danh sách"
              >
                <FaList />
              </button>
            </div>
          </div>
        </div>

        {/* Empty state */}
        {watchlist.length === 0 ? (
          <div className="auc-watchlist-page__empty">
            <div className="empty-icon-wrapper">
              <FaHeart className="empty-icon" />
            </div>
            <h3>Chưa có sản phẩm đang theo dõi</h3>
            <p>
              Bấm biểu tượng trái tim ❤️ ở bất kỳ sản phẩm đấu giá nào
              <br />
              để thêm vào danh sách theo dõi của bạn.
            </p>
            <button
              type="button"
              className="btn-browse"
              onClick={() => navigate("/auction")}
            >
              <FaGavel /> Khám phá các phiên đấu giá
            </button>
          </div>
        ) : (
          <div className={`auc-watchlist-page__grid ${view}`}>
            {watchlist.map((item) => (
              <div key={item.id} className="watchlist-card">
                {/* Image area */}
                <div className="watchlist-card__image">
                  <AuctionImage
                    src={item.image || item.images?.[0]}
                    alt={item.title}
                    isLive={item.isLive}
                    isUpcoming={item.isUpcoming}
                    categoryLabel={item.categoryLabel}
                  />
                  <button
                    type="button"
                    className="watchlist-card__remove"
                    onClick={() => removeFromWatchlist(item.id)}
                    title="Bỏ theo dõi"
                  >
                    <FaHeart />
                  </button>
                </div>

                {/* Body */}
                <div className="watchlist-card__body">
                  <h3 className="watchlist-card__title">{item.title}</h3>

                  {item.description && (
                    <p className="watchlist-card__desc">{item.description}</p>
                  )}

                  <div className="watchlist-card__price">
                    <span>Giá hiện tại</span>
                    <strong>{item.currentPrice || item.currentBid}</strong>
                  </div>

                  {item.addedAt && (
                    <div className="watchlist-card__added">
                      <FaClock />
                      <span>Theo dõi từ: {formatDateTime(item.addedAt)}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    className="watchlist-card__bid-btn"
                    onClick={() => navigate(`/auction/detail/${item.id}`)}
                  >
                    <FaGavel /> Xem & Đặt giá ngay
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AuctionSidebarLayout>
  );
}
