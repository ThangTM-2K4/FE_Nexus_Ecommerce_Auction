//=====================================================
// Shared chart theme — Raspberry Bloom palette
// Single source of truth for every chart across the app
// (seller hub, staff/admin dashboards). Keep in sync with
// styles/_palette.scss.
//   #B35A8A raspberry · #F6B7C7 blush · #B6A5CE lavender
//   #523F77 indigo    · #7880AE slate · #A3BBD7 sky-pale
//=====================================================

// Ordered categorical series — high-contrast, brand-consistent.
export const CHART_COLORS = [
  '#523F77', // indigo
  '#B35A8A', // raspberry
  '#7880AE', // slate
  '#B6A5CE', // lavender
  '#A3BBD7', // sky-pale
  '#F6B7C7', // blush-pink
];

// Primary accent for lines/areas, and a soft accent for secondary bars.
export const CHART_ACCENT = '#B35A8A'; // raspberry
export const CHART_ACCENT_SOFT = '#B6A5CE'; // lavender

export const chartGridProps = {
  stroke: 'rgba(82, 63, 119, 0.1)',
  strokeDasharray: '3 3',
  vertical: false,
};

export const chartAxisProps = {
  tick: { fontSize: 11, fill: '#7880AE' },
  tickLine: false,
  axisLine: false,
};

export const chartTooltipStyle = {
  contentStyle: {
    borderRadius: 10,
    border: '1px solid rgba(182, 165, 206, 0.45)',
    fontSize: 12,
    boxShadow: '0 8px 28px rgba(82, 63, 119, 0.12)',
  },
  labelStyle: { color: '#523F77', fontWeight: 600 },
};
