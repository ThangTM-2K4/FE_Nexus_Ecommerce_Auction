import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './index.scss';

const GAP = 8; // khoảng hở giữa ô điều khiển và popup
const MAX_H = 320;
const MIN_H = 140;

/**
 * Dropdown tự vẽ (thay <select> gốc).
 *
 * Lý do không dùng <select> gốc: popup của nó do OS vẽ — CSS không bo góc được
 * và không chặn được việc nó bật ngược lên trên khi gần đáy màn hình. Component
 * này luôn mở XUỐNG DƯỚI (top: 100%) và bo góc theo đúng thiết kế.
 *
 * API giữ nguyên như bản cũ: onChange nhận event giả {target:{name, value}}
 * nên các form đang dùng handleChange(e) không phải sửa gì.
 */
export default function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder,
  className = '',
  disabled = false,
  renderOption,
  renderValue,
  // 'dark' cho vùng nền tối (thanh lọc đấu giá). Popup portal ra <body> nên
  // không kế thừa được class cha — phải truyền theme xuống tận popup.
  theme,
  error,
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [pos, setPos] = useState(null);
  const rootRef = useRef(null);
  const listRef = useRef(null);
  const buttonRef = useRef(null);
  const typeahead = useRef({ term: '', at: 0 });
  const listId = useId();

  const selectedIndex = useMemo(
    () => options.findIndex((o) => String(o.value) === String(value)),
    [options, value]
  );
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null;

  const close = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, []);

  const commit = useCallback(
    (opt) => {
      onChange?.({ target: { name, value: opt.value } });
      close();
      buttonRef.current?.focus();
    },
    [onChange, name, close]
  );

  /**
     * Popup được portal ra <body> và dùng position:fixed nên không bị cha có
     * overflow (VD thân modal) cắt mất. LUÔN đặt dưới ô điều khiển — khi không
     * đủ chỗ thì thu thấp lại và cuộn bên trong, KHÔNG bao giờ lật ngược lên.
     */
  const updatePosition = useCallback(() => {
    const el = buttonRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const top = r.bottom + GAP;
    const available = window.innerHeight - top - 12;
    setPos({
      top,
      left: r.left,
      width: r.width,
      maxHeight: Math.max(MIN_H, Math.min(MAX_H, available)),
    });
  }, []);

  useLayoutEffect(() => {
    if (open) updatePosition();
  }, [open, updatePosition]);

  // Click ra ngoài → đóng. Cuộn/resize → bám lại theo ô điều khiển.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (rootRef.current?.contains(e.target)) return;
      if (listRef.current?.contains(e.target)) return;
      close();
    };
    const onScroll = () => updatePosition();
    document.addEventListener('mousedown', onPointerDown);
    window.addEventListener('resize', updatePosition);
    // capture: bắt cả cuộn trong thân modal, không chỉ cuộn window
    window.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [open, close, updatePosition]);

  // Mở ra thì đưa mục đang chọn vào tầm nhìn
  useEffect(() => {
    if (!open) return;
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    const id = requestAnimationFrame(() => {
      listRef.current
        ?.querySelector('[data-active="true"]')
        ?.scrollIntoView({ block: 'nearest' });
    });
    return () => cancelAnimationFrame(id);
  }, [open, selectedIndex]);

  useEffect(() => {
    if (!open || activeIndex < 0) return;
    listRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, open]);

  const moveActive = (delta) => {
    if (!options.length) return;
    setActiveIndex((prev) => {
      const start = prev < 0 ? (selectedIndex >= 0 ? selectedIndex : 0) : prev;
      return (start + delta + options.length) % options.length;
    });
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        close();
        buttonRef.current?.focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        moveActive(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        moveActive(-1);
        break;
      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case 'Tab':
        close();
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (options[activeIndex]) commit(options[activeIndex]);
        break;
      default: {
        // Gõ chữ để nhảy tới ngân hàng/mục bắt đầu bằng chữ đó
        if (e.key.length !== 1) return;
        const now = Date.now();
        const t = typeahead.current;
        t.term = now - t.at > 700 ? e.key : t.term + e.key;
        t.at = now;
        const found = options.findIndex((o) =>
          String(o.label).toLowerCase().startsWith(t.term.toLowerCase())
        );
        if (found >= 0) setActiveIndex(found);
      }
    }
  };

  const displayText = selected ? selected.label : placeholder || 'Chọn...';

  return (
    <div
      className={`common-select ${theme === 'dark' ? 'common-select--dark' : ''} ${
        error ? 'common-select--error' : ''
      } ${className}`
        .replace(/\s+/g, ' ')
        .trim()}
      ref={rootRef}
    >
      {label && (
        <span className="common-select__label" id={`${listId}-label`}>
          {label}
        </span>
      )}

      <button
        type="button"
        ref={buttonRef}
        className="common-select__field"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        aria-labelledby={label ? `${listId}-label` : undefined}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={handleKeyDown}
        data-open={open}
        data-placeholder={!selected}
      >
        <span className="common-select__value">
          {selected && renderValue ? renderValue(selected) : displayText}
        </span>
        <span className="common-select__arrow" aria-hidden="true">
          <svg viewBox="0 0 12 8" width="12" height="8">
            <path
              d="M1 1.5 6 6.5 11 1.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {open && pos && createPortal(
        <ul
          className="common-select__list"
          id={listId}
          role="listbox"
          ref={listRef}
          tabIndex={-1}
          data-theme={theme}
          style={{
            top: pos.top,
            left: pos.left,
            width: pos.width,
            maxHeight: pos.maxHeight,
          }}
          aria-activedescendant={activeIndex >= 0 ? `${listId}-opt-${activeIndex}` : undefined}
        >
          {!options.length && <li className="common-select__empty">Không có lựa chọn</li>}

          {options.map((opt, i) => {
            const isSelected = String(opt.value) === String(value);
            return (
              <li
                key={opt.value}
                id={`${listId}-opt-${i}`}
                role="option"
                aria-selected={isSelected}
                data-active={i === activeIndex}
                className="common-select__option"
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => commit(opt)}
              >
                {renderOption ? renderOption(opt, { selected: isSelected }) : opt.label}
                {isSelected && <span className="common-select__check">✓</span>}
              </li>
            );
          })}
        </ul>,
        document.body
      )}

      {error && <span className="common-select__error">{error}</span>}
    </div>
  );
}
