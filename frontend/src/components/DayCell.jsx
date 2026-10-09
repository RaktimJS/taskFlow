import React from "react"
import { Check, AlertCircle } from "lucide-react"
import { isOverdue } from "../lib/taskStore"

export const DayCell = React.memo(function DayCell({
  cell,
  tasks = [],
  isSelected,
  onSelectDate,
}) {
  const isOverdueTask = (t) => isOverdue(t.dueDate, t.completed)

  const priorityStyles = {
    high: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    medium: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    low: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  }

  const maxVisibleChips = 2
  const visibleTasks = tasks.slice(0, maxVisibleChips)
  const remainingCount = tasks.length - maxVisibleChips

  return (
    <button
      type="button"
      role="gridcell"
      aria-selected={isSelected}
      aria-label={`${cell.dateString}: ${tasks.length} tasks scheduled`}
      onClick={() => onSelectDate(cell.dateString)}
      className={`squircle-lg p-1.5 sm:p-2 min-h-[72px] sm:min-h-[86px] flex flex-col justify-between text-left transition-colors duration-150 border relative group focus:outline-none focus:ring-2 focus:ring-[#0A6CFF] ${
        isSelected
          ? "bg-[#0A6CFF]/10 border-[#0A6CFF] shadow-sm"
          : cell.isCurrentMonth
          ? "bg-[#18181b]/70 hover:bg-[#202026] border-white/5 hover:border-white/15"
          : "bg-[#141416]/40 border-white/[0.02] text-zinc-600 opacity-40 hover:opacity-75"
      }`}
    >
      {/* Top Row: Date number and indicators */}
      <div className="flex items-center justify-between w-full">
        <span
          className={`text-xs font-semibold px-1.5 py-0.5 squircle-sm transition-colors ${
            cell.isToday
              ? "bg-[#0A6CFF] text-white shadow-sm shadow-[#0A6CFF]/30 font-bold"
              : isSelected
              ? "text-[#0A6CFF]"
              : cell.isCurrentMonth
              ? "text-zinc-300"
              : "text-zinc-500"
          }`}
        >
          {cell.dayNumber}
        </span>

        {tasks.length > 0 && (
          <span className="text-[10px] text-zinc-400 font-medium">
            {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
          </span>
        )}
      </div>

      {/* Task chips list */}
      <div className="flex flex-col gap-1 w-full my-1">
        {visibleTasks.map((t) => {
          const overdue = isOverdueTask(t)

          return (
            <div
              key={t.id}
              title={`${t.title} (${t.priority})`}
              className={`squircle-sm px-1.5 py-0.5 text-[10px] leading-tight truncate flex items-center gap-1 border transition-colors ${
                overdue
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40 font-medium"
                  : t.completed
                  ? "bg-white/5 text-zinc-500 border-white/5 line-through opacity-70"
                  : priorityStyles[t.priority] || "bg-white/5 text-zinc-300 border-white/10"
              }`}
            >
              {t.completed ? (
                <Check className="w-2.5 h-2.5 flex-shrink-0 text-emerald-400 stroke-[3]" />
              ) : overdue ? (
                <AlertCircle className="w-2.5 h-2.5 flex-shrink-0 text-rose-400" />
              ) : (
                <span
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    t.priority === "high"
                      ? "bg-rose-400"
                      : t.priority === "medium"
                      ? "bg-amber-400"
                      : "bg-emerald-400"
                  }`}
                />
              )}
              <span className="truncate flex-1">{t.title}</span>
            </div>
          )
        })}

        {remainingCount > 0 && (
          <span className="text-[9px] text-zinc-400 font-semibold px-1 py-0.2 squircle-xs bg-white/5 w-fit">
            +{remainingCount} more
          </span>
        )}
      </div>
    </button>
  )
})
