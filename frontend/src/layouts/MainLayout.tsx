// layouts/MainLayout.tsx
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import BottomDock, { type NavItem } from "@/components/ui/BottomDock";

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: "LayoutDashboard", path: "/dashboard"  },
  { id: "users",     label: "Usuarios",  icon: "Users",           path: "/users"      },
  { id: "logout",    label: "Salir",     icon: "LogOut",          path: "/login"      },
];

export default function MainLayout() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { logout } = useAuth();

  const activeId =
    NAV_ITEMS.find((n) => n.path && location.pathname.startsWith(n.path))?.id
    ?? "dashboard";

  const handleSelect = (id: string) => {
    if (id === "logout") { logout(); navigate("/login"); return; }
    const item = NAV_ITEMS.find((n) => n.id === id);
    if (item?.path) navigate(item.path);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Outlet />
      <BottomDock active={activeId} onSelect={handleSelect} navItems={NAV_ITEMS} />
    </div>
  );
}