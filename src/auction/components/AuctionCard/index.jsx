import { useNavigate } from "react-router-dom";
import { FaHeart, FaEye } from "react-icons/fa";
import AuctionImage from "../AuctionImage";
import "./index.scss";

const AuctionCard = ({ auction }) => {
  const navigate = useNavigate();

  return (
    <div className="auc-card">
      <div
        className="auc-card__image"
        onClick={() => navigate(`/auction/detail/${auction.id}`)}
      >
        <AuctionImage src={auction.image} alt={auction.title} />
        {auction.badge && (
          <span className={`auc-card__badge auc-card__badge--${auction.badge.type}`}>
            {auction.badge.label}
          </span>
        )}
      </div>

      <div className="auc-card__body">
        <div className="auc-card__title-row">
          <h3 onClick={() => navigate(`/auction/detail/${auction.id}`)}>
            {auction.title}
          </h3>
          <button type="button" className="auc-card__fav"><FaHeart /></button>
        </div>
        <p>{auction.description}</p>

        <div className="auc-card__price-box">
          <div>
            <span>Giá hiện tại</span>
            <strong>{auction.currentPrice}</strong>
          </div>
          <div>
            <span>Thời gian còn lại</span>
            <em>{auction.timeLeft}</em>
          </div>
        </div>

        <div className="auc-card__actions">
          <button
            type="button"
            className="auc-card__bid"
            onClick={() => navigate(`/auction/detail/${auction.id}`)}
          >
            ĐẶT GIÁ NGAY
          </button>
          <button
            type="button"
            className="auc-card__view"
            onClick={() => navigate(`/auction/detail/${auction.id}`)}
          >
            <FaEye />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuctionCard;
