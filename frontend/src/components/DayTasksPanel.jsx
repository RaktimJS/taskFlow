import React from "react"
import { Check, Trash2, Calendar, Clock, X } from "lucide-react"
import { parseDateString } from "../lib/dateUtils"
import { isOverdue } from "../lib/taskStore"
import { CategoryChip } from "./CategoryChip.jsx"

export const DayTasksPanel = React.memo(function DayTasksPanel({
  selectedDate,
  tasks = [],
  onToggleTask,
  onDeleteTask,
  onClose,
}) {
  const d = parseDateString(selectedDate)
  const formattedDate = d
    ? d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })
    : selectedDate

  const priorityStyles = {
    high: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    medium: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    low: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  }

  return (
    <div className="flex flex-col h-full bg-[#18181b] border-l border-white/10 p-4 sm:p-5">
      {/* Panel Header */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/5 flex-shrink-0">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block">
            Selected Day
          </span>
          <h4 className="text-sm sm:text-base font-medium text-white flex items-center gap-1.5 mt-0.5">
            <Calendar className="w-4 h-4 text-[#0A6CFF]" />
            <span>{formattedDate}</span>
          </h4>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="sm:hidden squircle-sm p-1.5 text-zinc-400 hover:text-white hover:bg-white/10"
            aria-label="Close day panel"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Task Count Header */}
      <div className="flex items-center justify-between my-3 flex-shrink-0">
        <span className="text-xs text-zinc-400 font-medium">
          {tasks.length} {tasks.length === 1 ? "task" : "tasks"} due
        </span>
      </div>

      {/* Task List for this day */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2 min-h-[160px]">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center text-zinc-500">
            <Clock className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-xs font-medium text-zinc-400">No tasks due this day</p>
          </div>
        ) : (
          tasks.map((task) => {
            const overdue = isOverdue(task.dueDate, task.completed)

            return (
              <div
                key={task.id}
                className={`squircle-lg p-2.5 sm:p-3 border flex items-center justify-between gap-2.5 transition-all ${
                  task.completed
                    ? "bg-[#141416]/50 border-white/5 opacity-60"
                    : "bg-[#1f1f23]/80 hover:bg-[#232328] border-white/10"
                }`}
              >
                {/* Left: Checkbox & title */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={task.completed}
                    onClick={() => onToggleTask(task.id)}
                    className={`squircle-sm w-4 h-4 flex-shrink-0 flex items-center justify-center border transition-all ${
                      task.completed
                        ? "bg-[#0A6CFF] border-[#0A6CFF] text-white"
                        : "bg-[#141416] border-white/20 hover:border-[#0A6CFF]"
                    }`}
                  >
                    <Check className={`w-3 h-3 stroke-[3] ${task.completed ? "opacity-100" : "opacity-0"}`} />
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-xs tracking-tight block truncate ${
                          task.completed
                            ? "line-through text-zinc-500"
                            : "text-zinc-200 font-medium"
                        }`}
                      >
                        {task.title}
                      </span>
                      {task.category && (
                        <CategoryChip categoryId={task.category} size="xs" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Priority pill & delete button */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span
                    className={`squircle-sm text-[10px] uppercase font-semibold px-2 py-0.5 border ${
                      priorityStyles[task.priority] || "bg-white/5 text-zinc-400 border-white/10"
                    }`}
                  >
                    {task.priority}
                  </span>

                  <button
                    type="button"
                    onClick={() => onDeleteTask(task.id)}
                    aria-label={`Delete ${task.title}`}
                    className="squircle-sm p-1 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
})
