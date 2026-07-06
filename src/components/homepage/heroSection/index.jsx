import HeroSlider from '../heroSlider';
import SideBanner from '../sideBanner';
import styles from './index.module.scss';

/** Section banner đầu trang: slider trái (2fr) + 2 banner phải (1fr) */
export default function HeroSection({ leftImages, rightImages, autoPlayInterval = 3000 }) {
  return (
    <section className={styles.heroSection} aria-label="Banner khuyến mãi">
      <div className={styles.left}>
        <HeroSlider images={leftImages} autoPlayInterval={autoPlayInterval} />
      </div>
      <div className={styles.right}>
        <SideBanner images={rightImages} />
      </div>
    </section>
  );
}
