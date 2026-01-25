import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-none border px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.2em] transition-colors focus:outline-none focus:ring-0",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-white text-black",
        secondary:
          "border-white/10 bg-white/5 text-white/70",
        destructive:
          "border-red-500/20 bg-red-500/10 text-red-500",
        outline: "text-white/40 border-white/5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
