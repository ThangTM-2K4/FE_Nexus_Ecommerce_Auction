import { useEffect, useMemo, useState } from 'react';
import { formatPrice } from '@/utils/formatPrice';
import './index.scss';

/**
 * Parses variants into 1 or 2 option groups (Shopee style).
 * Group 1 usually has images (e.g. Màu sắc).
 * Group 2 has text pills (e.g. Kích thước / Dòng).
 */
function parseVariantStructure(variants = []) {
  if (!Array.isArray(variants) || variants.length === 0) {
    return { groups: [], isMultiGroup: false };
  }

  // 1. Try extracting from variant.attributes object if available
  const sampleAttrs = variants.find(
    (v) => v.attributes && typeof v.attributes === 'object' && Object.keys(v.attributes).length > 0
  )?.attributes;

  const IGNORED_KEYS = new Set(['stock', 'stockQuantity', 'quantity', 'condition', 'barcode']);

  if (sampleAttrs) {
    const attrKeys = Object.keys(sampleAttrs).filter((k) => !IGNORED_KEYS.has(k));

    if (attrKeys.length >= 2) {
      const g1Key = attrKeys[0];
      const g2Key = attrKeys[1];

      const g1Map = new Map();
      const g2Map = new Map();

      variants.forEach((v) => {
        const val1 = v.attributes?.[g1Key];
        const val2 = v.attributes?.[g2Key];

        if (val1 && !g1Map.has(val1)) {
          g1Map.set(val1, { value: val1, image: v.image, variantId: v.id });
        }
        if (val2 && !g2Map.has(val2)) {
          g2Map.set(val2, { value: val2, image: null, variantId: v.id });
        }
      });

      return {
        groups: [
          { name: g1Key, hasImage: true, options: Array.from(g1Map.values()) },
          { name: g2Key, hasImage: false, options: Array.from(g2Map.values()) },
        ],
        isMultiGroup: true,
      };
    } else if (attrKeys.length === 1) {
      const gKey = attrKeys[0];
      const gMap = new Map();
      variants.forEach((v) => {
        const val = v.attributes?.[gKey];
        if (val && !gMap.has(val)) {
          gMap.set(val, { value: val, image: v.image, variantId: v.id });
        }
      });
      return {
        groups: [
          { name: gKey, hasImage: true, options: Array.from(gMap.values()) },
        ],
        isMultiGroup: false,
      };
    }
  }

  // 2. Try splitting variant names by " - " or " | " or " / "
  const splitVariants = variants.map((v) => {
    const nameStr = String(v.name || '').trim();
    const parts = nameStr.split(/\s*[-|/]\s*/).map((p) => p.trim()).filter(Boolean);
    return { variant: v, parts };
  });

  const maxParts = Math.max(...splitVariants.map((s) => s.parts.length), 0);

  if (maxParts >= 2) {
    const g1Name = "Màu sắc";
    const g2Name = "Kích thước";

    const g1Map = new Map();
    const g2Map = new Map();

    splitVariants.forEach(({ variant, parts }) => {
      const p1 = parts[0] || 'Mặc định';
      const p2 = parts.slice(1).join(' - ') || 'Tiêu chuẩn';

      if (!g1Map.has(p1)) {
        g1Map.set(p1, { value: p1, image: variant.image, variantId: variant.id });
      }
      if (!g2Map.has(p2)) {
        g2Map.set(p2, { value: p2, image: null, variantId: variant.id });
      }
    });

    return {
      groups: [
        { name: g1Name, hasImage: true, options: Array.from(g1Map.values()) },
        { name: g2Name, hasImage: false, options: Array.from(g2Map.values()) },
      ],
      isMultiGroup: true,
    };
  }

  // 3. Fallback: single flat variant list
  return {
    groups: [
      {
        name: "Phân loại",
        hasImage: true,
        options: variants.map((v) => ({
          value: v.name,
          image: v.image,
          variantId: v.id,
        })),
      },
    ],
    isMultiGroup: false,
  };
}

