import { motion } from 'framer-motion';
import './index.scss';

const cardVariants = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -3,
    transition: { type: 'spring', stiffness: 420, damping: 22 },
  },
  tap: { scale: 0.98 },
};

export default function CategoryItem({ name, icon, onClick }) {
  return (
    <motion.button
      type="button"
      className="category-item"
      onClick={onClick}
      variants={cardVariants}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
    >
      <span className="category-item__card">
        <span className="category-item__visual">
          <img src={icon} alt="" className="category-item__image" loading="lazy" />
          <span className="category-item__overlay" aria-hidden="true" />
        </span>
        <span className="category-item__name">{name}</span>
      </span>
    </motion.button>
  );
}
