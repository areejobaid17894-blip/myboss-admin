import type { ReactNode } from 'react';

interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  centerTop: string;
  centerSub: string;
}

export function DonutChart({ segments, centerTop, centerSub }: DonutChartProps) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  const R = 54;
  const C = 2 * Math.PI * R;
  let offset = 0;

  const circles = segments
    .filter((s) => s.value > 0)
    .map((s) => {
      const dash = (s.value / total) * C;
      const el = (
        <circle
          key={s.label}
          r={R}
          cx="70"
          cy="70"
          fill="none"
          stroke={s.color}
          strokeWidth="20"
          strokeDasharray={`${dash} ${C - dash}`}
          strokeDashoffset={-offset}
          transform="rotate(-90 70 70)"
        />
      );
      offset += dash;
      return el;
    });

  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
      <svg width="140" height="140" viewBox="0 0 140 140" style={{ flexShrink: 0 }}>
        {circles}
        <text x="70" y="67" textAnchor="middle" fontSize="22" fontWeight="800" fill="#1A1A1A">
          {centerTop}
        </text>
        <text x="70" y="85" textAnchor="middle" fontSize="9" fill="#8F8F8F">
          {centerSub}
        </text>
      </svg>
      <div style={{ fontSize: '0.82rem', minWidth: 180, flex: 1 }}>
        {segments.map((s) => (
          <div
            key={s.label}
            style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 3,
                background: s.color,
                flexShrink: 0,
              }}
            />
            <span>{s.label}</span>
            <b style={{ marginInlineStart: 'auto', paddingInlineStart: 10 }}>{s.value}</b>
            <span style={{ color: 'var(--ac-gray-mid)' }}>
              &nbsp;({Math.round((s.value / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface HBarRow {
  label: string;
  value: number;
  color?: string;
}

export function HBarChart({ rows, color = 'var(--ac-orange)' }: { rows: HBarRow[]; color?: string }) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <>
      {rows.map((r) => (
        <div
          key={r.label}
          style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 9, fontSize: '0.84rem' }}
        >
          <span
            style={{
              width: 132,
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {r.label}
          </span>
          <div className="ac-bar" style={{ flex: 1 }}>
            <i style={{ width: `${Math.round((r.value / max) * 100)}%`, background: r.color ?? color }} />
          </div>
          <span style={{ width: 46, textAlign: 'end', color: 'var(--ac-gray-mid)' }}>{r.value}</span>
        </div>
      ))}
    </>
  );
}

export function StatCard({
  title,
  desc,
  children,
  onExport,
  exportLabel = '⇩ CSV',
}: {
  title: string;
  desc: string;
  children: ReactNode;
  onExport?: () => void;
  exportLabel?: string;
}) {
  return (
    <div className="ac-card" style={{ marginBottom: 0 }}>
      <h2>{title}</h2>
      <p className="ac-sub">{desc}</p>
      {children}
      {onExport && (
        <div style={{ marginTop: 14 }}>
          <button type="button" className="ac-btn ac-btn-sm ac-btn-ghost" onClick={onExport}>
            {exportLabel}
          </button>
        </div>
      )}
    </div>
  );
}
