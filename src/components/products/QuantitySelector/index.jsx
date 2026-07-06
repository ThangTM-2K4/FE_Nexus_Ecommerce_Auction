import './index.scss';

/** Bộ chọn số lượng */
export default function QuantitySelector({ value, max = 999, onChange, inStock = true }) {
  const handleDecrease = () => {
    if (value > 1) onChange?.(value - 1);
  };

  const handleIncrease = () => {
    if (value < max) onChange?.(value + 1);
  };

  const handleInput = (event) => {
    const next = Number.parseInt(event.target.value, 10);
    if (Number.isNaN(next) || next < 1) {
      onChange?.(1);
      return;
    }
    onChange?.(Math.min(next, max));
  };

  return (
    <div className="quantity-selector">
      <p className="quantity-selector__label">Số lượng</p>
      <div className="quantity-selector__row">
        <div className="quantity-selector__control">
          <button type="button" onClick={handleDecrease} disabled={!inStock || value <= 1} aria-label="Giảm">
            −
          </button>
          <input
            type="number"
            min={1}
            max={max}
            value={value}
            onChange={handleInput}
            disabled={!inStock}
            aria-label="Số lượng"
          />
          <button
            type="button"
            onClick={handleIncrease}
            disabled={!inStock || value >= max}
            aria-label="Tăng"
          >
            +
          </button>
        </div>
        <span className={`quantity-selector__stock ${inStock ? '' : 'quantity-selector__stock--out'}`}>
          {inStock ? 'CÒN HÀNG' : 'HẾT HÀNG'}
        </span>
      </div>
    </div>
  );
}
