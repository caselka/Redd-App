import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";

interface LogoutButtonProps {
  variant?: "ghost" | "outline" | "default";
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function LogoutButton({ variant = "ghost", size = "sm", className }: LogoutButtonProps) {
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    try {
      // Call logout API
      await apiRequest("/api/logout", { method: "POST" });
      
      // Clear all React Query cache
      queryClient.clear();
      
      // Force a page reload to ensure clean state
      window.location.reload();
    } catch (error) {
      console.error("Logout error:", error);
      // Force reload as fallback
      window.location.reload();
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={className}
    >
      <LogOut className="h-4 w-4 mr-2" />
      {isLoggingOut ? "Signing Out..." : "Sign Out"}
    </Button>
  );
}