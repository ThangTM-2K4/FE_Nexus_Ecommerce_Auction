import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import AuctionLayout from "../../../components/auction/auctionLayout";
import AuctionImage from "../../../components/auction/auctionImage";
import { sellerStats, sellerAuctions } from "../../../data/auctionMockData";
import "./index.scss";

export default function AuctionSellerPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("all");

  return (
    <AuctionLayout activeTab="selling" sidebarActive="auctions">
      <div className="auc-seller">
        <div className="auc-seller__header">
          <div>
            <h1>Tổng quan người bán</h1>
            <p>Quản lý các sản phẩm đấu giá và theo dõi doanh thu của bạn.</p>
          </div>
          <button
            type="button"
            className="auc-seller__create"
            onClick={() => navigate("/auction/create")}
          >
            <FaPlus /> Tạo đấu giá mới
          </button>
        </div>

        <div className="auc-seller__stats">
          {sellerStats.map((stat) => (
            <div key={stat.label} className="stat-card">
              <AuctionImage
                src={stat.image}
                alt={stat.label}
                className="stat-card__img"
              />
              <span className="stat-card__label">{stat.label}</span>
              <span className="stat-card__value">{stat.value}</span>
              {stat.trend && (
                <span className="stat-card__trend">{stat.trend}</span>
              )}
              {stat.sub && (
                <span className="stat-card__sub">{stat.sub}</span>
              )}
            </div>
          ))}
        </div>

        <section className="auc-seller__table-section">
          <h2>Đấu giá của bạn</h2>

          <div className="auc-seller__tabs">
            {[
              { id: "all", label: "Tất cả" },
              { id: "active", label: "Đang diễn ra" },
              { id: "ended", label: "Đã kết thúc" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                className={tab === t.id ? "active" : ""}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="auc-seller__table-wrap">
            <table>
              <thead>
                <tr>
                  <th>SẢN PHẨM</th>
                  <th>TRẠNG THÁI</th>
                  <th>LƯỢT BID</th>
                  <th>GIÁ HIỆN TẠI</th>
                  <th>THỜI GIAN CÒN LẠI</th>
                </tr>
              </thead>
              <tbody>
                {sellerAuctions.map((item) => (
                  <tr key={item.id}>
                    <td className="product-cell">
                      <AuctionImage src={item.image} alt={item.name} />
                      <div>
                        <strong>{item.name}</strong>
                        <span>{item.code}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status status--${item.status.type}`}>
                        {item.status.label}
                      </span>
                    </td>
                    <td>{item.bids}</td>
                    <td className="price">{item.currentPrice}</td>
                    <td className="time">{item.timeLeft}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button type="button" className="auc-seller__view-all">
            Xem tất cả đấu giá
          </button>
        </section>
      </div>
    </AuctionLayout>
  );
}

