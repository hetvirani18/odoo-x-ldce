import { motion } from "motion/react";
import { IconFilter, IconLayers, IconSearch, IconSort } from "./icons.jsx";

export function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  className = "",
  ...props
}) {
  const sizes = {
    sm: "h-9 px-3.5 text-[13px] gap-1.5",
    md: "h-11 px-5 text-sm gap-2",
    lg: "h-13 px-7 text-[15px] gap-2",
  };
  const variants = {
    primary:
      "bg-coral text-white shadow-[0_1px_0_rgba(0,0,0,0.05),0_8px_20px_-8px_var(--color-coral)] hover:brightness-105",
    dark: "bg-ink text-bg hover:brightness-125",
    soft: "bg-coral-soft text-coral-ink hover:bg-[oklch(90%_0.045_35)]",
    outline:
      "bg-transparent text-ink border border-border hover:border-ink hover:bg-surface-2",
    ghost: "bg-transparent text-ink-soft hover:text-ink hover:bg-surface-2",
  };
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`inline-flex items-center justify-center rounded-full font-medium whitespace-nowrap transition-colors cursor-pointer ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </motion.button>
  );
}

export function IconButton({ children, className = "", ...props }) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      whileHover={{ y: -1 }}
      className={`inline-flex items-center justify-center h-10 w-10 rounded-full border border-border bg-surface text-ink-soft hover:text-ink hover:border-ink cursor-pointer transition-colors ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function Field({ label, error, className = "", children }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <span className="text-[13px] font-medium text-ink-soft px-0.5">{label}</span>
      )}
      {children}
      {error && <span className="text-[12.5px] text-coral-ink px-0.5">{error}</span>}
    </label>
  );
}

const inputBase =
  "w-full rounded-2xl border border-border bg-surface px-4 text-[14.5px] text-ink placeholder:text-ink-faint outline-none transition-all focus:border-coral focus:ring-4 focus:ring-coral-soft";

export function Input({ className = "", icon, ...props }) {
  if (icon) {
    return (
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint">
          {icon}
        </span>
        <input className={`${inputBase} h-12 pl-11 ${className}`} {...props} />
      </div>
    );
  }
  return <input className={`${inputBase} h-12 ${className}`} {...props} />;
}

export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`${inputBase} min-h-[110px] resize-none py-3 ${className}`}
      {...props}
    />
  );
}

export function Card({ children, className = "", hover = true, as: As = "div", ...props }) {
  return (
    <As
      className={`rounded-3xl border border-border-soft bg-surface ${
        hover ? "transition-shadow hover:shadow-[0_12px_32px_-16px_rgba(35,20,10,0.25)]" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </As>
  );
}

export function Badge({ children, tone = "coral", className = "" }) {
  const tones = {
    coral: "bg-coral-soft text-coral-ink",
    teal: "bg-teal-soft text-teal-ink",
    gold: "bg-gold-soft text-gold-ink",
    neutral: "bg-surface-2 text-ink-soft",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-semibold tracking-wide uppercase ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function SearchToolbar({ placeholder = "Search…", value, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div className="relative min-w-[220px] flex-1">
        <IconSearch size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" />
        <input
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="h-11 w-full rounded-full border border-border bg-surface pl-10.5 pr-4 text-[13.5px] text-ink placeholder:text-ink-faint outline-none transition-all focus:border-coral focus:ring-4 focus:ring-coral-soft"
        />
      </div>
      <ToolbarChip icon={<IconLayers size={14} />}>Group by</ToolbarChip>
      <ToolbarChip icon={<IconFilter size={14} />}>Filter</ToolbarChip>
      <ToolbarChip icon={<IconSort size={14} />}>Sort by</ToolbarChip>
    </div>
  );
}

export function ToolbarChip({ icon, children }) {
  return (
    <button className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface px-4 text-[13px] font-medium text-ink-soft transition-colors hover:border-ink hover:text-ink cursor-pointer">
      {icon}
      {children}
    </button>
  );
}

export function SectionHeading({ eyebrow, title, action }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="mb-1 text-[12px] font-semibold uppercase tracking-[0.12em] text-coral-ink">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-[22px] font-semibold text-ink">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function Avatar({ initials = "GT", size = 40, tone = "coral", photoUrl }) {
  const tones = {
    coral: "bg-coral text-white",
    teal: "bg-teal text-white",
    ink: "bg-ink text-bg",
  };
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt=""
        style={{ width: size, height: size }}
        className="rounded-full object-cover"
      />
    );
  }
  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      className={`flex items-center justify-center rounded-full font-display font-semibold ${tones[tone]}`}
    >
      {initials}
    </div>
  );
}
