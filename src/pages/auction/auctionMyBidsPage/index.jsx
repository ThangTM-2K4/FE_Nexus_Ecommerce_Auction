import { useState } from "react";
import { FaTh, FaList, FaGavel } from "react-icons/fa";
import { toast } from "react-toastify";
import AuctionSidebarLayout from "../../../components/auction/auctionSidebarLayout";
import AuctionImage from "../../../components/auction/auctionImage";
import { myBidsAuctions } from "../../../data/auctionMockData";
import "./index.scss";

export default function AuctionMyBidsPage() {
  const [view, setView] = useState("grid");
  const [activeTab, setActiveTab] = useState("current");
  const [bidAmounts, setBidAmounts] = useState({});

  const parseIncrement = (str) => {
    const clean = str.replace(/[^0-9]/g, "");
    const val = Number(clean);
    if (str.toUpperCase().includes("K")) {
      return val * 1000;
    }
    if (str.toUpperCase().includes("M")) {
      return val * 1000000;
    }
    return val;
  };

  const handleIncrement = (auction, incStr) => {
    const currentInput = bidAmounts[auction.id] || "";
    const currentVal = currentInput
      ? Number(currentInput.replace(/[^0-9]/g, ""))
      : Number(auction.currentPrice.replace(/[^0-9]/g, ""));
    const inc = parseIncrement(incStr);
    const newVal = currentVal + inc;
    setBidAmounts({
      ...bidAmounts,
      [auction.id]: newVal.toLocaleString("vi-VN")
    });
  };

  const handleInputChange = (auctionId, value) => {
    const rawVal = value.replace(/[^0-9]/g, "");
    const numVal = Number(rawVal);
    setBidAmounts({
      ...bidAmounts,
      [auctionId]: rawVal ? numVal.toLocaleString("vi-VN") : ""
    });
  };

  const handleConfirmBid = (auction) => {
    const amountStr = bidAmounts[auction.id];
    if (!amountStr) {
      toast.error("Vui lòng nhập giá hoặc chọn mức tăng!");
      return;
    }
    toast.success(`🎉 Đặt giá ${amountStr} VNĐ thành công cho sản phẩm ${auction.title}!`);
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
                className={activeTab === "history" ? "active" : ""}
                onClick={() => setActiveTab("history")}
              >
                Lịch sử sản phẩm đấu giá
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

        <div className={`auc-my-bids__grid ${view}`}>
          {activeTab === "history" ? (
            <div className="auc-my-bids__empty" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "3rem", background: "rgba(30, 20, 50, 0.4)", borderRadius: "12px", color: "#EDE7F6" }}>
              <p>Chưa có lịch sử sản phẩm đấu giá nào.</p>
            </div>
          ) : (
            myBidsAuctions.map((auction) => (
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
                    onChange={(e) => handleInputChange(auction.id, e.target.value)}
                  />
                  <span>VNĐ</span>
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
                    {auction.bidHistory.map((bid, i) => (
                      <li
                        key={i}
                        className={bid.isYou ? (bid.isLeader ? "you-leading" : "you-outbid") : ""}
                      >
                        <span className="bid-history-user">
                          <AuctionImage
                            src={bid.avatar}
                            alt={bid.user}
                            className="bid-history-avatar"
                          />
                          {bid.user}
                        </span>
                        <em>{bid.amount}</em>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )))}
        </div>
      </div>
    </AuctionSidebarLayout>
  );
}

