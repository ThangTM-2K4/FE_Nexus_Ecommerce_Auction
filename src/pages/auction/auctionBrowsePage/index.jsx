import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuctionIntroBanner from '../../../components/auction/auctionIntroBanner';
import AuctionFilterBar, { EMPTY_FILTERS } from '../../../components/auction/auctionFilterBar';
import AuctionCard from '../../../components/auction/auctionCard';
import { auctionListings, countLiveAuctions } from '../../../data/auctionData';
import { useAuth } from '../../../context/AuthContext';
import './index.scss';

const HOUR = 3_600_000;
const DAY = 86_400_000;

function matchesSearch(item, query) {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  return (
    item.title.toLowerCase().includes(q) ||
    item.description.toLowerCase().includes(q) ||
    item.categoryLabel.toLowerCase().includes(q) ||
    item.location.toLowerCase().includes(q)
  );
}

function matchesPriceRange(item, range) {
  if (!range) return true;
  const bid = item.currentBid;
  if (range === '0-50m') return bid < 50_000_000;
  if (range === '50m-500m') return bid >= 50_000_000 && bid <= 500_000_000;
  if (range === '500m+') return bid > 500_000_000;
  return true;
}

function matchesEndingWithin(item, value) {
  if (!value) return true;
  const remaining = item.endTime - Date.now();
  if (remaining <= 0) return false;
  if (value === '1h') return remaining <= HOUR;
  if (value === '24h') return remaining <= DAY;
  if (value === '3d') return remaining <= 3 * DAY;
  return true;
}

function matchesTimeRange(item, value) {
  if (!value) return true;
  const age = Date.now() - item.postedAt;
  if (value === '24h') return age <= DAY;
  if (value === '7d') return age <= 7 * DAY;
  if (value === '30d') return age <= 30 * DAY;
  return true;
}

function sortListings(list, sortBy) {
  const copy = [...list];
  if (sortBy === 'price-high') {
    return copy.sort((a, b) => b.currentBid - a.currentBid);
  }
  if (sortBy === 'newest') {
    return copy.sort((a, b) => b.postedAt - a.postedAt);
  }
  return copy.sort((a, b) => a.endTime - b.endTime);
}

export default function AuctionBrowsePage() {
  const navigate = useNavigate();
  const { isBuyerMode } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('ending-soon');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'live';
  
  const setActiveTab = (tab) => {
    setSearchParams((prev) => {
      if (tab === 'live') {
        prev.delete('tab');
      } else {
        prev.set('tab', tab);
      }
      return prev;
    });
  };

  const liveCount = useMemo(() => countLiveAuctions(auctionListings), []);

  const filteredListings = useMemo(() => {
    const filtered = auctionListings.filter((item) => {
      if (!matchesSearch(item, searchQuery)) return false;
      if (filters.category && item.category !== filters.category) return false;
      if (filters.location && item.location !== filters.location) return false;
      if (filters.listingType && item.listingType !== filters.listingType) return false;
      if (!matchesTimeRange(item, filters.timeRange)) return false;
      if (!matchesEndingWithin(item, filters.endingWithin)) return false;
      if (!matchesPriceRange(item, filters.priceRange)) return false;
      if (filters.excludeEnded === 'ended' && item.endTime <= Date.now()) return false;
      
      if (activeTab === 'upcoming') {
        if (!item.isUpcoming) return false;
      } else {
        if (item.isUpcoming) return false;
      }
      
      return true;
    });

    return sortListings(filtered, sortBy);
  }, [searchQuery, sortBy, filters, activeTab]);

  return (
    <div className="auction-browse-page">
      <AuctionIntroBanner />

      <header className="auction-browse-page__heading">
        <h1>Các phiên đấu giá hiện tại</h1>
        <p>
          Hiện có <strong>{liveCount}</strong> phiên đang diễn ra trên sàn
        </p>

        {isBuyerMode && (
          <div className="auction-browse-page__tabs">
            <button 
              type="button" 
              className={activeTab === 'live' ? 'active' : ''}
              onClick={() => setActiveTab('live')}
            >
              Đấu giá trực tuyến
            </button>
            <button 
              type="button" 
              className={activeTab === 'upcoming' ? 'active' : ''}
              onClick={() => setActiveTab('upcoming')}
            >
              Chuẩn bị đấu giá
            </button>
          </div>
        )}
      </header>



      <AuctionFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        filters={filters}
        onFiltersChange={setFilters}
      />

      <div className="auction-browse-page__grid" role="list">
        {filteredListings.length === 0 ? (
          <div className="auction-browse-page__empty" role="status">
            <p>Không tìm thấy phiên đấu giá phù hợp. Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm.</p>
            <button
              type="button"
              className="auction-browse-page__reset-btn"
              onClick={() => {
                setFilters(EMPTY_FILTERS);
                setSearchQuery('');
              }}
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        ) : (
          filteredListings.map((auction) => (
            <div key={auction.id} role="listitem">
              <AuctionCard auction={auction} onClick={() => navigate(`/auction/detail/${auction.id}`)} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
