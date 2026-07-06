import { Link } from 'react-router-dom';
import './index.scss';

/** Breadcrumb: Shopee > Danh mục > ... > Tên SP */
export default function Breadcrumb({ items = [] }) {
  return (
    <nav className="product-breadcrumb" aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={`${item.label}-${index}`} className="product-breadcrumb__segment">
            {index > 0 && <span className="product-breadcrumb__sep">&gt;</span>}
            {item.href && !isLast ? (
              <Link to={item.href} className="product-breadcrumb__link">
                {item.label}
              </Link>
            ) : (
              <span className="product-breadcrumb__current">{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
