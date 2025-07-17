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
      sm: "h-3 w-3",
      md: "h-5 w-5",
      lg: "h-7 w-7",
      xl: "h-9 w-9",
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
