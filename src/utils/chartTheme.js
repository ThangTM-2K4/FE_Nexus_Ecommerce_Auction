export const CHART_COLORS = [
  '#0A4174',
  '#7BBDE8',
  '#4E8EA2',
  '#6EA2B3',
  '#49769F',
  '#BDD8E9',
];

export const CHART_ACCENT = '#0A4174';
export const CHART_ACCENT_SOFT = '#7BBDE8';

export const chartGridProps = {
  stroke: '#e5e7eb',
  strokeDasharray: '3 3',
  vertical: false,
};

export const chartAxisProps = {
  tick: { fontSize: 11, fill: '#64748b' },
  tickLine: false,
  axisLine: false,
};

export const chartTooltipStyle = {
  contentStyle: {
    borderRadius: 10,
    border: '1px solid #e5e7eb',
    fontSize: 12,
    boxShadow: '0 8px 28px rgba(10, 65, 116, 0.12)',
  },
  labelStyle: { color: '#001d39', fontWeight: 600 },
};
