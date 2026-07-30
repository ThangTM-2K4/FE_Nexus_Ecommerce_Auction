import { Outlet } from 'react-router-dom';
import AuctionHeader from '../auctionHeader';
import AuctionFooter from '../auctionFooter';
import AuctionCompareBar from '../auctionCompareBar';
import './index.scss';

export default function AuctionLayout() {
  return (
    <div className="auction-layout">
      <AuctionHeader />
      <main className="auction-layout__main">
        <Outlet />
      </main>
      <AuctionCompareBar />
      <AuctionFooter />
    </div>
  );
}
