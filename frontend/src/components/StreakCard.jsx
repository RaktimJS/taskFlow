import React from "react"
import { Trophy, Check, X, Minus } from "lucide-react"

/**
 * Animated SVG Flame Component with multi-stage gradients and distinct state rendering.
 */
function FlameIcon({ state, streak }) {
  if (state === "broken" || streak === 0) {
    // Grey outline flame with no animation
    return (
      <svg
        width="44"
        height="52"
        viewBox="0 0 32 38"
        fill="none"
        stroke="currentColor"
        className="w-10 h-12 text-zinc-600 flex-shrink-0"
        aria-hidden="true"
      >
        <path
          d="M16 2C16 2 24 10 24 19C24 25.0751 19.5228 30 14 30C8.47715 30 4 25.0751 4 19C4 13.5 9 7 16 2Z"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14 26C16.2091 26 18 24.2091 18 22C18 19 15 16 14 16C13 16 10 19 10 22C10 24.2091 11.7909 26 14 26Z"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  const isAtRisk = state === "atRisk"
  const isActive = state === "active"

  return (
    <div className="relative w-10 h-12 flex-shrink-0 flex items-center justify-center">
      {/* Background radial glow */}
      <div
        className={`absolute inset-0 rounded-full filter blur-md pointer-events-none ${
          isActive
            ? "bg-gradient-to-t from-orange-600/50 to-amber-400/40 animate-flame-glow"
            : isAtRisk
            ? "bg-gradient-to-t from-amber-600/30 to-orange-700/20 animate-flame-at-risk"
            : "bg-amber-500/20"
        }`}
      />

      <svg
        width="44"
        height="52"
        viewBox="0 0 32 38"
        className={`w-10 h-12 relative z-10 transition-transform duration-300 ${
          isActive ? "animate-flame-flicker" : isAtRisk ? "animate-flame-at-risk" : ""
        }`}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="flameOuterGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ea580c" />
            <stop offset="60%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#facc15" />
          </linearGradient>

          <linearGradient id="flameInnerGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="70%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
        </defs>

        {/* Outer Flame */}
        <path
          d="M16 2C16 2 24.5 9.5 24.5 19.5C24.5 25.85 19.8 31 14 31C8.2 31 3.5 25.85 3.5 19.5C3.5 13.8 8.5 7 16 2Z"
          fill="url(#flameOuterGrad)"
          className={isAtRisk ? "opacity-85" : "opacity-100"}
        />

        {/* Secondary decorative tongue */}
        <path
          d="M16 7C16 7 21 13 21 18.5C21 21.5 18.5 24 16 24C13.5 24 11 21.5 11 18.5C11 15 13.5 10 16 7Z"
          fill="#fbbf24"
          opacity="0.9"
        />

        {/* White-hot Inner Core */}
        <path
          d="M14.5 17C14.5 17 18 20.5 18 23.5C18 26 16.2 28 14 28C11.8 28 10 26 10 23.5C10 21 12.5 18.5 14.5 17Z"
          fill="url(#flameInnerGrad)"
        />
      </svg>
    </div>
  )
}

/**
 * 7-Day Strip Tile Component
 */
function DayTile({ day }) {
  const { dayInitial, status, isToday, dayTotal, dayDone, tooltip, dayNumber } = day

  // Tooltip helper
  return (
    <div
      title={tooltip}
      aria-label={tooltip}
      tabIndex={0}
      className={`squircle-md flex flex-col items-center justify-between py-1 px-1 transition-all duration-200 select-none group focus:outline-none focus:ring-1 focus:ring-[#0A6CFF] ${
        isToday
          ? status === "today-complete"
            ? "w-8 h-11 sm:w-9 sm:h-12 bg-gradient-to-b from-amber-500 to-orange-600 text-white shadow-md shadow-orange-500/25 ring-1 ring-amber-300/40"
            : "w-8 h-11 sm:w-9 sm:h-12 bg-[#141416] border border-[#0A6CFF]/40 text-zinc-200 ring-1 ring-[#0A6CFF]/20"
          : status === "done"
          ? "w-7 h-10 sm:w-8 sm:h-11 bg-gradient-to-b from-amber-500/90 to-orange-600/90 text-white shadow-sm shadow-orange-500/20"
          : status === "missed"
          ? "w-7 h-10 sm:w-8 sm:h-11 bg-rose-950/30 border border-rose-500/30 text-rose-400"
          : "w-7 h-10 sm:w-8 sm:h-11 bg-white/5 border border-white/5 text-zinc-500"
      }`}
    >
      {/* Weekday initial */}
      <span
        className={`text-[9px] font-bold leading-none ${
          isToday
            ? status === "today-complete"
              ? "text-white"
              : "text-[#3b82f6]"
            : status === "done"
            ? "text-white/90"
            : "text-zinc-400"
        }`}
      >
        {dayInitial}
      </span>

      {/* Status Center Icon / Mini Progress Ring */}
      <div className="flex items-center justify-center my-auto">
        {isToday ? (
          status === "today-complete" ? (
            <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
          ) : (
            <div className="relative w-4.5 h-4.5 flex items-center justify-center">
              {/* Mini SVG Progress Ring */}
              <svg className="w-4.5 h-4.5 -rotate-90" viewBox="0 0 20 20">
                <circle
                  cx="10"
                  cy="10"
                  r="7.5"
                  className="stroke-white/10"
                  strokeWidth="2.2"
                  fill="none"
                />
                <circle
                  cx="10"
                  cy="10"
                  r="7.5"
                  className="stroke-[#0A6CFF] transition-all duration-300"
                  strokeWidth="2.2"
                  strokeDasharray="47.12"
                  strokeDashoffset={
                    dayTotal > 0
                      ? 47.12 * (1 - Math.min(1, dayDone / dayTotal))
                      : 47.12
                  }
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <span className="absolute text-[8px] font-bold text-white">
                {dayDone}
              </span>
            </div>
          )
        ) : status === "done" ? (
          <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
        ) : status === "missed" ? (
          <X className="w-3 h-3 text-rose-400 stroke-[2]" />
        ) : (
          <Minus className="w-3 h-3 text-zinc-500 stroke-[2]" />
        )}
      </div>

      {/* Date day number */}
      <span className="text-[8px] font-medium leading-none opacity-70">
        {dayNumber}
      </span>
    </div>
  )
}

/**
 * Daily Streak Card (Change 2)
 */
export function StreakCard({ streakData }) {
  const {
    streak = 0,
    bestStreak = 0,
    state = "idle",
    todayDone = 0,
    todayTotal = 0,
    isComplete = false,
    weekStrip = [],
  } = streakData

  const progressPercent =
    todayTotal === 0 ? 0 : Math.round((todayDone / todayTotal) * 100)

  return (
    <div
      id="daily-streak-card"
      className="theme-card squircle-2xl p-4 sm:p-5 relative overflow-hidden transition-all duration-300 w-full max-w-[480px] min-h-[135px] sm:h-[148px] flex flex-col justify-between border border-white/10 shadow-xl"
    >
      {/* Background Soft Glow matching streak state */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden squircle-2xl">
        <div
          className={`absolute -top-12 -left-12 w-48 h-48 rounded-full filter blur-2xl transition-all duration-500 ${
            state === "active"
              ? "bg-gradient-to-br from-orange-500/20 via-amber-500/15 to-transparent"
              : state === "atRisk"
              ? "bg-gradient-to-br from-amber-600/15 via-orange-600/10 to-transparent"
              : state === "broken"
              ? "bg-zinc-800/20"
              : "bg-amber-500/10"
          }`}
        />
      </div>

      {/* Top Main Section: Flame & Numbers (Left) + 7-Day Strip (Right) */}
      <div className="flex items-center justify-between gap-3 relative z-10">
        {/* Left Side: Flame + Large Streak Number + Best Streak */}
        <div className="flex items-center gap-3">
          <FlameIcon state={state} streak={streak} />

          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl sm:text-5xl font-black tracking-tight tabular-nums text-white leading-none">
                {streak}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-zinc-400 tracking-wide">
                day streak
              </span>
            </div>

            {/* Best Streak with Trophy */}
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-amber-400/90 font-medium">
              <Trophy className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>Best: {bestStreak} {bestStreak === 1 ? "day" : "days"}</span>
            </div>
          </div>
        </div>

        {/* Right Side: 7-Day Strip Tiles */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {weekStrip.map((day) => (
            <DayTile key={day.dateStr} day={day} />
          ))}
        </div>
      </div>

      {/* Bottom Section: Progress Bar & Status Pill */}
      <div className="flex flex-col gap-1.5 mt-3 relative z-10">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[11px] text-zinc-300 font-medium">
            {todayTotal > 0
              ? `${todayDone} / ${todayTotal} tasks done today`
              : "No tasks scheduled today"}
          </span>

          {/* Right Status Pill */}
          {isComplete ? (
            <span className="px-2 py-0.5 squircle-sm bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold text-[10px] tracking-wide flex items-center gap-1">
              <Check className="w-3 h-3 stroke-[3]" />
              <span>Streak secured</span>
            </span>
          ) : state === "atRisk" ? (
            <span className="text-[10px] text-amber-300 font-medium tracking-wide">
              {todayTotal - todayDone}{" "}
              {todayTotal - todayDone === 1 ? "task" : "tasks"} left to keep streak
            </span>
          ) : state === "broken" ? (
            <span className="text-[10px] text-zinc-400 font-medium">
              Start a new streak today
            </span>
          ) : (
            <span className="text-[10px] text-zinc-400 font-medium">
              Add a task for today to start
            </span>
          )}
        </div>

        {/* Thin progress track */}
        <div className="w-full h-1.5 bg-white/10 squircle-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ease-out squircle-full ${
              isComplete
                ? "bg-gradient-to-r from-amber-400 to-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                : "bg-[#0A6CFF] shadow-[0_0_8px_rgba(10,108,255,0.4)]"
            }`}
            style={{ width: `${todayTotal === 0 ? 0 : progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  )
}
