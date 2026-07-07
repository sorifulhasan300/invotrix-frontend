import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/authStore";

interface SidebarItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard },
  { label: "Products", to: "/products", icon: Package },
  { label: "Sales / POS", to: "/sales", icon: ShoppingCart },
];

const Sidebar = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose?: () => void;
}) => {
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    if (onClose) onClose();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-4 py-5">
        <div className="relative w-8 h-8 rounded-[6px] border border-brand-border flex items-center justify-center">
          <div className="w-2 h-2 rounded-[2px] bg-brand-accent" />
          <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center">
            <div className="w-[3px] h-[3px] rounded-full bg-brand-success" />
          </div>
        </div>
        <span className="text-[15px] font-medium tracking-tight text-brand-text">
          Invotrix ERP
        </span>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1">
        {SIDEBAR_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-[6px] px-3 py-2 text-[13px] font-medium transition-colors ${
                isActive
                  ? "bg-brand-surface border-l-2 border-brand-accent text-brand-text"
                  : "text-brand-text-secondary hover:bg-brand-surface hover:text-brand-text"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={16}
                  className={
                    isActive
                      ? "text-brand-accent"
                      : "text-brand-text-muted"
                  }
                />
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <ChevronRight size={14} className="text-brand-text-muted" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-brand-border-subtle">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-start gap-3 rounded-[6px] px-3 py-2 text-[13px] font-medium text-brand-text-secondary hover:text-brand-error hover:bg-brand-error-bg transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex lg:w-60 h-full border-r border-brand-border-subtle bg-brand-bg flex-col">
        {sidebarContent}
      </aside>

      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <aside className="relative z-50 w-64 h-full border-r border-brand-border-subtle bg-brand-bg shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
