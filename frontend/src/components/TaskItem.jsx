import React, { useState } from "react"
import { Check, Calendar, Trash2, AlertCircle, Clock } from "lucide-react"
import { isOverdue } from "../lib/taskStore"
import { CategoryChip } from "./CategoryChip.jsx"

export function TaskItem({ task, onToggle, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const overdue = isOverdue(task.dueDate, task.completed)

  // Priority badge styling matching reference image tinted chips
  const priorityStyles = {
    high: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    low: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  }

  // Format due date cleanly
  const formatDueDate = (dateStr) => {
    if (!dateStr) return null
    try {
      const target = new Date(dateStr)
      target.setHours(0, 0, 0, 0)
      const now = new Date()
      now.setHours(0, 0, 0, 0)

      const diffDays = Math.round((target - now) / (1000 * 60 * 60 * 24))

      if (diffDays === 0) return "Due Today"
      if (diffDays === 1) return "Due Tomorrow"
      if (diffDays === -1) return "1 day overdue"
      if (diffDays < -1) return `${Math.abs(diffDays)}d overdue`

      return target.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    } catch {
      return dateStr
    }
  }

  const handleDeleteClick = (e) => {
    e.stopPropagation()
    setIsDeleting(true)
    setTimeout(() => {
      onDelete(task.id)
    }, 150)
  }

  return (
    <div
      role="listitem"
      className={`group relative flex items-center justify-between gap-3 p-3.5 squircle-lg transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] border ${
        task.completed
          ? "bg-[#18181b]/50 border-white/5 opacity-65"
          : "bg-[#1f1f23]/60 hover:bg-[#232328] border-white/[0.08] hover:border-white/15 hover:shadow-md"
      } ${isDeleting ? "opacity-0 scale-95 duration-150" : ""}`}
    >
      {/* Left section: Checkbox & Title */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {/* Squircle Checkbox */}
        <button
          type="button"
          role="checkbox"
          aria-checked={task.completed}
          aria-label={`Mark "${task.title}" as ${task.completed ? "open" : "done"}`}
          onClick={() => onToggle(task.id)}
          className={`squircle-sm w-5 h-5 flex-shrink-0 flex items-center justify-center border transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] focus:outline-none focus:ring-2 focus:ring-[#0A6CFF] focus:ring-offset-1 focus:ring-offset-[#141416] ${
            task.completed
              ? "bg-[#0A6CFF] border-[#0A6CFF] text-white shadow-sm shadow-[#0A6CFF]/30 scale-100"
              : "bg-[#141416]/80 border-white/20 hover:border-[#0A6CFF]/60 text-transparent hover:text-white/20 scale-95 hover:scale-100"
          }`}
        >
          <Check
            className={`w-3.5 h-3.5 stroke-[3] transition-all duration-200 ease-out ${
              task.completed ? "scale-100 opacity-100" : "scale-50 opacity-0"
            }`}
          />
        </button>

        {/* Task Title & Details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              title={task.title}
              className={`text-sm tracking-tight transition-all duration-300 ease-out truncate block max-w-full ${
                task.completed
                  ? "line-through text-zinc-500 font-normal"
                  : "text-zinc-100 font-medium"
              }`}
            >
              {task.title}
            </span>

            {/* Category Chip (using category's name and color) */}
            {task.category && (
              <CategoryChip categoryId={task.category} />
            )}
          </div>

          {task.description && (
            <p className="text-xs text-zinc-400 truncate mt-0.5 max-w-md transition-opacity">
              {task.description}
            </p>
          )}
        </div>
      </div>

      {/* Right section: Priority, Due Date & Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Priority Chip */}
        <span
          className={`squircle-sm text-[11px] uppercase tracking-wider font-semibold px-2.5 py-0.5 border transition-colors ${
            priorityStyles[task.priority] || priorityStyles.medium
          }`}
        >
          {task.priority}
        </span>

        {/* Due Date Chip */}
        {task.dueDate && (
          <div
            title={`Due date: ${task.dueDate}${overdue ? " (Overdue)" : ""}`}
            className={`squircle-sm flex items-center gap-1.5 text-xs px-2.5 py-0.5 border transition-all duration-200 ${
              overdue
                ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
                : task.completed
                ? "bg-white/5 text-zinc-500 border-white/5"
                : "bg-white/5 text-zinc-300 border-white/10"
            }`}
          >
            {overdue ? (
              <AlertCircle className="w-3 h-3 text-rose-400" />
            ) : (
              <Clock className="w-3 h-3 text-zinc-400" />
            )}
            <span className="hidden sm:inline">{formatDueDate(task.dueDate)}</span>
            <span className="sm:hidden text-[11px]">{task.dueDate.slice(5)}</span>
          </div>
        )}

        {/* Delete Action button */}
        <button
          type="button"
          onClick={handleDeleteClick}
          aria-label={`Delete task "${task.title}"`}
          className="squircle-md p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 opacity-80 sm:opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
