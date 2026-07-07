import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Sun, Moon, ChevronDown } from "lucide-react";
import { useTheme } from "@/contexts/ThemeProvider";
import { useAuthStore } from "@/features/auth/authStore";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/products": "Products",
  "/sales": "Sales / POS",
};

const LOCATION_HIERARCHY: Record<string, { parent: string; label: string }> = {
  "/products": { parent: "/", label: "Products" },
  "/sales": { parent: "/", label: "Sales / POS" },
};

const Topbar = ({ onMenuClick }: { onMenuClick?: () => void }) => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentPath = location.pathname;
  const title = PAGE_TITLES[currentPath] || "Page";
  const lowerTitle = title.toLowerCase();

  const subtitle =
    LOCATION_HIERARCHY[currentPath]?.label || "Mini ERP";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-brand-border-subtle bg-brand-bg/80 backdrop-blur-sm flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden inline-flex items-center justify-center h-8 w-8 rounded-md border border-brand-border text-brand-text-muted hover:text-brand-text transition-colors"
          aria-label="Toggle menu"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div className="flex flex-col">
          <h1 className="text-[14px] font-medium text-brand-text capitalize">
            {lowerTitle}
          </h1>
          <p className="text-[11px] text-brand-text-muted hidden sm:block">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-brand-border text-brand-text-muted hover:text-brand-text transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="inline-flex items-center gap-2 h-8 pl-2 pr-1.5 rounded-md border border-brand-border hover:bg-brand-surface transition-colors"
          >
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-accent text-[10px] font-medium text-brand-bg">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <span className="text-[12px] font-medium text-brand-text hidden sm:block max-w-[100px] truncate">
              {user?.name || "User"}
            </span>
            <ChevronDown
              size={12}
              className="text-brand-text-muted hidden sm:block"
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-[6px] border border-brand-border bg-brand-bg shadow-lg py-1.5 z-50">
              <div className="px-3 py-2 border-b border-brand-border-subtle">
                <p className="text-[13px] font-medium text-brand-text truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-[11px] text-brand-text-muted mt-0.5 truncate">
                  {user?.email || "user@company.com"}
                </p>
                <span className="mt-1.5 inline-block px-2 py-0.5 rounded-[4px] text-[10px] font-medium bg-brand-accent/10 text-brand-accent">
                  {user?.role || "User"}
                </span>
              </div>
              <div className="py-1">
                <button
                  type="button"
                  className="w-full px-3 py-1.5 text-left text-[12px] text-brand-text-secondary hover:bg-brand-surface hover:text-brand-text transition-colors"
                >
                  Profile
                </button>
                <button
                  type="button"
                  className="w-full px-3 py-1.5 text-left text-[12px] text-brand-text-secondary hover:bg-brand-surface hover:text-brand-text transition-colors"
                >
                  Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
