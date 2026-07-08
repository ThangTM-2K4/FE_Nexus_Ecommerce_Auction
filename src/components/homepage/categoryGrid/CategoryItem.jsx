import styles from './index.module.scss';

export default function CategoryItem({ name, icon, onClick }) {
  return (
    <button type="button" className={styles.item} onClick={onClick}>
      <span className={styles.iconWrap}>
        <img src={icon} alt="" className={styles.icon} loading="lazy" />
      </span>
      <span className={styles.name}>{name}</span>
    </button>
  );
}
