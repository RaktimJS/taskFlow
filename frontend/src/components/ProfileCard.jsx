import React from "react"
import { Link } from "react-router-dom"
import { ChevronRight } from "lucide-react"
import { useApp } from "../context/AppContext.jsx"
import { getToday, parseDateString } from "../lib/dateUtils.js"

export function ProfileCard() {
  const { profile, stats } = useApp()
  const name = (profile.name || "User").trim() || "User"
  const initial = name.charAt(0).toUpperCase()

  const todayStr = getToday()
  const todayDate = parseDateString(todayStr) || new Date()

  // Format date e.g. "Sat, Oct 10"
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(todayDate)

  // Contextual time-of-day greeting
  const hour = new Date().getHours()
  const timeGreeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  return (
    <div className="w-full lg:w-[340px] flex-shrink-0 flex justify-center lg:justify-end">
      <Link
        to="/profile"
        aria-label="Open profile and settings"
        className="group relative w-full block outline-none select-none focus-visible:ring-2 focus-visible:ring-[#0A6CFF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141416] squircle-2xl"
      >
        {/* Pre-rendered ambient glow layer (smooth opacity fade on hover) */}
        <div
          className="profile-card-glow absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#0A6CFF]/25 to-[#38bdf8]/20 filter blur-xl opacity-0 pointer-events-none"
          aria-hidden="true"
        />

        {/* Main Card Container */}
        <div className="profile-card-container theme-card squircle-2xl p-5 relative overflow-hidden w-full min-h-[135px] sm:h-[148px] flex items-center justify-between border border-white/10 shadow-xl">
          {/* Subtle inner corner glow */}
          <div className="absolute top-0 right-0 w-28 h-28 bg-[#0A6CFF]/5 rounded-full filter blur-xl pointer-events-none" />

          {/* Left section: Large Avatar + Greeting Info */}
          <div className="flex items-center gap-4 min-w-0 z-10">
            {/* Avatar: 68px circular blue gradient with bold 28px initial & scaled green dot */}
            <div className="relative flex-shrink-0">
              {/* Subtle animated ring (soft pulsing outline on hover/focus) */}
              <div
                className="avatar-pulse-ring absolute -inset-1 rounded-full border-2 border-[#0A6CFF]/70 opacity-0 pointer-events-none"
                aria-hidden="true"
              />

              <div className="w-[68px] h-[68px] rounded-full bg-gradient-to-tr from-[#00388a] via-[#0A6CFF] to-[#60a5fa] p-[2.5px] shadow-lg shadow-[#0A6CFF]/20">
                <div className="w-full h-full rounded-full bg-[#141416] flex items-center justify-center text-white font-bold text-[28px] tracking-tight">
                  {initial}
                </div>
              </div>

              {/* Scaled-up online status dot (16px) */}
              <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#1c1c1f]" />
            </div>

            {/* Greeting Text Stack */}
            <div className="flex flex-col justify-center min-w-0">
              {/* "Hi, {name}" in 24-28px with name in blue accent */}
              <h2 className="text-2xl sm:text-[26px] font-semibold text-white tracking-tight leading-snug truncate">
                Hi, <span className="text-[#3b82f6] font-bold">{name}</span>
              </h2>

              {/* Subtext: Greeting & Date at ~14px with comfortable line height and better contrast */}
              <p className="text-[14px] text-zinc-300 font-medium leading-normal truncate mt-0.5">
                {timeGreeting} · {formattedDate}
              </p>

              {/* Sprint Task Counts */}
              <p className="text-[13px] sm:text-[14px] text-zinc-400 font-normal leading-normal truncate">
                {stats ? `${stats.open} open · ${stats.completed} done` : "0 open · 0 done"}
              </p>
            </div>
          </div>

          {/* Right section: Sliding Chevron Icon */}
          <div className="flex items-center justify-center pl-2 z-10 flex-shrink-0">
            <div className="w-8 h-8 squircle-md bg-white/5 flex items-center justify-center text-zinc-400">
              <ChevronRight className="chevron-slide w-4 h-4 transition-colors" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
