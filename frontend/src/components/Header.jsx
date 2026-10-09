import React from "react"
import { CheckSquare } from "lucide-react"
import { StreakCard } from "./StreakCard"
import { ProfileCard } from "./ProfileCard"

export function Header({ stats, streakData }) {
  return (
    <header className="w-full flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 py-2 px-1 sm:px-0">
      {/* 
        ZONE 1: TaskFlow Logo & Title (Big & Prominent)
        - Desktop (>= 1024px): Left zone (330px wide, matching dashboard left column)
        - Mobile (< 1024px): 3rd in stack
      */}
      <div className="order-3 lg:order-1 lg:w-[330px] flex-shrink-0 flex items-center gap-3.5 sm:gap-4">
        {/* Large Brand Icon */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 squircle-xl bg-gradient-to-br from-[#0A6CFF] via-[#0055d4] to-[#00388a] flex items-center justify-center text-white shadow-xl shadow-[#0A6CFF]/30 border border-white/15 flex-shrink-0">
          <CheckSquare className="w-7 h-7 sm:w-8 sm:h-8 text-white stroke-[2.2]" />
        </div>

        {/* Large Brand Title & Subtitle */}
        <div className="min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-none">
              TaskFlow
            </h1>
            <span className="text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 squircle-sm bg-[#0A6CFF]/20 text-[#3b82f6] border border-[#0A6CFF]/30">
              Pro
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-normal line-clamp-1">
            Sprint velocity & deadline tracker
          </p>
        </div>
      </div>

      {/* 
        ZONE 2: Daily Streak Card (Change 2)
        - Desktop: Center zone (flex-1 max-w-[480px] centered)
        - Mobile: 2nd in stack
      */}
      <div className="order-2 lg:order-2 flex-1 flex justify-center w-full">
        <StreakCard streakData={streakData} />
      </div>

      {/* 
        ZONE 3: "Hi, User" Profile Card (Change 1 & 2 Link to Profile)
        - Desktop: Right zone (340px wide, matching dashboard right column)
        - Mobile: 1st in stack (top)
      */}
      <div className="order-1 lg:order-3 lg:w-[340px] flex-shrink-0 flex justify-center lg:justify-end w-full">
        <ProfileCard />
      </div>
    </header>
  )
}
