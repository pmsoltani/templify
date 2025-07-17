import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { CircleIcon } from "lucide-react";

const spinnerVariants = cva("text-transparent animate-spin rounded-full border-2", {
  variants: {
    variant: {
      default: "border-white/50 border-t-white",
      destructive: "border-white/50 border-t-white",
      outline: "border-gray-300 border-t-gray-900",
      secondary: "border-gray-400 border-t-gray-900",
      ghost: "border-gray-300 border-t-gray-900",
      link: "border-blue-300 border-t-blue-600",
    },
    size: {
      sm: "h-4 w-4",
      md: "h-6 w-6",
      lg: "h-8 w-8",
      xl: "h-10 w-10",
    },
  },
  defaultVariants: { variant: "default", size: "sm" },
});

export default function Spinner({ className, variant, size, ...props }) {
  return (
    <CircleIcon
      className={cn(spinnerVariants({ className, variant, size }))}
      {...props}
    />
  );
}
