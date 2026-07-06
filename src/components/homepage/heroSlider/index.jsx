import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './index.module.scss';

/**
 * Carousel banner trái — auto-play, loop, dot indicator, prev/next khi hover.
 */
export default function HeroSlider({ images = [], autoPlayInterval = 3000 }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);
  const total = images.length;

  const goTo = useCallback(
    (index) => {
      if (total === 0) return;
      const next = ((index % total) + total) % total;
      setActiveIndex(next);
    },
    [total],
  );

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  useEffect(() => {
    if (total <= 1 || isPaused) return undefined;

    timerRef.current = setInterval(goNext, autoPlayInterval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoPlayInterval, goNext, isPaused, total]);

  if (total === 0) return null;

  return (
    <div
      className={styles.slider}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className={styles.viewport}>
        <div
          className={styles.track}
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {images.map((item) => (
            <div key={item.id} className={styles.slide}>
              <img src={item.src} alt={item.alt} loading={item.id === 1 ? 'eager' : 'lazy'} />
            </div>
          ))}
        </div>

        <button
          type="button"
          className={`${styles.arrow} ${styles.arrowPrev}`}
          onClick={goPrev}
          aria-label="Banner trước"
        >
          ‹
        </button>
        <button
          type="button"
          className={`${styles.arrow} ${styles.arrowNext}`}
          onClick={goNext}
          aria-label="Banner sau"
        >
          ›
        </button>
      </div>

      <div className={styles.dots} role="tablist" aria-label="Chọn banner">
        {images.map((item, index) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={index === activeIndex}
            aria-label={`Banner ${index + 1}`}
            className={`${styles.dot} ${index === activeIndex ? styles.dotActive : ''}`}
            onClick={() => goTo(index)}
          />
        ))}
      </div>
    </div>
  );
}
