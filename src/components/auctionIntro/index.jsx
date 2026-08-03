import { useCallback, useEffect, useRef, useState } from 'react';
import './index.scss';

const EXIT_MS = 500;

/** Đường dẫn public — file thực tế nằm tại public/video/ (không phải videos/) */
const VIDEO_ASSETS = {
  poster: '/images/auctionIntroPoster.jpg',
  webm: '/video/auctionIntro.webm',
  mp4: '/video/auctionIntro.mp4',
  mobileMp4: '/video/auctionIntro-mobile.mp4',
};

/**
 * Intro video full-screen.
 *
 * Component cha (AuctionLayout) quyết định khi nào render:
 * - Guest: luôn hiện mỗi lần vào khu vực auction
 * - User đã login: 1 lần / phiên (sessionStorage do cha xử lý trong onFinish)
 */
export default function AuctionIntro({ onFinish }) {
  const videoRef = useRef(null);
  const finishTimerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const mp4Src = isMobile ? VIDEO_ASSETS.mobileMp4 : VIDEO_ASSETS.mp4;

  useEffect(() => {
    console.log('[AuctionIntro] Resolved video sources:', {
      isMobile,
      poster: VIDEO_ASSETS.poster,
      webm: isMobile ? null : VIDEO_ASSETS.webm,
      mp4: mp4Src,
    });
  }, [isMobile, mp4Src]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    setIsVisible(true);

    return () => {
      document.body.style.overflow = '';
      if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  /** muted + play() thủ công — JSX muted/autoPlay alone is unreliable in React */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');

    video.load();

    const tryPlay = () => {
      console.log('[AuctionIntro] Attempting video.play(), readyState:', video.readyState);
      video
        .play()
        .then(() => console.log('[AuctionIntro] video.play() succeeded'))
        .catch((err) => {
          console.error('[AuctionIntro] video.play() rejected:', err);
        });
    };

    if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      tryPlay();
    } else {
      video.addEventListener('canplay', tryPlay, { once: true });
    }

    return () => {
      video.removeEventListener('canplay', tryPlay);
    };
  }, [isMobile, mp4Src]);

  const handleFinish = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);

    finishTimerRef.current = setTimeout(() => {
      onFinish?.();
    }, EXIT_MS);
  }, [isExiting, onFinish]);

  const handleVideoEnded = () => {
    console.log('[AuctionIntro] onEnded — video finished');
    handleFinish();
  };

  const handleVideoError = (event) => {
    const video = event.currentTarget;
    const mediaError = video.error;
    console.error('[AuctionIntro] onError (video element):', {
      code: mediaError?.code,
      message: mediaError?.message,
      currentSrc: video.currentSrc,
      networkState: video.networkState,
      readyState: video.readyState,
    });
  };

  const handleSourceError = (label, src) => (event) => {
    console.error(`[AuctionIntro] onError (source ${label}):`, {
      src,
      attemptedSrc: event.currentTarget?.src,
    });
  };

  return (
    <div
      className={`auction-intro ${isVisible ? 'is-visible' : ''} ${isExiting ? 'is-exiting' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Giới thiệu sàn đấu giá BidDoubleTK"
    >
      <div
        className={`auction-intro__video-wrapper ${isMobile ? 'is-mobile' : 'is-desktop'}`}
      >
        <video
          key={isMobile ? 'mobile' : 'desktop'}
          ref={videoRef}
          className="auction-intro__video"
          autoPlay
          muted
          playsInline
          poster={VIDEO_ASSETS.poster}
          onLoadedData={() => console.log('[AuctionIntro] onLoadedData')}
          onCanPlay={() => console.log('[AuctionIntro] onCanPlay')}
          onPlay={() => console.log('[AuctionIntro] onPlay — playback started')}
          onError={handleVideoError}
          onEnded={handleVideoEnded}
        >
          {!isMobile && (
            <source
              src={VIDEO_ASSETS.webm}
              type="video/webm"
              onError={handleSourceError('webm', VIDEO_ASSETS.webm)}
            />
          )}
          <source
            src={mp4Src}
            type="video/mp4"
            onError={handleSourceError('mp4', mp4Src)}
          />
        </video>
      </div>

      <div className="auction-intro__content">
        <div className="auction-intro__title-stack">
          <h1 className="auction-intro__title">BidDoubleTK</h1>
          <span className="auction-intro__title-glow" aria-hidden="true">
            BidDoubleTK
          </span>
        </div>
        <p className="auction-intro__tagline">Sân chơi đấu giá — Nơi giá trị lên ngôi</p>
        <div className="auction-intro__divider" aria-hidden="true" />
      </div>

      <button type="button" className="auction-intro__skip" onClick={handleFinish}>
        Bỏ qua
      </button>
    </div>
  );
}
