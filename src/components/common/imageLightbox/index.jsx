import { useEffect, useState } from "react";
import "./index.scss";

/**
 * Lightbox xem ảnh phóng to. Dùng cho ảnh data: URL (base64) vì trình duyệt
 * chặn mở data: URL bằng thẻ <a target="_blank"> — phải hiển thị bằng <img>
 * trong overlay. Hỗ trợ nhiều ảnh (điều hướng trái/phải) và zoom.
 */
export default function ImageLightbox({ images = [], index = 0, onClose }) {
  const [current, setCurrent] = useState(index);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => setCurrent(index), [index]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowRight") setCurrent((c) => (c + 1) % images.length);
      if (e.key === "ArrowLeft") setCurrent((c) => (c - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [images.length, onClose]);

  if (!images.length) return null;

  const item = images[current];
  const src = typeof item === "string" ? item : item.src;
  const caption = typeof item === "string" ? "" : item.caption;
  const hasMany = images.length > 1;

  const go = (dir) => (e) => {
    e.stopPropagation();
    setZoomed(false);
    setCurrent((c) => (c + dir + images.length) % images.length);
  };

  return (
    <div className="img-lightbox" onClick={onClose} role="presentation">
      <button type="button" className="img-lightbox__close" onClick={onClose} aria-label="Đóng">
        ✕
      </button>

      {hasMany && (
        <button type="button" className="img-lightbox__nav img-lightbox__nav--prev" onClick={go(-1)} aria-label="Ảnh trước">
          ‹
        </button>
      )}

      <figure className="img-lightbox__stage" onClick={(e) => e.stopPropagation()}>
        <img
          src={src}
          alt={caption || "Ảnh"}
          className={zoomed ? "is-zoomed" : ""}
          onClick={() => setZoomed((z) => !z)}
        />
        {caption && <figcaption>{caption}{hasMany ? ` · ${current + 1}/${images.length}` : ""}</figcaption>}
      </figure>

      {hasMany && (
        <button type="button" className="img-lightbox__nav img-lightbox__nav--next" onClick={go(1)} aria-label="Ảnh sau">
          ›
        </button>
      )}
    </div>
  );
}
