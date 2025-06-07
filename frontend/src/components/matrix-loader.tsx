import { cn } from "@/lib/utils"

interface MatrixLoaderProps {
  className?: string
  size?: "sm" | "md" | "lg"
  colorScheme?: "blue" | "purple" | "green" | "red" | "amber"
  rows?: number
  cols?: number
}

export function MatrixLoader({ className, size = "md", colorScheme = "blue", rows = 3, cols = 3 }: MatrixLoaderProps) {
  // 크기에 따른 설정
  const sizeConfig = {
    sm: { dotSize: "w-1.5 h-1.5", gap: "gap-0.5" },
    md: { dotSize: "w-2 h-2", gap: "gap-1" },
    lg: { dotSize: "w-3 h-3", gap: "gap-1.5" },
  }

  // 색상 계열에 따른 색상 맵 (명도만 다른 단일 색상 계열)
  const colorMaps = {
    blue: ["bg-blue-300", "bg-blue-400", "bg-blue-500", "bg-blue-600", "bg-blue-700", "bg-blue-800"],
    purple: ["bg-purple-300", "bg-purple-400", "bg-purple-500", "bg-purple-600", "bg-purple-700", "bg-purple-800"],
    green: ["bg-green-300", "bg-green-400", "bg-green-500", "bg-green-600", "bg-green-700", "bg-green-800"],
    red: ["bg-red-300", "bg-red-400", "bg-red-500", "bg-red-600", "bg-red-700", "bg-red-800"],
    amber: ["bg-amber-300", "bg-amber-400", "bg-amber-500", "bg-amber-600", "bg-amber-700", "bg-amber-800"],
  }

  const colors = colorMaps[colorScheme]
  const { dotSize, gap } = sizeConfig[size]

  return (
    <div className={cn("inline-flex flex-col", gap, className)}>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className={cn("flex", gap)}>
          {[...Array(cols)].map((_, j) => {
            // 위치에 따라 색상 인덱스 결정 (패턴 생성)
            const colorIndex = (i + j) % colors.length

            return (
              <div
                key={j}
                className={cn("rounded animate-pulse", dotSize, colors[colorIndex])}
                style={{
                  animationDelay: `${(i * cols + j) * 0.1}s`,
                  animationDuration: "1.5s",
                }}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}