/** Grid chọn phân loại hàng (Shopee style multi-group variant selector) */
export default function VariantSelector({ variants = [], selectedId, onChange }) {
  const { groups, isMultiGroup } = useMemo(() => parseVariantStructure(variants), [variants]);

  const [selectedG1, setSelectedG1] = useState('');
  const [selectedG2, setSelectedG2] = useState('');

  useEffect(() => {
    if (!variants.length) return;
    const current = variants.find((v) => v.id === selectedId) || variants[0];
    if (!current) return;

    if (isMultiGroup && groups.length >= 2) {
      const g1Key = groups[0].name;
      const g2Key = groups[1].name;

      let val1 = current.attributes?.[g1Key];
      let val2 = current.attributes?.[g2Key];

      if (!val1 || !val2) {
        const parts = String(current.name || '').split(/\s*[-|/]\s*/).map((p) => p.trim());
        val1 = val1 || parts[0];
        val2 = val2 || parts.slice(1).join(' - ');
      }

      if (val1) setSelectedG1(val1);
      if (val2) setSelectedG2(val2);
    } else {
      setSelectedG1(current.name);
    }
  }, [variants, selectedId, isMultiGroup, groups]);

  const findMatchingVariant = (val1, val2) => {
    if (!isMultiGroup || groups.length < 2) {
      return variants.find((v) => v.name === val1 || v.id === val1) || variants[0];
    }

    const g1Key = groups[0].name;
    const g2Key = groups[1].name;

    // 1. Check exact attributes match
    let found = variants.find(
      (v) => v.attributes?.[g1Key] === val1 && v.attributes?.[g2Key] === val2
    );

    // 2. Check name substring/split match
    if (!found) {
      found = variants.find((v) => {
        const parts = String(v.name || '').split(/\s*[-|/]\s*/).map((p) => p.trim());
        const p1 = parts[0];
        const p2 = parts.slice(1).join(' - ');
        return p1 === val1 && p2 === val2;
      });
    }

    // 3. Fallback to first variant matching val1 or val2
    if (!found) {
      found = variants.find(
        (v) =>
          v.attributes?.[g1Key] === val1 ||
          String(v.name || '').includes(val1)
      );
    }

    return found || variants[0];
  };

  const handleSelectG1 = (optValue) => {
    setSelectedG1(optValue);
    const matched = findMatchingVariant(optValue, selectedG2);
    if (matched) onChange?.(matched);
  };

  const handleSelectG2 = (optValue) => {
    setSelectedG2(optValue);
    const matched = findMatchingVariant(selectedG1, optValue);
    if (matched) onChange?.(matched);
  };

  if (!variants || variants.length === 0) return null;

  return (
    <div className="variant-selector-shopee">
      {groups.map((group, groupIdx) => {
        const isGroup1 = groupIdx === 0;
        const currentSelected = isGroup1 ? selectedG1 : selectedG2;

        return (
          <div key={group.name} className="variant-selector-shopee__row">
            <span className="variant-selector-shopee__label">{group.name}</span>
            <div className="variant-selector-shopee__options">
              {group.options.map((opt) => {
                const isActive = currentSelected === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    className={`variant-selector-shopee__pill ${
                      isActive ? 'variant-selector-shopee__pill--active' : ''
                    } ${group.hasImage ? 'variant-selector-shopee__pill--has-img' : ''}`}
                    onClick={() =>
                      isGroup1 ? handleSelectG1(opt.value) : handleSelectG2(opt.value)
                    }
                  >
                    {group.hasImage && opt.image && (
                      <img src={opt.image} alt="" className="variant-selector-shopee__img" />
                    )}
                    <span className="variant-selector-shopee__text">{opt.value}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function getVariantPriceLabel(variants = [], selectedId, priceMin, priceMax) {
  const selected = variants.find((v) => v.id === selectedId);
  if (selected?.price && Number(selected.price) > 0) return formatPrice(selected.price);
  if (priceMin && priceMax && priceMin === priceMax && Number(priceMin) > 0) return formatPrice(priceMin);
  if (priceMin && priceMax && Number(priceMin) > 0) return `${formatPrice(priceMin)} - ${formatPrice(priceMax)}`;
  if (priceMin && Number(priceMin) > 0) return formatPrice(priceMin);
  return formatPrice(150000);
}

