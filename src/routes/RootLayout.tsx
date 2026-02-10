import { Outlet } from "@tanstack/react-router";
import { TooltipProvider } from "@/components/ui/tooltip";

export function RootLayout() {
  return (
    <TooltipProvider>
      <div className="dark min-h-screen bg-background text-foreground bg-grid">
        {/* Gradient overlay on top of grid */}
        <div className="fixed inset-0 bg-gradient-to-br from-brand-blue-dark/80 via-background/95 to-background pointer-events-none" />
        <div className="relative z-10 min-h-screen">
          <Outlet />
        </div>
      </div>
    </TooltipProvider>
  );
}
