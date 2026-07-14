import { Outlet } from 'react-router-dom';
import AuctionHeader from '../auctionHeader';
import AuctionFooter from '../auctionFooter';
import './index.scss';

export default function AuctionLayout() {
  return (
    <div className="auction-layout">
      <AuctionHeader />
      <main className="auction-layout__main">
        <Outlet />
      </main>
      <AuctionFooter />
    </div>
  );
}
