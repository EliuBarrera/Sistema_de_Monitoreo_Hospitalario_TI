import { useState } from "react";
import {
  LayoutDashboard,
  Server,
  MapPin,
  Activity,
  BellRing,
  Users,
  LogOut,
  type LucideIcon
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string | null;
}

interface BottomDockProps {
  active: string;
  onSelect: (id: string) => void;
  navItems: NavItem[];
}

// ─── Icon map ─────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Server,
  MapPin,
  Activity,
  BellRing,
  Users,
  LogOut,
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function BottomDock({ active, onSelect, navItems }: BottomDockProps) {
  const [expanded, setExpanded] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const activeItem = navItems.find((n) => n.id === active) ?? navItems[0];

  return (
    <div className="fixed bottom-5 left-0 right-0 flex justify-center z-50 pointer-events-none">
      <div
        className="pointer-events-auto"
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => {
          setExpanded(false);
          setHoveredId(null);
        }}
      >
        <div
          className={`
            flex items-center
            bg-[#4a5296] border border-white/10
            shadow-2xl rounded-2xl
            transition-all duration-300 ease-in-out
            overflow-hidden
            ${expanded ? "px-3 py-2 gap-1" : "px-4 py-2.5 gap-3"}
          `}
        >
          {expanded ? (
            navItems.map((item) => {
              const Icon = ICON_MAP[item.icon];
              const isActive = item.id === active;
              const isHovered = hoveredId === item.id;
              const isDanger = item.id === "logout";

              return (
                <button
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-xl
                    transition-all duration-200 cursor-pointer whitespace-nowrap
                    ${isDanger
                      ? "text-red-300 hover:text-red-200 hover:bg-red-500/20"
                      : isActive
                        ? "bg-white/20 text-white"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }
                  `}
                >
                  {Icon && <Icon size={18} className="shrink-0" />}
                  <span
                    className={`
                      text-sm font-medium overflow-hidden
                      transition-all duration-200
                      ${isHovered || isActive ? "max-w-[100px] opacity-100" : "max-w-0 opacity-0"}
                    `}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })
          ) : (
            <>
              {ICON_MAP[activeItem.icon] &&
                (() => {
                  const Icon = ICON_MAP[activeItem.icon];
                  return <Icon size={20} className="text-white shrink-0" />;
                })()
              }
              <span className="text-sm font-semibold text-white">
                {activeItem.label}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}