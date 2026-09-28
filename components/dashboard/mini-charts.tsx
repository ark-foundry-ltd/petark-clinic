// components/dashboard/mini-charts.tsx
// Dependency-free SVG charts (bar + line). Colour comes from `text-acc-clr`.

export interface Pt {
    label: string;
    value: number;
}

const W = 440, H = 190, L = 44, R = 8, T = 10, B = 24;
const PH = H - T - B;
const compact = new Intl.NumberFormat("en", { notation: "compact" });

const niceTop = (points: Pt[]) => {
    const max = Math.max(0, ...points.map((p) => p.value));
    return Math.max(4, Math.ceil((max * 1.15) / 4) * 4);
};

function Axes({ points, top }: { points: Pt[]; top: number }) {
    const step = (W - L - R) / points.length;
    const every = points.length > 8 ? 2 : 1;
    return (
        <>
            {[0, 1, 2, 3, 4].map((i) => {
                const y = T + PH - (PH * i) / 4;
                return (
                    <g key={i}>
                        <line x1={L} x2={W - R} y1={y} y2={y} className="stroke-gray-100" />
                        <text x={L - 6} y={y + 4} textAnchor="end" className="fill-gray-400 text-[11px]">
                            {compact.format((top * i) / 4)}
                        </text>
                    </g>
                );
            })}
            {points.map(
                (p, i) =>
                    i % every === 0 && (
                        <text key={i} x={L + (i + 0.5) * step} y={H - 6} textAnchor="middle" className="fill-gray-400 text-[11px]">
                            {p.label}
                        </text>
                    )
            )}
        </>
    );
}

export function BarChart({ points }: { points: Pt[] }) {
    const top = niceTop(points);
    const step = (W - L - R) / points.length;
    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto text-acc-clr" role="img" aria-label="Bar chart">
            <Axes points={points} top={top} />
            {points.map((p, i) => {
                const h = (PH * p.value) / top;
                return (
                    <rect
                        key={i}
                        x={L + i * step + step * 0.18}
                        y={T + PH - h}
                        width={step * 0.64}
                        height={h}
                        rx={3}
                        fill="currentColor"
                    >
                        <title>{`${p.label}: ${p.value.toLocaleString()}`}</title>
                    </rect>
                );
            })}
        </svg>
    );
}

export function LineChart({ points }: { points: Pt[] }) {
    const top = niceTop(points);
    const step = (W - L - R) / points.length;
    const xy = points.map((p, i) => [L + (i + 0.5) * step, T + PH - (PH * p.value) / top] as const);
    const d = xy.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto text-acc-clr" role="img" aria-label="Line chart">
            <Axes points={points} top={top} />
            <path d={d} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
            {xy.map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={3.5} fill="currentColor">
                    <title>{`${points[i].label}: ${points[i].value.toLocaleString()}`}</title>
                </circle>
            ))}
        </svg>
    );
}