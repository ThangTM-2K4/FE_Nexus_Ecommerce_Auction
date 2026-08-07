import { formatPrice } from '@/utils/formatPrice';
import './index.scss';

/** Grid chọn phân loại hàng (variant) */
export default function VariantSelector({ variants = [], selectedId, onChange }) {
  return (
    <div className="variant-selector">
      <p className="variant-selector__label">HÀNG HÓA</p>
      <div className="variant-selector__grid">
        {variants.map((variant) => (
          <button
            key={variant.id}
            type="button"
            className={`variant-selector__item ${
              selectedId === variant.id ? 'variant-selector__item--active' : ''
            }`}
            onClick={() => onChange?.(variant)}
          >
            <img src={variant.image} alt="" className="variant-selector__img" />
            <span className="variant-selector__name">{variant.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function getVariantPriceLabel(variants = [], selectedId, priceMin, priceMax) {
  const selected = variants.find((v) => v.id === selectedId);
  if (selected?.price && Number(selected.price) > 0) return formatPrice(selected.price);
  if (priceMin && priceMax && priceMin === priceMax && Number(priceMin) > 0) return formatPrice(priceMin);
  if (priceMin && priceMax && Number(priceMin) > 0) return `${formatPrice(priceMin)} - ${formatPrice(priceMax)}`;
  if (priceMin && Number(priceMin) > 0) return formatPrice(priceMin);
  return formatPrice(150000);
}
