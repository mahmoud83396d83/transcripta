import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { useEffect } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { data: user, isLoading: loading, error } = trpc.auth.me.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation();

  const isAuthenticated = Boolean(user);

  useEffect(() => {
    if (options?.redirectOnUnauthenticated && !loading && !user) {
      startLogin();
    }
  }, [options?.redirectOnUnauthenticated, loading, user]);

  const logout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        window.location.href = options?.redirectPath ?? "/";
      },
    });
  };

  return { user: user ?? null, loading, error: error ?? null, isAuthenticated, logout };
}
