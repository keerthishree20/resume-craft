"use client";

interface RadarChartProps {
  labels: string[];
  values: number[];
  maxValue?: number;
}

export default function RadarChart({ labels, values, maxValue = 100 }: RadarChartProps) {
  const cx = 150;
  const cy = 150;
  const radius = 110;
  const levels = 5;
  const count = labels.length;

  function polarToCartesian(angle: number, r: number) {
    const radian = (Math.PI / 180) * (angle - 90);
    return {
      x: cx + r * Math.cos(radian),
      y: cy + r * Math.sin(radian),
    };
  }

  const angleStep = 360 / count;

  const gridLines = Array.from({ length: levels }, (_, i) => {
    const r = (radius / levels) * (i + 1);
    const points = Array.from({ length: count }, (_, j) => {
      const { x, y } = polarToCartesian(j * angleStep, r);
      return `${x},${y}`;
    }).join(" ");
    return points;
  });

  const axisLines = Array.from({ length: count }, (_, i) => {
    const { x, y } = polarToCartesian(i * angleStep, radius);
    return { x1: cx, y1: cy, x2: x, y2: y };
  });

  const dataPoints = values.map((v, i) => {
    const r = (v / maxValue) * radius;
    return polarToCartesian(i * angleStep, r);
  });

  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ") + " Z";

  const labelPositions = labels.map((label, i) => {
    const { x, y } = polarToCartesian(i * angleStep, radius + 22);
    return { label, x, y, value: values[i] };
  });

  return (
    <div className="flex justify-center">
      <svg viewBox="0 0 300 300" className="w-full max-w-[320px]">
        {gridLines.map((points, i) => (
          <polygon
            key={i}
            points={points}
            fill="none"
            stroke="#27272a"
            strokeWidth="0.5"
          />
        ))}

        {axisLines.map((line, i) => (
          <line
            key={i}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="#27272a"
            strokeWidth="0.5"
          />
        ))}

        <path
          d={dataPath}
          fill="rgba(99, 102, 241, 0.15)"
          stroke="#6366f1"
          strokeWidth="2"
        />

        {dataPoints.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="4"
            fill="#6366f1"
            stroke="#18181b"
            strokeWidth="2"
          />
        ))}

        {labelPositions.map(({ label, x, y, value }, i) => (
          <g key={i}>
            <text
              x={x}
              y={y - 6}
              textAnchor="middle"
              className="fill-foreground text-[9px] font-medium"
            >
              {label}
            </text>
            <text
              x={x}
              y={y + 6}
              textAnchor="middle"
              className="fill-primary text-[9px] font-bold"
            >
              {value}%
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
