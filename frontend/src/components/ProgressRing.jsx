import React from 'react';

// Signature element: the sprint's date range is broken into one arc segment
// per day. Each segment fills based on that day's task completion, so the
// ring reads as a literal calendar of the sprint, not a generic progress bar.
export default function ProgressRing({ dayStates, percent, size = 148 }) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const gapDeg = dayStates.length > 1 ? 3 : 0;
  const segAngle = 360 / dayStates.length;

  function describeArc(index) {
    const startAngle = index * segAngle + gapDeg / 2 - 90;
    const endAngle = (index + 1) * segAngle - gapDeg / 2 - 90;
    const start = polarToCartesian(center, center, radius, endAngle);
    const end = polarToCartesian(center, center, radius, startAngle);
    const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}`;
  }

  function polarToCartesian(cx, cy, r, angleDeg) {
    const angleRad = (angleDeg * Math.PI) / 180;
    return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
  }

  const colorFor = (state) => {
    if (state === 'done') return 'var(--mint)';
    if (state === 'partial') return 'var(--indigo)';
    if (state === 'blocked') return 'var(--coral)';
    return 'var(--track)';
  };

  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {dayStates.map((state, i) => (
          <path
            key={i}
            d={describeArc(i)}
            stroke={colorFor(state)}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
          />
        ))}
      </svg>
      <div className="ring__label">
        <span className="ring__percent">{Math.round(percent)}%</span>
        <span className="ring__caption">complete</span>
      </div>
    </div>
  );
}
