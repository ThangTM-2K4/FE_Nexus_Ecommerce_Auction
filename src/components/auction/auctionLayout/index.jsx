import { useCallback, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import AuctionIntro from '../../auctionIntro';
import { hasSeenAuctionIntro, markAuctionIntroSeen } from '../../../utils/auctionIntroSession';
import AuctionHeader from '../auctionHeader';
import AuctionFooter from '../auctionFooter';
import AuctionCompareBar from '../auctionCompareBar';
import './index.scss';

export default function AuctionLayout() {
  const { user, isAuthenticated, authInitialized, loading } = useAuth();
  const userId = user?.id;
  const [introDecisionReady, setIntroDecisionReady] = useState(false);
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    if (!authInitialized || loading) {
      setIntroDecisionReady(false);
      return;
    }

    let shouldShowIntro;

    if (!isAuthenticated) {
      // Guest: luôn hiện intro, không check/lưu sessionStorage
      shouldShowIntro = true;
    } else {
      // User đã login: chỉ hiện nếu chưa xem trong phiên này
      shouldShowIntro = !hasSeenAuctionIntro(userId);
    }

    setShowIntro(shouldShowIntro);
    setIntroDecisionReady(true);
  }, [authInitialized, loading, isAuthenticated, userId]);

  const handleIntroFinish = useCallback(() => {
    if (isAuthenticated && userId) {
      markAuctionIntroSeen(userId);
    }
    setShowIntro(false);
  }, [isAuthenticated, userId]);

  return (
    <div className="auction-layout">
      <AuctionHeader />
      <main className="auction-layout__main">
        <Outlet />
      </main>
      <AuctionCompareBar />
      <AuctionFooter />
      {introDecisionReady && showIntro && (
        <AuctionIntro onFinish={handleIntroFinish} />
      )}
    </div>
  );
}
