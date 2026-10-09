import React from "react"
import { CheckCircle2, Inbox, Plus, Sparkles, Filter } from "lucide-react"

export function EmptyState({ filter, onAddNewTask, totalCount }) {
  if (totalCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="relative w-16 h-16 squircle-xl bg-gradient-to-b from-[#222227] to-[#18181b] border border-white/10 flex items-center justify-center text-[#0A6CFF] shadow-inner mb-4">
          <Sparkles className="w-8 h-8 text-[#0A6CFF] animate-pulse" />
          <div className="absolute inset-0 bg-[#0A6CFF]/10 squircle-xl filter blur-xl -z-10" />
        </div>
        <h3 className="text-base sm:text-lg font-medium text-white mb-1">
          No tasks yet
        </h3>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-xs mb-6">
          Your workspace is clear. Create your first task to start tracking your sprint progress.
        </p>
        <button
          onClick={onAddNewTask}
          className="squircle-md flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium text-white bg-[#0A6CFF] hover:bg-[#005ae0] shadow-lg shadow-[#0A6CFF]/20 transition-all focus:outline-none focus:ring-2 focus:ring-[#0A6CFF]"
        >
          <Plus className="w-4 h-4" />
          <span>Add your first task</span>
        </button>
      </div>
    )
  }

  // Filter specific empty states
  let title = "No matching tasks"
  let description = "Try selecting another status tab or clearing your filters."
  let icon = <Inbox className="w-8 h-8 text-zinc-500" />

  if (filter === "open") {
    title = "All caught up!"
    description = "There are no pending open tasks. Excellent job clearing the queue."
    icon = <CheckCircle2 className="w-8 h-8 text-emerald-400" />
  } else if (filter === "done") {
    title = "No completed tasks yet"
    description = "Check off tasks from your open list to see them completed here."
    icon = <Inbox className="w-8 h-8 text-zinc-500" />
  }

  return (
    <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
      <div className="w-14 h-14 squircle-xl bg-[#1c1c1f] border border-white/10 flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="text-sm sm:text-base font-medium text-white mb-1">
        {title}
      </h3>
      <p className="text-xs text-zinc-400 max-w-xs mb-4">
        {description}
      </p>
    </div>
  )
}
