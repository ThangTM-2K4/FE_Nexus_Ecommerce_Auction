import { maskName } from '@/data/mockReviews';
import './index.scss';

function StarRating({ rating }) {
  return (
    <span className="review-item__stars" aria-label={`${rating} sao`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? 'review-item__star--on' : 'review-item__star'}>
          ★
        </span>
      ))}
    </span>
  );
}

/** Một đánh giá sản phẩm */
export default function ReviewItem({ review }) {
  return (
    <article className="review-item">
      <img src={review.avatar} alt="" className="review-item__avatar" />
      <div className="review-item__body">
        <div className="review-item__header">
          <span className="review-item__name">{maskName(review.userName)}</span>
          <StarRating rating={review.rating} />
        </div>
        <p className="review-item__meta">
          {review.date} | Phân loại: {review.variant}
        </p>
        <p className="review-item__content">{review.content}</p>

        {review.images?.length > 0 && (
          <div className="review-item__media">
            {review.images.map((src, index) => (
              <img key={index} src={src} alt="" className="review-item__media-img" loading="lazy" />
            ))}
          </div>
        )}

        <button type="button" className="review-item__helpful">
          👍 Hữu ích ({review.helpful})
        </button>
      </div>
    </article>
  );
}
