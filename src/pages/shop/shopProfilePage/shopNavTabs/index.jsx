import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiChevronDown } from 'react-icons/fi';
import './index.scss';

const PRIMARY_TAB_COUNT = 4;

function buildTabs(categories) {
  return [
    { key: 'browse', label: 'Dạo' },
    { key: 'all', label: 'Tất Cả Sản Phẩm' },
    ...categories.map((c) => ({ key: c.id, label: c.label })),
  ];
}

export default function ShopNavTabs({
  categories,
  activeTab,
  onChange,
}) {
  const allTabs = buildTabs(categories);
  const primaryTabs = allTabs.slice(0, 2 + PRIMARY_TAB_COUNT);
  const overflowTabs = allTabs.slice(2 + PRIMARY_TAB_COUNT);

  const [moreOpen, setMoreOpen] = useState(false);
  const [menuPos, setMenuPos] = useState(null);
  const moreRef = useRef(null);
  const menuRef = useRef(null);

  const isOverflowActive = overflowTabs.some((t) => t.key === activeTab);

  const updateMenuPos = useCallback(() => {
    const el = moreRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setMenuPos({ top: r.bottom + 4, left: r.left, minWidth: r.width });
  }, []);

  useLayoutEffect(() => {
    if (moreOpen) updateMenuPos();
  }, [moreOpen, updateMenuPos]);

  useEffect(() => {
    if (!moreOpen) return;
    const onPointerDown = (e) => {
      if (moreRef.current?.contains(e.target)) return;
      if (menuRef.current?.contains(e.target)) return;
      setMoreOpen(false);
    };
    const onScroll = () => updateMenuPos();
    document.addEventListener('mousedown', onPointerDown);
    window.addEventListener('resize', onScroll);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [moreOpen, updateMenuPos]);

  const handleSelect = (key) => {
    onChange(key);
    setMoreOpen(false);
  };

  const overflowLabel =
    isOverflowActive
      ? categories.find((c) => c.id === activeTab)?.label
      : null;

  return (
    <nav className="shop-nav-tabs" aria-label="Điều hướng shop">
      <div className="shop-nav-tabs__list" role="tablist">
        {primaryTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            className={`shop-nav-tabs__item ${activeTab === tab.key ? 'is-active' : ''}`}
            onClick={() => handleSelect(tab.key)}
          >
            {tab.label}
          </button>
        ))}

        {overflowTabs.length > 0 && (
          <div className="shop-nav-tabs__more" ref={moreRef}>
            <button
              type="button"
              className={`shop-nav-tabs__item shop-nav-tabs__item--more ${
                isOverflowActive ? 'is-active' : ''
              }`}
              aria-expanded={moreOpen}
              onClick={() => setMoreOpen((o) => !o)}
            >
              {overflowLabel || 'Thêm'}
              <FiChevronDown aria-hidden="true" />
            </button>

            {moreOpen && menuPos && createPortal(
              <ul
                className="shop-nav-tabs__dropdown"
                ref={menuRef}
                role="menu"
                style={{ top: menuPos.top, left: menuPos.left, minWidth: menuPos.minWidth }}
              >
                {overflowTabs.map((tab) => (
                  <li key={tab.key} role="none">
                    <button
                      type="button"
                      role="menuitem"
                      className={`shop-nav-tabs__dropdown-item ${
                        activeTab === tab.key ? 'is-active' : ''
                      }`}
                      onClick={() => handleSelect(tab.key)}
                    >
                      {tab.label}
                    </button>
                  </li>
                ))}
              </ul>,
              document.body,
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
