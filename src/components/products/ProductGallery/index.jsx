import { useRef, useState } from 'react';
import { FiHeart } from 'react-icons/fi';
import './index.scss';

/** Gallery ảnh SP: ảnh lớn + thumbnail cuộn ngang */
export default function ProductGallery({ gallery = [], likeCount = 0 }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef(null);
  const fallbackItem = {
    id: 'g-fallback',
    src: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80',
    alt: 'Ảnh sản phẩm',
    isVideo: false,
  };
  const safeGallery = Array.isArray(gallery) && gallery.length > 0 ? gallery : [fallbackItem];
  const active = safeGallery[activeIndex] || safeGallery[0] || fallbackItem;

  return (
    <div className="product-gallery">
      <div className="product-gallery__main">
        <img src={active.src} alt={active.alt} className="product-gallery__main-img" />
        {active.isVideo && (
          <span className="product-gallery__video-badge" aria-hidden="true">
            ▶
          </span>
        )}
      </div>

      <div className="product-gallery__thumbs-wrap">
        <button
          type="button"
          className="product-gallery__thumb-arrow product-gallery__thumb-arrow--prev"
          onClick={() => scrollThumbs(-1)}
          aria-label="Cuộn thumbnail trái"
        >
          ‹
        </button>

        <div className="product-gallery__thumbs" ref={trackRef}>
          {safeGallery.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={`product-gallery__thumb ${
                index === activeIndex ? 'product-gallery__thumb--active' : ''
              }`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Xem ảnh ${index + 1}`}
            >
              <img src={item.src} alt="" />
              {item.isVideo && <span className="product-gallery__thumb-play">▶</span>}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="product-gallery__thumb-arrow product-gallery__thumb-arrow--next"
          onClick={() => scrollThumbs(1)}
          aria-label="Cuộn thumbnail phải"
        >
          ›
        </button>
      </div>

      <div className="product-gallery__actions">
        <div className="product-gallery__share">
          <span className="product-gallery__share-label">Chia sẻ:</span>
          {['f', 'p', 'x'].map((icon) => (
            <button key={icon} type="button" className="product-gallery__share-btn" aria-label="Chia sẻ">
              {icon}
            </button>
          ))}
        </div>
        <button type="button" className="product-gallery__like">
          <FiHeart className="product-gallery__like-icon" aria-hidden="true" />
          <span>Đã thích ({likeCount.toLocaleString('vi-VN')})</span>
        </button>
      </div>
    </div>
  );
}
