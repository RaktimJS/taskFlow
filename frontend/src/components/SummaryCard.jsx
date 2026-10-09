import React from "react"
import { CheckCircle2, Clock, AlertTriangle, ListTodo, Zap, ShieldCheck } from "lucide-react"

export function SummaryCard({ stats }) {
  // Generate real status label based on current tasks
  const getStatusSubtitle = () => {
    if (stats.total === 0) {
      return "No tasks created yet. Add a task to begin tracking."
    }
    if (stats.completed === stats.total && stats.total > 0) {
      return "All tasks completed! Sprint velocity is at 100%."
    }
    if (stats.overdue > 0) {
      return `${stats.overdue} task${stats.overdue > 1 ? "s" : ""} overdue — action required`
    }
    return `${stats.open} open task${stats.open > 1 ? "s" : ""} pending completion`
  }

  return (
    <div className="theme-card squircle-2xl p-6 relative overflow-hidden transition-all duration-300 flex flex-col justify-between h-full">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="text-xl sm:text-2xl font-light tracking-tight text-white">
            Today's Sprint
          </h3>
          <span className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-0.5 squircle-sm bg-[#0A6CFF]/15 text-[#3b82f6] border border-[#0A6CFF]/25">
            {stats.total > 0 ? `${stats.percentage}% Done` : "Ready"}
          </span>
        </div>

        <p className="text-xs text-zinc-400 mb-3.5">
          {getStatusSubtitle()}
        </p>

        {/* Dynamic status pill matching image style */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 squircle-sm bg-[#0A6CFF]/10 text-[#60a5fa] border border-[#0A6CFF]/20 text-xs font-medium mb-4">
          <Zap className="w-3.5 h-3.5 text-[#0A6CFF]" />
          <span>
            {stats.total === 0
              ? "0 Total Tasks in Queue"
              : `${stats.completed} of ${stats.total} Tasks Completed`}
          </span>
        </div>
      </div>

      {/* Middle: Real Metrics Grid (All 4 metrics from real task data) */}
      <div className="grid grid-cols-2 gap-2.5 my-2">
        <div className="squircle-lg bg-[#18181b]/80 border border-white/5 p-3 flex items-center justify-between transition-colors hover:border-white/10">
          <div>
            <span className="text-[10px] sm:text-[11px] text-zinc-400 uppercase font-medium block">
              Total Tasks
            </span>
            <span className="text-xl font-semibold text-white mt-0.5 block">
              {stats.total}
            </span>
          </div>
          <div className="w-8 h-8 squircle-md bg-white/5 flex items-center justify-center text-zinc-300">
            <ListTodo className="w-4 h-4 text-zinc-400" />
          </div>
        </div>

        <div className="squircle-lg bg-[#18181b]/80 border border-white/5 p-3 flex items-center justify-between transition-colors hover:border-white/10">
          <div>
            <span className="text-[10px] sm:text-[11px] text-zinc-400 uppercase font-medium block">
              Overdue
            </span>
            <span
              className={`text-xl font-semibold mt-0.5 block ${
                stats.overdue > 0 ? "text-rose-400" : "text-zinc-400"
              }`}
            >
              {stats.overdue}
            </span>
          </div>
          <div
            className={`w-8 h-8 squircle-md flex items-center justify-center ${
              stats.overdue > 0
                ? "bg-rose-500/15 text-rose-400"
                : "bg-white/5 text-zinc-400"
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Bottom Area: Real Insights matching card footer layout */}
      <div className="pt-3.5 border-t border-white/5 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-zinc-400">
          <Clock className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-zinc-300">
            {stats.open} Open Task{stats.open === 1 ? "" : "s"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-zinc-400">
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-zinc-300">
            {stats.highPriority} High Priority
          </span>
        </div>
      </div>
    </div>
  )
}
