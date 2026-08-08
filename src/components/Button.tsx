import type { ButtonHTMLAttributes, ReactNode } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost" | "danger"
  size?: "sm" | "md" | "lg"
  loading?: boolean
  children: ReactNode
}

export default function Button({
  variant = "primary",
  size = "md",
  loading,
  children,
  disabled,
  className = "",
  ...rest
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 tracking-wide focus-visible:outline focus-visible:outline-1 cursor-pointer select-none"

  const variants = {
    primary:
      "bg-[#f0ede8] text-[#080808] hover:bg-white active:scale-[0.98] disabled:opacity-40",
    outline:
      "border border-[rgba(240,237,232,0.3)] text-[#f0ede8] hover:border-[rgba(240,237,232,0.7)] hover:bg-[rgba(240,237,232,0.05)] active:scale-[0.98] disabled:opacity-40",
    ghost:
      "text-[rgba(240,237,232,0.6)] hover:text-[#f0ede8] hover:bg-[rgba(240,237,232,0.05)] active:scale-[0.98] disabled:opacity-40",
    danger:
      "border border-red-900 text-red-400 hover:bg-red-950 hover:text-red-300 active:scale-[0.98] disabled:opacity-40",
  }

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-4 text-base tracking-widest uppercase",
  }

  return (
    <button
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {loading && (
        <span className="w-4 h-4 border border-current border-t-transparent rounded-full anim-spin" />
      )}
      {children}
    </button>
  )
}
