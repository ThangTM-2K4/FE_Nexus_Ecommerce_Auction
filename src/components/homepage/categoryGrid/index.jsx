import { useMemo, useState } from 'react';
import CategoryItem from './CategoryItem';
import styles from './index.module.scss';

/**
 * Grid danh mục dạng carousel phân trang — 10 cột x 2 hàng mỗi trang.
 */
export default function CategoryGrid({
  categories = [],
  title = 'DANH MỤC',
  itemsPerPage = 20,
  columns = 10,
}) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(categories.length / itemsPerPage));

  const visibleItems = useMemo(() => {
    const start = page * itemsPerPage;
    return categories.slice(start, start + itemsPerPage);
  }, [categories, itemsPerPage, page]);

  const handleNext = () => {
    setPage((prev) => (prev + 1) % totalPages);
  };

  return (
    <section className={styles.section} aria-label={title}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        {totalPages > 1 && (
          <button
            type="button"
            className={styles.nextBtn}
            onClick={handleNext}
            aria-label="Xem thêm danh mục"
          >
            ›
          </button>
        )}
      </div>

      <div
        className={styles.grid}
        style={{ '--category-columns': columns }}
      >
        {visibleItems.map((cat) => (
          <CategoryItem key={cat.id} name={cat.name} icon={cat.icon} />
        ))}
      </div>
    </section>
  );
}
