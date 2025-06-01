import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useLocation } from "wouter";

interface LogoutButtonProps {
  variant?: "ghost" | "outline" | "default";
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function LogoutButton({ variant = "ghost", size = "sm", className }: LogoutButtonProps) {
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    // Clear React Query cache before redirect
    queryClient.clear();
    
    // Navigate directly to the logout endpoint which will handle the OpenID Connect logout flow
    window.location.href = "/api/logout";
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