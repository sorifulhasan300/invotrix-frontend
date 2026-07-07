import { useNavigate } from "react-router-dom";
import {
  ShieldAlert,
  ArrowLeft,
  LogOut,
  Sun,
  Moon,
  ShieldCheck,
} from "lucide-react";
import { useAuthStore } from "../../features/auth/authStore";
import { useTheme } from "../../contexts/ThemeProvider";
import { Button } from "@/components/ui/button";

const SECURITY_POLICIES = [
  {
    role: "Admin",
    access: "Full access to inventory, orders, payroll, and system settings.",
  },
  {
    role: "Manager",
    access: "Access to inventory, orders, sales logs, and receipt logs.",
  },
  {
    role: "Employee",
    access: "Access to POS terminal sales entry and receipt printing.",
  },
];

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen w-full bg-brand-bg text-brand-text transition-colors duration-200">
      <div className="grid lg:grid-cols-5 min-h-screen">
        {/* Left Side: Warning details & actions */}
        <div className="lg:col-span-2 flex flex-col justify-between px-6 py-10 sm:px-12 sm:py-14">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-[6px] border border-brand-border flex items-center justify-center">
                <div className="w-2 h-2 rounded-[2px] bg-brand-accent" />
                <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center">
                  <div className="w-[3px] h-[3px] rounded-full bg-brand-error" />
                </div>
              </div>
              <span className="text-[15px] font-medium tracking-tight">
                Mini ERP
              </span>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="h-8 w-8 rounded-md border border-brand-border flex items-center justify-center text-brand-text-muted hover:text-brand-text transition-colors"
            >
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>

          <div className="w-full max-w-sm mx-auto">
            <div className="flex items-center gap-2 text-[12px] tracking-[0.12em] uppercase text-brand-error font-medium">
              <ShieldAlert size={14} />
              Access Denied
            </div>
            <h1 className="mt-2 text-[28px] sm:text-[32px] font-medium leading-tight">
              Unauthorized access
            </h1>
            <p className="mt-2 text-[14px] text-brand-text-secondary leading-relaxed">
              You do not have the required role permissions to access this page or
              resource. Please check your credentials or switch accounts.
            </p>

            <div className="mt-8 space-y-3">
              <Button
                onClick={() => navigate("/")}
                className="w-full h-10 rounded-[6px] bg-brand-accent hover:bg-brand-accent-hover text-brand-bg font-medium flex items-center justify-center gap-2 transition-colors border-none"
              >
                <ArrowLeft size={15} />
                Go to Dashboard
              </Button>

              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full h-10 rounded-[6px] border border-brand-border-subtle bg-brand-surface text-brand-text hover:bg-brand-elevated font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut size={15} />
                Switch Account
              </Button>
            </div>
          </div>

          <p className="text-[12px] text-brand-text-muted">
            Access control is enforced dynamically. Contact your system admin if you believe this is an error.
          </p>
        </div>

        {/* Right Side: Security Policy Overview */}
        <div className="hidden lg:flex lg:col-span-3 relative bg-brand-elevated border-l border-brand-border-subtle flex-col justify-between px-14 py-14 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-error opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-error" />
              </span>
              <span className="text-[12px] tracking-[0.12em] uppercase text-brand-error">
                Security Shield Active
              </span>
            </div>
          </div>

          <div className="w-full max-w-md">
            <p className="text-[12px] tracking-[0.12em] uppercase text-brand-text-muted mb-4">
              Access permissions overview
            </p>
            <div className="rounded-[10px] border border-brand-border-subtle divide-y divide-brand-border-subtle bg-brand-surface/60">
              {SECURITY_POLICIES.map((policy) => (
                <div
                  key={policy.role}
                  className="flex items-center gap-4 px-5 py-4 animate-fade-in"
                >
                  <div className="w-8 h-8 rounded-[6px] border border-brand-border flex items-center justify-center text-brand-text-muted shrink-0">
                    <ShieldCheck size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[13.5px] font-medium">
                        {policy.role} Role
                      </span>
                    </div>
                    <p className="text-[12px] text-brand-text-secondary mt-0.5 leading-normal">
                      {policy.access}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="max-w-md">
            <h2 className="text-[22px] font-medium leading-snug">
              Role-Based Access Control (RBAC)
            </h2>
            <p className="mt-2 text-[13.5px] text-brand-text-secondary leading-relaxed">
              Every operation within this workspace is audited and guarded. Users can only perform tasks matching their designated role level.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
