import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import CategoryItem from './categoryItem';
import './index.scss';

const ROWS = 2;
const COLUMNS = 10;

const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.02, delayChildren: 0.03 },
  },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const cellVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
  },
};

/**
 * Grid danh mục — 2 hàng cố định, phân trang theo columns × 2 (desktop: 10×2 = 20 item/trang).
 */
export default function CategoryGrid({
  categories = [],
  title = 'DANH MỤC NỔI BẬT',
  subtitle = '',
  columns: columnsProp = COLUMNS,
  rows = ROWS,
}) {
  const [page, setPage] = useState(0);

  const itemsPerPage = columnsProp * rows;
  const totalPages = Math.max(1, Math.ceil(categories.length / itemsPerPage));

  const visibleItems = useMemo(() => {
    const start = page * itemsPerPage;
    return categories.slice(start, start + itemsPerPage);
  }, [categories, itemsPerPage, page]);

  const handleNext = () => {
    setPage((prev) => (prev + 1) % totalPages);
  };

  return (
    <section className="category-grid" aria-label={title}>
      <header className="category-grid__header">
        <div className="category-grid__heading">
          <h2 className="category-grid__title">{title}</h2>
          {subtitle && <p className="category-grid__subtitle">{subtitle}</p>}
        </div>
        {totalPages > 1 && (
          <div className="category-grid__pager">
            <span className="category-grid__page-indicator">
              {page + 1}/{totalPages}
            </span>
            <motion.button
              type="button"
              className="category-grid__next-btn"
              onClick={handleNext}
              aria-label="Xem thêm danh mục"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
            >
              ›
            </motion.button>
          </div>
        )}
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          className="category-grid__grid"
          style={{ '--category-columns': columnsProp }}
          variants={gridVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {visibleItems.map((cat) => (
            <motion.div key={cat.id} className="category-grid__cell" variants={cellVariants}>
              <CategoryItem name={cat.name} icon={cat.icon} onClick={cat.onClick} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
