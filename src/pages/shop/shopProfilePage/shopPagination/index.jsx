import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './index.scss';

function PageNumbers({ page, totalPages, onChange }) {
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, page - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  start = Math.max(1, end - maxVisible + 1);

  for (let i = start; i <= end; i += 1) {
    pages.push(i);
  }

  return (
    <div className="shop-pagination__numbers">
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          className={`shop-pagination__page ${p === page ? 'is-active' : ''}`}
          onClick={() => onChange(p)}
          aria-current={p === page ? 'page' : undefined}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

export default function ShopPagination({
  page,
  totalPages,
  onChange,
  variant = 'full',
}) {
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const goPrev = () => canPrev && onChange(page - 1);
  const goNext = () => canNext && onChange(page + 1);

  if (totalPages <= 1) return null;

  if (variant === 'compact') {
    return (
      <div className="shop-pagination shop-pagination--compact">
        <button type="button" disabled={!canPrev} onClick={goPrev} aria-label="Trang trước">
          <FiChevronLeft aria-hidden="true" />
        </button>
        <span className="shop-pagination__status">
          {page}/{totalPages}
        </span>
        <button type="button" disabled={!canNext} onClick={goNext} aria-label="Trang sau">
          <FiChevronRight aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <div className="shop-pagination shop-pagination--full">
      <button
        type="button"
        className="shop-pagination__arrow"
        disabled={!canPrev}
        onClick={goPrev}
        aria-label="Trang trước"
      >
        <FiChevronLeft aria-hidden="true" />
      </button>
      <PageNumbers page={page} totalPages={totalPages} onChange={onChange} />
      <button
        type="button"
        className="shop-pagination__arrow"
        disabled={!canNext}
        onClick={goNext}
        aria-label="Trang sau"
      >
        <FiChevronRight aria-hidden="true" />
      </button>
    </div>
  );
}
