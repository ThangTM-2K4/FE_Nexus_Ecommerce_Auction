import './index.scss';

export default function ProgressBar({ value = 0, rankClass = '', className = '', ariaLabel }) {
  const clamped = Math.min(100, Math.max(0, Number(value) || 0));

  return (
    <div
      className={`account-progress ${className}`.trim()}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel || 'Tiến độ uy tín'}
    >
      <div className="account-progress__track">
        <div
          className={`account-progress__fill ${rankClass}`.trim()}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
