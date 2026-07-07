import { Toaster } from "@/components/ui/sonner"
import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/authStore";
import router from "./routes/AppRoutes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const LoadingSpinner = () => (
  <div className="min-h-screen w-full bg-brand-bg text-brand-text flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
      <p className="text-[13px] text-brand-text-muted">Verifying access…</p>
    </div>
  </div>
);

function App() {
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser);
  const token = useAuthStore((state) => state.token);
  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);

  useEffect(() => {
    fetchCurrentUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (token && isCheckingAuth) {
    return <LoadingSpinner />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}

export default App;
