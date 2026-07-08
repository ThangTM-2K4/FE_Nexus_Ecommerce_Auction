import { useState } from 'react';
import { formatPrice } from '@/utils/formatPrice';
import VariantSelector, { getVariantPriceLabel } from '../VariantSelector';
import QuantitySelector from '../QuantitySelector';
import './index.scss';

/** Cột phải: tên, giá, vận chuyển, variant, số lượng, nút mua */
export default function ProductInfoPanel({ product }) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0]);
  const [quantity, setQuantity] = useState(1);
  const [policiesOpen, setPoliciesOpen] = useState(true);

  const priceLabel = getVariantPriceLabel(
    product.variants,
    selectedVariant?.id,
    product.priceMin,
    product.priceMax,
  );

  return (
    <div className="product-info-panel">
      {product.badge && <span className="product-info-panel__badge">{product.badge}</span>}

      <h1 className="product-info-panel__title">{product.title}</h1>

      <div className="product-info-panel__meta">
        <span className="product-info-panel__rating">
          <strong>{product.rating}</strong> ★
        </span>
        <span className="product-info-panel__divider">|</span>
        <span>{product.reviewCount.toLocaleString('vi-VN')} Đánh Giá</span>
        <span className="product-info-panel__divider">|</span>
        <span>{product.soldCount} Đã Bán</span>
        <button type="button" className="product-info-panel__report">
          Tố cáo
        </button>
      </div>

      <div className="product-info-panel__price-block">
        <div className="product-info-panel__price-row">
          <span className="product-info-panel__price">{priceLabel}</span>
          {product.discountPercent > 0 && (
            <>
              <span className="product-info-panel__original">
                {formatPrice(product.originalPrice)}
              </span>
              <span className="product-info-panel__discount">-{product.discountPercent}%</span>
            </>
          )}
        </div>
      </div>

      <div className="product-info-panel__row">
        <span className="product-info-panel__label">Vận Chuyển</span>
        <div>
          <strong>{product.shipping}</strong>
          {product.shippingNote && (
            <p className="product-info-panel__sub">{product.shippingNote}</p>
          )}
        </div>
      </div>

      <div className="product-info-panel__row product-info-panel__row--policy">
        <span className="product-info-panel__label">An Tâm Mua Sắm</span>
        <div className="product-info-panel__policies">
          <button
            type="button"
            className="product-info-panel__policy-toggle"
            onClick={() => setPoliciesOpen((v) => !v)}
          >
            An Tâm Mua Sắm Cùng Shopee {policiesOpen ? '∧' : '∨'}
          </button>
          {policiesOpen && (
            <ul className="product-info-panel__policy-list">
              {product.policies.map((policy) => (
                <li key={policy.text}>
                  <span aria-hidden="true">{policy.icon}</span> {policy.text}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <VariantSelector
        variants={product.variants}
        selectedId={selectedVariant?.id}
        onChange={setSelectedVariant}
      />

      <QuantitySelector
        value={quantity}
        max={product.stock}
        inStock={product.inStock}
        onChange={setQuantity}
      />

      <div className="product-info-panel__actions">
        <button
          type="button"
          className="product-info-panel__btn product-info-panel__btn--cart"
          disabled={!product.inStock}
        >
          Thêm Vào Giỏ Hàng
        </button>
        <button
          type="button"
          className="product-info-panel__btn product-info-panel__btn--buy"
          disabled={!product.inStock}
        >
          Mua Ngay
        </button>
      </div>
    </div>
  );
}
