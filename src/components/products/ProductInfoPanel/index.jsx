import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronDown } from "react-icons/fi";
import { toast } from "react-toastify";
import { formatPrice } from "@/utils/formatPrice";
import { useCart } from "@/context/CartContext";import Button from "@/components/common/button";
import VariantSelector, { getVariantPriceLabel } from "../VariantSelector";
import QuantitySelector from "../QuantitySelector";
import "./index.scss";

/** Cột phải: tên, giá, vận chuyển, variant, số lượng, nút mua */
export default function ProductInfoPanel({ product }) {
  const navigate = useNavigate();
  const { addToCart, buyNow } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0]);
  const [quantity, setQuantity] = useState(1);
  const [policiesOpen, setPoliciesOpen] = useState(true);

  const priceLabel = getVariantPriceLabel(
    product.variants,
    selectedVariant?.id,
    product.priceMin,
    product.priceMax,
  );

  const buildCartProduct = () => ({
    productId: product.id,
    shopId: product.shop?.id || "shop-unknown",
    shopName: product.shop?.name || "Shop",
    name: product.title,
    image: selectedVariant?.image || product.gallery?.[0]?.src || "",
    variant: selectedVariant?.name || "",
    price: selectedVariant?.price ?? product.priceMin,
  });

  const handleAddToCart = () => {
    addToCart(buildCartProduct(), quantity);
    toast.success("Đã thêm vào giỏ hàng");
  };

  const handleBuyNow = () => {
    buyNow(buildCartProduct(), quantity);
    navigate("/cart");
  };

  const currentStock = selectedVariant?.stock ?? product.stock ?? 100;
  const isInStock = currentStock > 0;

  const displayRating = (product.reviewCount > 0 && Number(product.rating) > 0) ? product.rating : 5;

  return (
    <div className="product-info-panel">
      {product.badge && (
        <span className="product-info-panel__badge">{product.badge}</span>
      )}

      <h1 className="product-info-panel__title">{product.title}</h1>

      <div className="product-info-panel__meta">
        <div className="product-info-panel__meta-main">
          <span className="product-info-panel__rating">
            <strong>{displayRating}</strong> ★
          </span>
          <span className="product-info-panel__divider">|</span>
          <span>{(product.reviewCount || 0).toLocaleString("vi-VN")} Đánh Giá</span>
          <span className="product-info-panel__divider">|</span>
          <span>{product.soldCount || 0} Đã Bán</span>
        </div>
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
              <span className="product-info-panel__discount">
                -{product.discountPercent}%
              </span>
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



      <VariantSelector
        variants={product.variants}
        selectedId={selectedVariant?.id}
        onChange={setSelectedVariant}
      />

      <div className="product-info-panel__row product-info-panel__row--quantity">
        <span className="product-info-panel__label">Số lượng</span>
        <QuantitySelector
          value={quantity}
          max={currentStock}
          inStock={isInStock}
          onChange={setQuantity}
          showLabel={false}
        />
      </div>

      <div className="product-info-panel__actions">
        <Button
          variant="outline"
          disabled={!isInStock}
          onClick={handleAddToCart}
          className="product-info-panel__action-btn"
        >
          Thêm Vào Giỏ Hàng
        </Button>
        <Button
          variant="accent"
          disabled={!isInStock}
          onClick={handleBuyNow}
          className="product-info-panel__action-btn"
        >
          Mua Ngay
        </Button>
      </div>
    </div>
  );
}
