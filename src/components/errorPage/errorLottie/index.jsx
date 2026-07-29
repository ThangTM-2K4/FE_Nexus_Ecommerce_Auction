import Lottie from 'lottie-react';
import './index.scss';

export default function ErrorLottie({ animationData, className = '' }) {
  if (!animationData) return null;

  const width = animationData.w || 400;
  const height = animationData.h || 300;

  return (
    <div
      className={`error-lottie-wrap ${className}`.trim()}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <Lottie
        animationData={animationData}
        loop
        autoplay
        className="error-lottie"
        rendererSettings={{ preserveAspectRatio: 'xMidYMid meet' }}
        aria-hidden="true"
      />
    </div>
  );
}
