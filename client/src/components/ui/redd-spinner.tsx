import { cn } from "@/lib/utils";

interface ReddSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ReddSpinner({ size = "md", className }: ReddSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4 text-sm",
    md: "w-6 h-6 text-base",
    lg: "w-8 h-8 text-lg",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center animate-spin text-red-600 font-bold",
        sizeClasses[size],
        className
      )}
      style={{
        animation: "spin 1s linear infinite",
      }}
    >
      Redd
    </div>
  );
}

// Add keyframes for the spin animation in CSS
const spinKeyframes = `
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`;

// Inject the CSS if it doesn't exist
if (typeof document !== "undefined" && !document.querySelector("#redd-spinner-styles")) {
  const style = document.createElement("style");
  style.id = "redd-spinner-styles";
  style.textContent = spinKeyframes;
  document.head.appendChild(style);
}