import { useState } from "react";
import { CHART_COLORS } from "../../../utils/chartTheme";
import "./index.scss";

export const BarChart = ({ title, subtitle, labels, values, unit, color = CHART_COLORS[0] }) => {
  const max = Math.max(...values, 1);
  return (
    <div className="adm-chart adm-chart--bar">
      <ChartHeader title={title} subtitle={subtitle} unit={unit} />
      <div className="adm-chart__bars">
        {values.map((v, i) => (
          <div key={labels[i]} className="adm-chart__bar-col">
            <span className="adm-chart__bar-val">{v}</span>
            <div className="adm-chart__bar-track">
              <div className="adm-chart__bar-fill" style={{ height: `${(v / max) * 100}%`, background: color }} />
            </div>
            <small>{labels[i]}</small>
          </div>
        ))}
      </div>
    </div>
  );
};

export const LineChart = ({
  title,
  subtitle,
  labels,
  values,
  unit,
  color = CHART_COLORS[0],
  detailed = false,
  dates,
  orders,
  changePct,
}) => {
  const [hoverIdx, setHoverIdx] = useState(null);
  const max = Math.max(...values, 1);
  const min = Math.min(...values);
  const padL = detailed ? 42 : 8;
  const padR = 12;
  const padT = detailed ? 28 : 8;
  const padB = 8;
  const w = detailed ? 480 : 280;
  const h = detailed ? 160 : 120;
  const range = max - min || 1;
  const total = values.reduce((a, b) => a + b, 0);
  const avg = Math.round(total / values.length);
  const peakIdx = values.indexOf(max);
  const peakLabel = labels[peakIdx];

  const getPoint = (v, i) => {
    const x = padL + (i / (values.length - 1 || 1)) * (w - padL - padR);
    const y = h - padB - ((v - min) / range) * (h - padT - padB);
    return { x, y };
  };

  const pts = values.map((v, i) => {
    const { x, y } = getPoint(v, i);
    return `${x},${y}`;
  }).join(" ");

  const yTicks = detailed
    ? [max, Math.round(min + range * 0.66), Math.round(min + range * 0.33), min]
    : [];

  const activeIdx = hoverIdx ?? peakIdx;
  const activePoint = getPoint(values[activeIdx], activeIdx);

  return (
    <div className={`adm-chart adm-chart--line${detailed ? " adm-chart--line-detailed" : ""}`}>
      <ChartHeader title={title} subtitle={subtitle} unit={unit} />
      {detailed && (
        <div className="adm-chart__summary">
          <div className="adm-chart__summary-item">
            <span>Tổng tuần</span>
            <strong>{total} {unit?.replace("VNĐ", "").trim() || ""}</strong>
          </div>
          <div className="adm-chart__summary-item">
            <span>Trung bình/ngày</span>
            <strong>{avg} tr</strong>
          </div>
          <div className="adm-chart__summary-item">
            <span>Cao nhất</span>
            <strong>{max} tr · {peakLabel}</strong>
          </div>
          {changePct != null && (
            <div className={`adm-chart__summary-item adm-chart__summary-item--${changePct >= 0 ? "up" : "down"}`}>
              <span>So tuần trước</span>
              <strong>{changePct >= 0 ? "+" : ""}{changePct}%</strong>
            </div>
          )}
        </div>
      )}
      <div className="adm-chart__line-body">
        {detailed && (
          <div className="adm-chart__y-labels">
            {yTicks.map((tick) => (
              <span key={tick}>{tick}</span>
            ))}
          </div>
        )}
        <svg viewBox={`0 0 ${w} ${h}`} className="adm-chart__svg">
          {!detailed && (
            <defs>
              <linearGradient id="adm-line-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.12" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>
          )}
          {!detailed && [0.25, 0.5, 0.75].map((p) => (
            <line
              key={p}
              x1={padL}
              y1={h - padB - p * (h - padT - padB)}
              x2={w - padR}
              y2={h - padB - p * (h - padT - padB)}
              className="adm-chart__grid"
            />
          ))}
          {!detailed && (
            <polygon
              points={`${padL},${h - padB} ${pts} ${w - padR},${h - padB}`}
              fill="url(#adm-line-fill)"
            />
          )}
          <polyline
            points={pts}
            fill="none"
            stroke={color}
            strokeWidth={detailed ? 2 : 2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="adm-chart__line-stroke"
          />
          {values.map((v, i) => {
            const { x, y } = getPoint(v, i);
            const isActive = hoverIdx === i;
            return (
              <g key={labels[i]}>
                {detailed ? (
                  <>
                    {isActive && (
                      <>
                        <text x={x} y={y - 10} textAnchor="middle" className="adm-chart__point-val active">
                          {v}
                        </text>
                        <circle cx={x} cy={y} r="4" fill="#fff" stroke={color} strokeWidth="1.5" />
                      </>
                    )}
                    <circle
                      cx={x}
                      cy={y}
                      r="12"
                      fill="transparent"
                      className="adm-chart__point-hit"
                      onMouseEnter={() => setHoverIdx(i)}
                      onMouseLeave={() => setHoverIdx(null)}
                    />
                    <title>{`${dates?.[i] || labels[i]}: ${v} tr${orders?.[i] ? ` · ${orders[i]} đơn` : ""}`}</title>
                  </>
                ) : (
                  <circle cx={x} cy={y} r="4" fill="#fff" stroke={color} strokeWidth="2" />
                )}
              </g>
            );
          })}
          {detailed && hoverIdx != null && (
            <g className="adm-chart__tooltip">
              <rect
                x={activePoint.x - 54}
                y={activePoint.y - 48}
                width="108"
                height="36"
                rx="6"
                className="adm-chart__tooltip-bg"
              />
              <text x={activePoint.x} y={activePoint.y - 33} textAnchor="middle" className="adm-chart__tooltip-date">
                {dates?.[hoverIdx] || labels[hoverIdx]}
              </text>
              <text x={activePoint.x} y={activePoint.y - 20} textAnchor="middle" className="adm-chart__tooltip-val">
                {values[hoverIdx]} tr · {orders?.[hoverIdx]?.toLocaleString("vi-VN")} đơn
              </text>
            </g>
          )}
        </svg>
      </div>
      <div className="adm-chart__x-labels">
        {(detailed && dates ? dates : labels).map((l) => <small key={l}>{l}</small>)}
      </div>
      {detailed && orders && (
        <div className="adm-chart__detail-table">
          <div className="adm-chart__detail-row adm-chart__detail-row--head">
            <span>Ngày</span>
            <span>Doanh thu</span>
            <span>Đơn hàng</span>
            <span>TB/đơn</span>
          </div>
          {values.map((v, i) => (
            <div
              key={labels[i]}
              className={`adm-chart__detail-row${hoverIdx === i ? " active" : ""}`}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
            >
              <span>{dates?.[i] || labels[i]} ({labels[i]})</span>
              <span><strong>{v} tr</strong></span>
              <span>{orders[i]?.toLocaleString("vi-VN")}</span>
              <span>{orders[i] ? `${Math.round((v * 1_000_000) / orders[i] / 1000)}k` : "—"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const DonutChart = ({ title, subtitle, segments }) => {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  let offset = 0;
  const r = 54;
  const c = 2 * Math.PI * r;

  return (
    <div className="adm-chart adm-chart--donut">
      <ChartHeader title={title} subtitle={subtitle} />
      <div className="adm-chart__donut-wrap">
        <svg viewBox="0 0 140 140" className="adm-chart__donut-svg">
          {segments.map((seg, i) => {
            const pct = seg.value / total;
            const dash = pct * c;
            const el = (
              <circle
                key={seg.label}
                cx="70" cy="70" r={r}
                fill="none"
                stroke={seg.color || CHART_COLORS[i % CHART_COLORS.length]}
                strokeWidth="18"
                strokeDasharray={`${dash} ${c - dash}`}
                strokeDashoffset={-offset}
                transform="rotate(-90 70 70)"
              />
            );
            offset += dash;
            return el;
          })}
          <text x="70" y="66" textAnchor="middle" className="adm-chart__donut-total">{total}%</text>
          <text x="70" y="82" textAnchor="middle" className="adm-chart__donut-sub">tổng</text>
        </svg>
        <ul className="adm-chart__legend">
          {segments.map((seg, i) => (
            <li key={seg.label}>
              <span style={{ background: seg.color || CHART_COLORS[i % CHART_COLORS.length] }} />
              {seg.label} <em>{seg.value}%</em>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export const HorizontalBarChart = ({ title, subtitle, items, unit }) => {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="adm-chart adm-chart--hbar">
      <ChartHeader title={title} subtitle={subtitle} unit={unit} />
      <ul className="adm-chart__hbar-list">
        {items.map((item, i) => (
          <li key={item.label}>
            <span className="adm-chart__hbar-label">{item.label}</span>
            <div className="adm-chart__hbar-track">
              <div
                className="adm-chart__hbar-fill"
                style={{ width: `${(item.value / max) * 100}%`, background: CHART_COLORS[i % CHART_COLORS.length] }}
              />
            </div>
            <span className="adm-chart__hbar-val">{item.display || item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const SparklineChart = ({ title, subtitle, labels, values, unit, color = CHART_COLORS[1] }) => {
  const max = Math.max(...values, 1);
  const total = values.reduce((a, b) => a + b, 0);
  const w = 200;
  const h = 48;
  const pts = values.map((v, i) => `${(i / (values.length - 1 || 1)) * w},${h - (v / max) * h}`).join(" ");

  return (
    <div className="adm-chart adm-chart--spark">
      <ChartHeader title={title} subtitle={subtitle} unit={unit} />
      <div className="adm-chart__spark-body">
        <strong className="adm-chart__spark-total">{total.toLocaleString("vi-VN")}</strong>
        <svg viewBox={`0 0 ${w} ${h}`} className="adm-chart__spark-svg">
          <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <div className="adm-chart__x-labels">
        {labels.map((l) => <small key={l}>{l}</small>)}
      </div>
    </div>
  );
};

export const StackedBarChart = ({ title, subtitle, labels, series, unit }) => {
  const totals = labels.map((_, i) => series.reduce((s, ser) => s + ser.values[i], 0));
  const max = Math.max(...totals, 1);

  return (
    <div className="adm-chart adm-chart--stacked">
      <ChartHeader title={title} subtitle={subtitle} unit={unit} />
      <div className="adm-chart__bars">
        {labels.map((label, i) => (
          <div key={label} className="adm-chart__bar-col">
            <div className="adm-chart__stacked-track">
              {series.map((ser) => (
                <div
                  key={ser.name}
                  className="adm-chart__stacked-seg"
                  style={{
                    height: `${(ser.values[i] / max) * 100}%`,
                    background: ser.color,
                  }}
                  title={`${ser.name}: ${ser.values[i]}`}
                />
              ))}
            </div>
            <small>{label}</small>
          </div>
        ))}
      </div>
      <ul className="adm-chart__legend adm-chart__legend--inline">
        {series.map((ser) => (
          <li key={ser.name}><span style={{ background: ser.color }} />{ser.name}</li>
        ))}
      </ul>
    </div>
  );
};

const ChartHeader = ({ title, subtitle, unit }) => (
  <header className="adm-chart__header">
    <div>
      <h3>{title}</h3>
      {subtitle && <p>{subtitle}</p>}
    </div>
    {unit && <span className="adm-chart__unit">{unit}</span>}
  </header>
);
