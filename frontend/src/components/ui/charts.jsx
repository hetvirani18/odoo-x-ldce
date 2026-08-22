import { motion } from "motion/react";

const PALETTE = ["#e8734a", "#2f7d78", "#e0a940", "#5b6cc6", "#a6584f"];

export function LineChart({ data, width = 480, height = 160 }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 24) - 12;
    return [x, y];
  });
  const path = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const area = `${path} L${width},${height} L0,${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={PALETTE[0]} stopOpacity="0.22" />
          <stop offset="100%" stopColor={PALETTE[0]} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        d={area}
        fill="url(#lineFill)"
        stroke="none"
      />
      <motion.path
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: "easeInOut" }}
        d={path}
        fill="none"
        stroke={PALETTE[0]}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.5" fill={PALETTE[0]} stroke="white" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

export function BarChart({ data, width = 480, height = 160 }) {
  const max = Math.max(...data.map((d) => d.value));
  const barW = width / data.length;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none">
      {data.map((d, i) => {
        const h = (d.value / max) * (height - 30);
        const x = i * barW + barW * 0.2;
        const w = barW * 0.6;
        return (
          <g key={d.label}>
            <motion.rect
              initial={{ height: 0, y: height - 22 }}
              whileInView={{ height: h, y: height - 22 - h }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: "easeOut" }}
              x={x}
              width={w}
              rx="6"
              fill={PALETTE[1]}
            />
            <text x={x + w / 2} y={height - 4} textAnchor="middle" fontSize="10.5" fill="var(--color-ink-faint)">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function DonutChart({ data, size = 160, thickness = 22 }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const segments = data.reduce((acc, d) => {
    const prevOffset = acc.length ? acc[acc.length - 1].offset + acc[acc.length - 1].dash : 0;
    acc.push({ ...d, dash: (d.value / total) * c, offset: prevOffset });
    return acc;
  }, []);

  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-surface-2)" strokeWidth={thickness} />
        {segments.map((d, i) => (
          <motion.circle
            key={d.label}
            initial={{ strokeDashoffset: c }}
            whileInView={{ strokeDashoffset: c - d.dash }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={PALETTE[i % PALETTE.length]}
            strokeWidth={thickness}
            strokeDasharray={c}
            strokeLinecap="butt"
            transform={`rotate(${(d.offset / c) * 360} ${size / 2} ${size / 2})`}
          />
        ))}
      </svg>
      <div className="flex flex-col gap-2">
        {data.map((d, i) => (
          <span key={d.label} className="flex items-center gap-2 text-[12.5px] text-ink-soft">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
            {d.label} <span className="text-ink-faint">{Math.round((d.value / total) * 100)}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}
