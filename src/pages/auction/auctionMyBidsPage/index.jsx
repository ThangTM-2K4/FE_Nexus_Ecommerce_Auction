import { useState } from "react";
import { FaTh, FaList, FaGavel } from "react-icons/fa";
import AuctionSidebarLayout from "../../../components/auction/auctionSidebarLayout";
import AuctionImage from "../../../components/auction/auctionImage";
import { myBidsAuctions } from "../../../data/auctionMockData";
import "./index.scss";

export default function AuctionMyBidsPage() {
  const [view, setView] = useState("grid");

  return (
    <AuctionSidebarLayout sidebarActive="bids">
      <div className="auc-my-bids">
        <div className="auc-my-bids__header">
          <div>
            <h1>Đấu Giá Đa Nhiệm</h1>
            <p>Giám sát 3 phiên đấu giá trực tiếp cùng lúc.</p>
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
          {myBidsAuctions.map((auction) => (
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
                    <button key={inc} type="button">{inc}</button>
                  ))}
                </div>

                <div className="bid-card__input">
                  <input type="text" placeholder="Nhập giá của bạn..." />
                  <span>VNĐ</span>
                </div>

                <button
                  type="button"
                  className={`bid-card__confirm bid-card__confirm--${auction.buttonStyle}`}
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
          ))}
        </div>
      </div>
    </AuctionSidebarLayout>
  );
}

