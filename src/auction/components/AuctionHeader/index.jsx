import { useNavigate } from "react-router-dom";
import { FaBell, FaSearch } from "react-icons/fa";
import AuctionImage from "../AuctionImage";
import { auctionImages } from "../../data/images";
import "./index.scss";

const AuctionHeader = ({ activeTab = "buying" }) => {
  const navigate = useNavigate();

  return (
    <header className="auc-header">
      <div className="auc-header__inner">
        <div className="auc-header__left">
          <h1
            className="auc-header__logo"
            onClick={() => navigate("/auction/browse")}
          >
            Auction House
          </h1>
          <nav className="auc-header__tabs">
            <button
              type="button"
              className={activeTab === "buying" ? "active" : ""}
              onClick={() => navigate("/auction/browse")}
            >
              Buying
            </button>
            <button
              type="button"
              className={activeTab === "selling" ? "active" : ""}
              onClick={() => navigate("/auction/seller")}
            >
              Selling
            </button>
          </nav>
        </div>

        <div className="auc-header__search">
          <FaSearch />
          <input type="text" placeholder="Tìm kiếm phiên đấu giá..." />
        </div>

        <div className="auc-header__actions">
          <button type="button" className="auc-header__bell">
            <FaBell />
          </button>
          <button
            type="button"
            className="auc-header__avatar"
            onClick={() => navigate("/auction/profile")}
          >
            <AuctionImage
              src={auctionImages.avatars.main}
              alt="Avatar"
            />
          </button>
        </div>
      </div>
    </header>
  );
};

export default AuctionHeader;
