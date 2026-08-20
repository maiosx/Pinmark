import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-medium transition-[opacity,transform,background-color,color,box-shadow] duration-150 ease-out select-none disabled:pointer-events-none disabled:opacity-40 active:not-disabled:scale-[0.96] [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-accent text-accent-fg hover:opacity-90 shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-fg)_8%,transparent)]",
        secondary:
          "bg-bg-subtle text-fg hover:bg-border",
        ghost:
          "bg-transparent text-fg hover:bg-fg/8",
        outline:
          "bg-transparent text-fg shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-fg)_18%,transparent)] hover:bg-fg/6",
        danger:
          "bg-danger/15 text-danger hover:bg-danger/25",
      },
      size: {
        sm: "h-8 rounded-sm px-2.5 text-xs",
        md: "h-10 rounded-md px-3.5 text-sm",
        lg: "h-11 rounded-lg px-4 text-sm",
        icon: "size-8 rounded-sm",
        "icon-sm": "size-7 rounded-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
