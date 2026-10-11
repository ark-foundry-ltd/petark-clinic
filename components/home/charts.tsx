type ChartProps = { labels: string[]; values: number[]; max: number; format?: (v: number) => string };

const W = 400, H = 190, L = 44, R = 392, T = 14, B = 160;

function Grid({ max, format }: Pick<ChartProps, "max" | "format">) {
  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => {
        const y = B - ((B - T) * i) / 4;
        return (
          <g key={i}>
            <line x1={L} x2={R} y1={y} y2={y} stroke="#e2e8f0" />
            <text x={L - 8} y={y + 3} textAnchor="end" fontSize="10" fill="#94a3b8">
              {format ? format((max * i) / 4) : (max * i) / 4}
            </text>
          </g>
        );
      })}
    </>
  );
}

export function BarChart({ labels, values, max, format }: ChartProps) {
  const slot = (R - L) / values.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full">
      <Grid max={max} format={format} />
      {values.map((v, i) => {
        const h = ((B - T) * v) / max, bw = slot * 0.5, cx = L + slot * i + slot / 2;
        return (
          <g key={labels[i]}>
            <rect x={cx - bw / 2} y={B - h} width={bw} height={h} rx={4} fill="#22c55e" />
            <text x={cx} y={180} textAnchor="middle" fontSize="10" fill="#94a3b8">{labels[i]}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function LineChart({ labels, values, max, format }: ChartProps) {
  const slot = (R - L) / values.length;
  const pts = values.map((v, i) => [L + slot * i + slot / 2, B - ((B - T) * v) / max]);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full">
      <Grid max={max} format={format} />
      <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke="#22c55e" strokeWidth={2.5} strokeLinejoin="round" />
      {pts.map(([x, y], i) => (
        <g key={labels[i]}>
          <circle cx={x} cy={y} r={4} fill="#22c55e" />
          <text x={x} y={180} textAnchor="middle" fontSize="10" fill="#94a3b8">{labels[i]}</text>
        </g>
      ))}
    </svg>
  );
}