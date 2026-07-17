import { useState } from 'react';
import { FiFilter, FiSearch, FiX } from 'react-icons/fi';
import {
  auctionCategoryOptions,
  auctionEndingWithinOptions,
  auctionListingTypeOptions,
  auctionLocationOptions,
  auctionPriceRangeOptions,
  auctionSortOptions,
  auctionTimeRangeOptions,
} from '../../../data/auctionData';
import Select from '../../common/select';
import './index.scss';

const FILTER_GROUPS = [
  { key: 'category', label: 'Danh mục sản phẩm', options: auctionCategoryOptions },
  { key: 'location', label: 'Vị trí', options: auctionLocationOptions },
  { key: 'listingType', label: 'Loại tin đăng', options: auctionListingTypeOptions },
  { key: 'timeRange', label: 'Khoảng thời gian', options: auctionTimeRangeOptions },
  { key: 'endingWithin', label: 'Kết thúc trong', options: auctionEndingWithinOptions },
  { key: 'priceRange', label: 'Giá thầu hiện tại', options: auctionPriceRangeOptions },
  { key: 'excludeEnded', label: 'Loại trừ', options: [
    { value: '', label: 'Không loại trừ' },
    { value: 'ended', label: 'Ẩn phiên đã kết thúc' },
  ]},
];

const EMPTY_FILTERS = {
  category: '',
  location: '',
  listingType: '',
  timeRange: '',
  endingWithin: '',
  priceRange: '',
  excludeEnded: '',
};

export default function AuctionFilterBar({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  filters,
  onFiltersChange,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState(filters);

  const openDrawer = () => {
    setDraftFilters(filters);
    setDrawerOpen(true);
  };

  const applyDrawer = () => {
    onFiltersChange(draftFilters);
    setDrawerOpen(false);
  };

  const resetDrawer = () => {
    setDraftFilters(EMPTY_FILTERS);
    onFiltersChange(EMPTY_FILTERS);
    setDrawerOpen(false);
  };

  const handlePillChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <section className="auction-filter-bar" aria-label="Bộ lọc và sắp xếp đấu giá">
      <div className="auction-filter-bar__toolbar">
        <div className="auction-filter-bar__search">
          <FiSearch size={16} aria-hidden />
          <input
            type="search"
            placeholder="Tìm sản phẩm, danh mục..."
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            aria-label="Tìm kiếm phiên đấu giá"
          />
        </div>

        <div className="auction-filter-bar__sort">
          <span className="auction-filter-bar__sort-label">Sắp xếp theo</span>
          <Select
            value={sortBy}
            onChange={(event) => onSortChange(event.target.value)}
            options={auctionSortOptions}
            theme="dark"
            className="common-select--auto"
          />
        </div>

        <button type="button" className="auction-filter-bar__mobile-toggle" onClick={openDrawer}>
          <FiFilter size={16} aria-hidden />
          Bộ lọc
        </button>
      </div>

      <div className="auction-filter-bar__pills" id="categories">
        {FILTER_GROUPS.map((group) => (
          <div key={group.key} className="auction-filter-bar__pill">
            <Select
              value={filters[group.key]}
              onChange={(event) => handlePillChange(group.key, event.target.value)}
              options={group.options}
              placeholder={group.label}
              theme="dark"
              className="common-select--sm common-select--auto common-select--pill"
            />
          </div>
        ))}
      </div>

      {drawerOpen && (
        <>
          <div
            className="auction-filter-bar__drawer-backdrop"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <div className="auction-filter-bar__drawer" role="dialog" aria-modal="true" aria-label="Bộ lọc">
            <div className="auction-filter-bar__drawer-header">
              <h3>Bộ lọc</h3>
              <button type="button" onClick={() => setDrawerOpen(false)} aria-label="Đóng">
                <FiX size={18} />
              </button>
            </div>

            {FILTER_GROUPS.map((group) => (
              <div key={group.key} className="auction-filter-bar__drawer-group">
                <Select
                  label={group.label}
                  value={draftFilters[group.key]}
                  onChange={(event) =>
                    setDraftFilters((prev) => ({ ...prev, [group.key]: event.target.value }))
                  }
                  options={group.options}
                  theme="dark"
                />
              </div>
            ))}

            <div className="auction-filter-bar__drawer-actions">
              <button type="button" className="auction-filter-bar__reset" onClick={resetDrawer}>
                Đặt lại
              </button>
              <button type="button" className="auction-filter-bar__apply" onClick={applyDrawer}>
                Áp dụng
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export { EMPTY_FILTERS };
