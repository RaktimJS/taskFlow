import React from "react"
import { useApp } from "../context/AppContext.jsx"

export function CategoryChip({ categoryId, category: directCategory, size = "sm" }) {
  const { getCategoryById } = useApp()
  const cat = directCategory || getCategoryById(categoryId)

  if (!cat) return null

  const sizeClasses =
    size === "xs"
      ? "text-[10px] px-1.5 py-0.5 gap-1"
      : size === "md"
      ? "text-xs px-2.5 py-1 gap-1.5 font-medium"
      : "text-[11px] px-2 py-0.5 gap-1.5 font-medium"

  return (
    <span
      className={`squircle-sm inline-flex items-center bg-white/5 border border-white/10 text-zinc-300 max-w-[140px] truncate select-none ${sizeClasses}`}
      style={{
        backgroundColor: `${cat.color}15`,
        borderColor: `${cat.color}35`,
        color: cat.color,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: cat.color }}
      />
      <span className="truncate">{cat.name}</span>
    </span>
  )
}
