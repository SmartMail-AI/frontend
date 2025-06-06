import { cn } from '@/lib/utils'
import { Loader2 } from "lucide-react"

export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "default" | "dots" | "pulse" | "bounce"
  className?: string
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
}

export function LoadingSpinner({ size = "md", variant = "default", className }: LoadingSpinnerProps) {
  if (variant === "dots") {
    return (
      <div className={cn("flex space-x-1", className)}>
        <div
          className={cn(
            "rounded-full bg-current animate-bounce",
            size === "sm" ? "w-1 h-1" : size === "md" ? "w-2 h-2" : size === "lg" ? "w-3 h-3" : "w-4 h-4",
          )}
          style={{ animationDelay: "0ms" }}
        />
        <div
          className={cn(
            "rounded-full bg-current animate-bounce",
            size === "sm" ? "w-1 h-1" : size === "md" ? "w-2 h-2" : size === "lg" ? "w-3 h-3" : "w-4 h-4",
          )}
          style={{ animationDelay: "150ms" }}
        />
        <div
          className={cn(
            "rounded-full bg-current animate-bounce",
            size === "sm" ? "w-1 h-1" : size === "md" ? "w-2 h-2" : size === "lg" ? "w-3 h-3" : "w-4 h-4",
          )}
          style={{ animationDelay: "300ms" }}
        />
      </div>
    )
  }

  if (variant === "pulse") {
    return <div className={cn("rounded-full bg-current animate-pulse", sizeClasses[size], className)} />
  }

  if (variant === "bounce") {
    return <div className={cn("rounded-full bg-current animate-bounce", sizeClasses[size], className)} />
  }

  // Default spinner (rotating icon)
  return <Loader2 className={cn("animate-spin", sizeClasses[size], className)} />
}
