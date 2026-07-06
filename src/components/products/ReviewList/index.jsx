import { useMemo, useState } from 'react';
import { getReviewSummary } from '@/data/mockReviews';
import ReviewItem from '../ReviewItem';
import './index.scss';

const FILTER_KEYS = {
  ALL: 'all',
  STAR: (n) => `star-${n}`,
  COMMENT: 'comment',
  MEDIA: 'media',
};

/** Danh sách đánh giá + filter tabs */
export default function ReviewList({ reviews = [] }) {
  const summary = useMemo(() => getReviewSummary(reviews), [reviews]);
  const [activeFilter, setActiveFilter] = useState(FILTER_KEYS.ALL);

  const filters = [
    { key: FILTER_KEYS.ALL, label: 'Tất Cả' },
    ...summary.byStar
      .filter((item) => item.count > 0)
      .map((item) => ({
        key: FILTER_KEYS.STAR(item.star),
        label: `${item.star} Sao (${item.count})`,
      })),
    { key: FILTER_KEYS.COMMENT, label: `Có Bình Luận (${summary.withComment})` },
    { key: FILTER_KEYS.MEDIA, label: `Có Hình Ảnh/Video (${summary.withMedia})` },
  ];

  const filteredReviews = useMemo(() => {
    if (activeFilter === FILTER_KEYS.ALL) return reviews;
    if (activeFilter === FILTER_KEYS.COMMENT) {
      return reviews.filter((r) => r.content?.length > 0);
    }
    if (activeFilter === FILTER_KEYS.MEDIA) {
      return reviews.filter((r) => r.hasMedia);
    }
    if (activeFilter.startsWith('star-')) {
      const star = Number(activeFilter.replace('star-', ''));
      return reviews.filter((r) => r.rating === star);
    }
    return reviews;
  }, [activeFilter, reviews]);

  return (
    <section className="review-list">
      <h2 className="review-list__title">ĐÁNH GIÁ SẢN PHẨM</h2>

      <div className="review-list__summary">
        <div className="review-list__score">
          <span className="review-list__score-value">{summary.average}</span>
          <span className="review-list__score-label">trên 5</span>
          <span className="review-list__score-stars">★★★★★</span>
        </div>

        <div className="review-list__filters">
          {filters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              className={`review-list__filter ${
                activeFilter === filter.key ? 'review-list__filter--active' : ''
              }`}
              onClick={() => setActiveFilter(filter.key)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="review-list__items">
        {filteredReviews.map((review) => (
          <ReviewItem key={review.id} review={review} />
        ))}
      </div>
    </section>
  );
}
