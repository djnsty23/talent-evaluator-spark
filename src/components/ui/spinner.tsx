
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const spinnerVariants = cva(
  "inline-block rounded-full border-current border-solid border-r-transparent animate-spin",
  {
    variants: {
      size: {
        xs: "h-3 w-3 border-[2px]",
        sm: "h-4 w-4 border-[2px]",
        md: "h-6 w-6 border-[3px]",
        lg: "h-8 w-8 border-[4px]",
        xl: "h-12 w-12 border-[5px]",
      },
      variant: {
        default: "text-primary",
        secondary: "text-secondary",
        accent: "text-accent",
        muted: "text-muted",
        success: "text-green-500",
        warning: "text-amber-500",
        danger: "text-destructive",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
);

interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  label?: string;
}

const Spinner = ({
  className,
  size,
  variant,
  label,
  ...props
}: SpinnerProps) => {
  return (
    <div {...props} className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(spinnerVariants({ size, variant }))}
        role="status"
        aria-label={label || "Loading"}
      />
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </div>
  );
};

export { Spinner, spinnerVariants };
