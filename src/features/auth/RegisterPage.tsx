import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Loader2,
  ChevronRight,
  User,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeProvider";
import apiClient from "../../services/api";

const registerSchema = z.object({
  name: z.string().min(1, "Full name is required."),
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  profileImage: z
    .instanceof(FileList)
    .optional()
    .refine(
      (files) =>
        !files || files.length === 0 ||
        ["image/png", "image/jpeg", "image/jpg"].includes(files[0].type),
      "Only PNG and JPEG images are allowed."
    ),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const BENEFITS = [
  "Join your team and get instant access to inventory, orders, payroll and finance.",
  "Set up your profile once — no spreadsheets, no separate logins.",
  "Secure role-based access managed by your workspace administrator.",
];

const RegisterPage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [serverError, setServerError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"Admin" | "Manager" | "Employee">("Employee");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const profileImageRegister = register("profileImage");

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("role", selectedRole);
      if (data.profileImage && data.profileImage[0]) {
        formData.append("profileImage", data.profileImage[0]);
      }

      const response = await apiClient.post("/auth/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      setSuccessMessage(
        "Account created successfully! Redirecting to login..."
      );
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        "Registration failed. Please try again.";
      setServerError(message);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const url = URL.createObjectURL(files[0]);
      setPreview(url);
      setValue("profileImage", files);
    } else {
      setPreview(null);
      setValue("profileImage", new DataTransfer().files);
    }
  };

  const clearImage = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setValue("profileImage", new DataTransfer().files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const url = URL.createObjectURL(files[0]);
      setPreview(url);
      setValue("profileImage", files);
    }
  };

  const onSubmit = (data: RegisterFormData) => {
    setServerError("");
    setSuccessMessage("");
    registerMutation.mutate(data);
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
              New account access
            </p>
            <h1 className="mt-2 text-[28px] sm:text-[32px] font-medium leading-tight">
              Create your workspace account
            </h1>
            <p className="mt-2 text-[14px] text-brand-text-secondary leading-relaxed">
              Join your team and reach inventory, orders, payroll and finance in
              one place.
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
              {successMessage && (
                <div className="rounded-[6px] border border-brand-success-border bg-brand-success-bg px-3.5 py-2.5 text-[13px] text-brand-success">
                  {successMessage}
                </div>
              )}

              <div
                className={`flex flex-col items-center rounded-[6px] border-2 border-dashed bg-brand-surface p-4 transition-colors ${
                  isDragging
                    ? "border-brand-accent"
                    : "border-brand-border-subtle hover:border-brand-text-muted"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="relative">
                  <div
                    className="w-20 h-20 rounded-full border border-brand-border-subtle flex items-center justify-center overflow-hidden cursor-pointer bg-brand-bg"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {preview ? (
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User
                        size={28}
                        className="text-brand-text-muted"
                      />
                    )}
                  </div>
                  <input
                    name="profileImage"
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={(e) => {
                      profileImageRegister.onChange(e);
                      handleFileChange(e);
                    }}
                    ref={(e) => {
                      profileImageRegister.ref(e);
                      fileInputRef.current = e;
                    }}
                    className="hidden"
                  />
                  {preview && (
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-brand-error text-brand-bg flex items-center justify-center hover:opacity-90 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
                <p className="text-[12px] text-brand-text-muted mt-3">
                  Click or drag to upload profile image
                </p>
                {errors.profileImage && (
                  <p className="mt-1.5 text-[12px] text-brand-error">
                    {errors.profileImage.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="block text-[13px] text-brand-text-secondary mb-1.5"
                >
                  Full name
                </label>
                <input
                  id="name"
                  placeholder="John Doe"
                  {...register("name")}
                  className={`w-full h-10 rounded-[6px] bg-brand-surface border px-3 text-[14px] placeholder:text-brand-text-muted outline-none transition-colors focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/40 ${
                    errors.name
                      ? "border-brand-error"
                      : "border-brand-border-subtle"
                  }`}
                />
                {errors.name && (
                  <p className="mt-1.5 text-[12px] text-brand-error">
                    {errors.name.message}
                  </p>
                )}
              </div>

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
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Create a password"
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
                    {showPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-[12px] text-brand-error">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[13px] text-brand-text-secondary mb-1.5 font-normal">
                  Select Workspace Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Admin", "Manager", "Employee"] as const).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRole(role)}
                      className={`h-10 rounded-[6px] border text-[13px] font-medium transition-all ${
                        selectedRole === role
                          ? "bg-brand-accent border-brand-accent text-brand-bg"
                          : "border-brand-border-subtle bg-brand-surface text-brand-text-secondary hover:text-brand-text hover:bg-brand-elevated"
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full h-10 rounded-[6px] bg-brand-accent hover:bg-brand-accent-hover disabled:opacity-70 text-brand-bg text-[14px] font-medium flex items-center justify-center gap-2 transition-colors"
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ChevronRight size={15} />
                  </>
                )}
              </button>

              <p className="text-center text-[13px] text-brand-text-muted">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-brand-accent hover:underline"
                >
                  Sign in
                </button>
              </p>
            </form>
          </div>

          <p className="text-[12px] text-brand-text-muted">
            Registration is provisioned by an administrator. Contact your
            workspace admin for an invite.
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
                Open for registration
              </span>
            </div>
          </div>

          <div className="w-full max-w-md">
            <p className="text-[12px] tracking-[0.12em] uppercase text-brand-text-muted mb-4">
              Why join
            </p>
            <div className="rounded-[10px] border border-brand-border-subtle divide-y divide-brand-border-subtle bg-brand-surface/60">
              {BENEFITS.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-4 px-5 py-4"
                >
                  <div className="w-8 h-8 rounded-[6px] border border-brand-border flex items-center justify-center text-brand-text-muted shrink-0 mt-0.5">
                    <span className="text-[11px] font-medium">+</span>
                  </div>
                  <p className="text-[13.5px] text-brand-text-secondary leading-relaxed">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="max-w-md">
            <h2 className="text-[22px] font-medium leading-snug">
              One workspace for every part of the business.
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

export default RegisterPage;
