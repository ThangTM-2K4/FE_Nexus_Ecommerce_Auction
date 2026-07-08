import styles from './index.module.scss';

/** Hai banner tĩnh xếp dọc — tổng chiều cao khớp slider trái */
export default function SideBanner({ images = [] }) {
  return (
    <div className={styles.side}>
      {images.map((item) => (
        <a key={item.id} href="#" className={styles.banner}>
          <img src={item.src} alt={item.alt} loading="lazy" />
        </a>
      ))}
    </div>
  );
}
