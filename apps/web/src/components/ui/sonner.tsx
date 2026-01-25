"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-black group-[.toaster]:text-white group-[.toaster]:border-white/10 group-[.toaster]:rounded-none group-[.toaster]:shadow-2xl font-mono text-[10px] uppercase tracking-widest",
          description: "group-[.toast]:text-white/40",
          actionButton:
            "group-[.toast]:bg-white group-[.toast]:text-black group-[.toast]:rounded-none",
          cancelButton:
            "group-[.toast]:bg-white/5 group-[.toast]:text-white/40 group-[.toast]:rounded-none",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
