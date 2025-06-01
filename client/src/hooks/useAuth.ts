import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });

  // If we get a 401 error, user is definitely not authenticated
  const is401Error = error && error.message?.includes("401");
  const isAuthenticated = !!user && !is401Error;

  return {
    user,
    isLoading,
    isAuthenticated,
  };
}