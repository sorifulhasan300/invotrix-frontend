import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import {
  Eye,
  EyeOff,
  Loader2,
  ChevronRight,
  Package,
  ShoppingCart,
  Users,
  Wallet,
  FileBarChart,
  Sun,
  Moon,
} from "lucide-react";
import { useAuthStore } from "../../features/auth/authStore";
import apiClient from "../../services/api";
import { useTheme } from "../../contexts/ThemeProvider";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Enter your work email.")
    .email("That email doesn't look right."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginResponse {
  user: {
    _id: string;
    email: string;
    name: string;
    role: "Admin" | "Manager" | "Employee";
  };
  token: string;
}

const MODULES = [
  { code: "INV-01", label: "Inventory", icon: Package, hint: "SKUs tracked" },
  {
    code: "ORD-02",
    label: "Orders",
    icon: ShoppingCart,
    hint: "processed live",
  },
  { code: "HRM-03", label: "Payroll", icon: Users, hint: "staff synced" },
  { code: "FIN-04", label: "Finance", icon: Wallet, hint: "reconciled daily" },
  {
    code: "RPT-05",
    label: "Reports",
    icon: FileBarChart,
    hint: "generated on demand",
  },
];

const LoginPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const [serverError, setServerError] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await apiClient.post<{ data: LoginResponse }>(
        "/auth/login",
        data,
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      Cookies.set("accessToken", data.token, {
        expires: 7,
        secure: import.meta.env.PROD,
        sameSite: "strict",
      });
      setAuth(data.user, data.token);
      navigate("/dashboard", { replace: true });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        "Sign in failed. Check your credentials and try again.";
      setServerError(message);
    },
  });

  const onSubmit = (data: LoginFormData) => {
    setServerError("");
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen w-full bg-brand-bg text-brand-text">
      <div className="grid lg:grid-cols-5 min-h-screen">
        <div className="lg:col-span-2 flex flex-col justify-between px-6 py-10 sm:px-12 sm:py-14">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-[6px] border border-brand-border flex items-center justify-center">
                <div className="w-2 h-2 rounded-[2px] bg-brand-accent" />
                <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center">
                  <div className="w-[3px] h-[3px] rounded-full bg-brand-success" />
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
            <p className="text-[12px] tracking-[0.12em] uppercase text-brand-text-muted">
              Operator access
            </p>
            <h1 className="mt-2 text-[28px] sm:text-[32px] font-medium leading-tight">
              Sign in to the console
            </h1>
            <p className="mt-2 text-[14px] text-brand-text-secondary leading-relaxed">
              Enter your credentials to reach inventory, orders, payroll and
              finance in one place.
            </p>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-8 space-y-4"
              noValidate
            >
              {serverError && (
                <div className="rounded-[6px] border border-brand-error-border bg-brand-error-bg px-3.5 py-2.5 text-[13px] text-brand-error">
                  {serverError}
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-[13px] text-brand-text-secondary mb-1.5"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  {...register("email")}
                  className={`w-full h-10 rounded-[6px] bg-brand-surface border px-3 text-[14px] placeholder:text-brand-text-muted outline-none transition-colors focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/40 ${
                    errors.email
                      ? "border-brand-error"
                      : "border-brand-border-subtle"
                  }`}
                />
                {errors.email && (
                  <p className="mt-1.5 text-[12px] text-brand-error">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="password"
                    className="block text-[13px] text-brand-text-secondary"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-[12px] text-brand-text-muted hover:text-brand-accent transition-colors"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    {...register("password")}
                    className={`w-full h-10 rounded-[6px] bg-brand-surface border pl-3 pr-10 text-[14px] placeholder:text-brand-text-muted outline-none transition-colors focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/40 ${
                      errors.password
                        ? "border-brand-error"
                        : "border-brand-border-subtle"
                    }`}
                  />
                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-0 top-0 h-10 w-10 flex items-center justify-center text-brand-text-muted hover:text-brand-text-secondary"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-[12px] text-brand-error">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full h-10 rounded-[6px] bg-brand-accent hover:bg-brand-accent-hover disabled:opacity-70 text-brand-bg text-[14px] font-medium flex items-center justify-center gap-2 transition-colors"
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Verifying
                  </>
                ) : (
                  <>
                    Sign in
                    <ChevronRight size={15} />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-[12px] text-brand-text-muted">
            Access is provisioned by an administrator. Contact your workspace
            admin for an invite.
          </p>
        </div>

        <div className="hidden lg:flex lg:col-span-3 relative bg-brand-elevated border-l border-brand-border-subtle flex-col justify-between px-14 py-14 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-success opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-success" />
              </span>
              <span className="text-[12px] tracking-[0.12em] uppercase text-brand-success">
                System operational
              </span>
            </div>
          </div>

          <div className="w-full max-w-md">
            <p className="text-[12px] tracking-[0.12em] uppercase text-brand-text-muted mb-4">
              Modules in this workspace
            </p>
            <div className="rounded-[10px] border border-brand-border-subtle divide-y divide-brand-border-subtle bg-brand-surface/60">
              {MODULES.map((m) => {
                const Icon = m.icon;
                return (
                  <div
                    key={m.code}
                    className="flex items-center gap-4 px-5 py-4"
                  >
                    <div className="w-8 h-8 rounded-[6px] border border-brand-border flex items-center justify-center text-brand-text-muted shrink-0">
                      <Icon size={15} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-[13.5px] font-medium">
                          {m.label}
                        </span>
                        <span className="text-[11px] text-brand-text-muted">
                          {m.code}
                        </span>
                      </div>
                    </div>
                    <span className="text-[12px] text-brand-text-muted shrink-0">
                      {m.hint}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="max-w-md">
            <h2 className="text-[22px] font-medium leading-snug">
              One console for every part of the business.
            </h2>
            <p className="mt-2 text-[13.5px] text-brand-text-secondary leading-relaxed">
              Inventory, orders, payroll and finance stay in sync automatically
              — no spreadsheets, no separate logins.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
