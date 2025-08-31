import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border-2 transition-colors ",
          // 默认边框：亮色浅灰，暗色深灰
          "border-zinc-300 dark:border-zinc-600",
          // 背景和文字颜色
          "bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100",
          "px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground",
          // Focus 样式：边框变黑 (亮色)，无外轮廓
          "focus:border-black focus:outline-none",
          // 暗色 Focus 样式：边框变白
          "dark:focus:border-white",
          "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
