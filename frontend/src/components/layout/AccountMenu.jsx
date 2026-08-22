import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Avatar } from "../ui/ui.jsx";

export function AccountMenu({ name = "Het Virani", email = "hetvirani87@gmail.com", tone = "coral", items }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((v) => !v)} className="cursor-pointer rounded-full transition-transform hover:scale-105">
        <Avatar initials="HV" size={38} tone={tone} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="absolute right-0 top-[calc(100%+10px)] z-40 w-[240px] overflow-hidden rounded-2xl border border-border-soft bg-surface shadow-[0_20px_50px_-18px_rgba(20,10,5,0.35)]"
          >
            <div className="border-b border-border-soft px-4 py-3.5">
              <p className="truncate text-[13.5px] font-medium text-ink">{name}</p>
              <p className="truncate text-[12px] text-ink-faint">{email}</p>
            </div>
            <div className="p-1.5">
              {items.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    setOpen(false);
                    item.onClick();
                  }}
                  className={`flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13.5px] transition-colors hover:bg-surface-2 ${
                    item.tone === "danger" ? "text-coral-ink" : "text-ink"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
