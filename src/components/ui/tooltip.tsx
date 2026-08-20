import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as React from "react";
import { cn } from "@/lib/utils";

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return (
    <TooltipPrimitive.Provider delayDuration={280} skipDelayDuration={120}>
      {children}
    </TooltipPrimitive.Provider>
  );
}

export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export const TooltipContent = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-[80] rounded-sm bg-bg-elevated px-2 py-1 text-xs text-fg shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-fg)_12%,transparent),0_8px_24px_-12px_rgb(0_0_0/0.5)]",
        "data-[state=delayed-open]:animate-in data-[state=closed]:animate-out",
        className,
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = "TooltipContent";
