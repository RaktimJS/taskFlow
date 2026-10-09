import React from "react"
import { Calendar, User, Sparkles } from "lucide-react"
import { getToday, parseDateString } from "../lib/dateUtils.js"

export function UserGreetingCard({ stats }) {
  const todayStr = getToday()
  const todayDate = parseDateString(todayStr) || new Date()

  // Format formatted date e.g. "Saturday, Oct 10"
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(todayDate)

  // Contextual time of day
  const hour = new Date().getHours()
  const timeGreeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  return (
    <div
      id="user-greeting-card"
      className="theme-card squircle-2xl p-4 sm:p-5 relative overflow-hidden transition-all duration-300 w-full lg:w-[340px] min-h-[135px] sm:h-[148px] flex flex-col justify-between border border-white/10 shadow-xl"
    >
      {/* Subtle Blue ambient glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#0A6CFF]/10 rounded-full filter blur-2xl pointer-events-none" />

      {/* Top Row: Avatar & Greeting */}
      <div className="flex items-center gap-3 relative z-10">
        {/* User Avatar - Strictly Circular per design tokens */}
        <div className="relative flex-shrink-0">
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#18181b] to-[#27272a] border-2 border-[#0A6CFF]/40 flex items-center justify-center text-[#3b82f6] shadow-md shadow-[#0A6CFF]/20">
            <User className="w-5 h-5 text-white" />
          </div>
          {/* Active online pulse dot */}
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#1c1c1f]" />
        </div>

        {/* User Greeting Text */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
              Hi, User
            </h2>
            <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          </div>
          <span className="text-xs text-zinc-400 font-medium">
            {timeGreeting}
          </span>
        </div>
      </div>

      {/* Bottom Row: Today's Date & Sprint Status */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5 relative z-10">
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <Calendar className="w-3.5 h-3.5 text-[#0A6CFF]" />
          <span className="font-medium text-zinc-300">{formattedDate}</span>
        </div>

        <span className="text-[11px] text-zinc-400 font-medium">
          {stats ? `${stats.open} open · ${stats.completed} done` : "Sprint active"}
        </span>
      </div>
    </div>
  )
}
