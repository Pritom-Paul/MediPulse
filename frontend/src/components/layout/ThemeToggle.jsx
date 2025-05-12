"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div 
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative inline-flex items-center h-6 rounded-full w-12 cursor-pointer bg-muted"
    >
      <div className={`absolute w-6 h-6 transition-all duration-300 rounded-full bg-primary flex items-center justify-center ${theme === "dark" ? "translate-x-6" : "translate-x-0"}`}>
        {theme === "dark" ? (
          <Moon className="h-3 w-3 text-primary-foreground" />
        ) : (
          <Sun className="h-3 w-3 text-primary-foreground" />
        )}
      </div>
      <div className="flex w-full justify-between px-1.5">
        <Sun className="h-3 w-3" />
        <Moon className="h-3 w-3" />
      </div>
    </div>
  )
}