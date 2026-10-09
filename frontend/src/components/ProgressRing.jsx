import React from "react"

export function ProgressRing({ stats }) {
  const percentage = stats.percentage || 0
  const total = stats.total || 0
  const completed = stats.completed || 0
  const open = stats.open || 0
  const overdue = stats.overdue || 0

  // SVG circular dimensions - compact & perfectly proportioned so no stat tiles ever clip
  const size = 180
  const strokeWidth = 13
  const center = size / 2
  const radius = center - strokeWidth - 2
  const circumference = 2 * Math.PI * radius

  // Arc calculation
  const strokeDashoffset = circumference - (circumference * percentage) / 100

  // Generating dotted track markers
  const dotCount = 10
  const dots = Array.from({ length: dotCount }).map((_, i) => {
    const angle = (i / dotCount) * 360 - 90
    const rad = (angle * Math.PI) / 180
    const dotR = radius + strokeWidth / 2 + 8
    const cx = center + dotR * Math.cos(rad)
    const cy = center + dotR * Math.sin(rad)
    const dotProgress = (i / dotCount) * 100
    const isActive = percentage >= dotProgress && percentage > 0
    return { cx, cy, isActive }
  })

  return (
    <div className="theme-card squircle-2xl p-5 sm:p-6 flex flex-col items-center justify-between relative transition-all duration-300 w-full min-h-[360px]">
      {/* Background glow behind gauge */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-full bg-[#0A6CFF]/10 filter blur-3xl -z-10 pointer-events-none" />

      {/* Header */}
      <div className="w-full flex items-center justify-between mb-2 flex-shrink-0">
        <div>
          <span className="text-[11px] uppercase font-semibold text-zinc-400 tracking-wider">
            Sprint Velocity
          </span>
          <h3 className="text-base font-medium text-white">Completion Gauge</h3>
        </div>
        <div className="squircle-sm px-2.5 py-0.5 bg-[#0A6CFF]/15 text-[#3b82f6] border border-[#0A6CFF]/25 text-[11px] font-semibold transition-colors">
          {percentage === 100 ? "Goal Met" : total === 0 ? "Ready" : "Active"}
        </div>
      </div>

      {/* Circular Gauge Widget */}
      <div className="relative flex items-center justify-center my-2 flex-shrink-0">
        {/* Outer radial dish */}
        <div className="w-48 h-48 rounded-full bg-[#18181b] border border-white/5 flex items-center justify-center shadow-inner relative">
          <div className="w-40 h-40 rounded-full border border-white/[0.04] absolute" />
          <div className="w-28 h-28 rounded-full border border-white/[0.04] absolute" />

          {/* SVG Progress Arc with ultra-smooth easing */}
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="transform -rotate-90 z-10"
            aria-label={`Progress: ${percentage}% completed`}
          >
            {/* Background Track Circle */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="#242429"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />

            {/* Active Blue Arc */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="#0A6CFF"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{
                transition: "stroke-dashoffset 0.9s cubic-bezier(0.16, 1, 0.3, 1)",
                filter: "drop-shadow(0 0 8px rgba(10, 108, 255, 0.55))",
              }}
            />
          </svg>

          {/* Center Info Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 pointer-events-none">
            <span className="text-3xl font-bold tracking-tight text-white transition-all duration-300">
              {percentage.toFixed(1)}%
            </span>
            <span className="text-xs text-zinc-400 font-medium tracking-wide mt-0.5">
              Completed
            </span>
          </div>

          {/* Orbiting Track Dots */}
          <div className="absolute inset-0 pointer-events-none z-15">
            {dots.slice(0, 7).map((dot, idx) => (
              <div
                key={idx}
                className={`absolute w-1.5 h-1.5 rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  dot.isActive
                    ? "bg-[#0A6CFF] shadow-[0_0_8px_#0A6CFF] scale-110"
                    : "bg-white/10 scale-90"
                }`}
                style={{
                  left: `${(dot.cx / size) * 100}%`,
                  top: `${(dot.cy / size) * 100}%`,
                  transform: "translate(-50%, -50%)",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer Metrics Breakdown - fully visible without clipping */}
      <div className="w-full grid grid-cols-3 gap-2.5 pt-3.5 mt-1 border-t border-white/5 text-center flex-shrink-0">
        <div className="squircle-md bg-[#18181b]/90 p-2 sm:p-2.5 border border-white/5 transition-colors">
          <span className="text-[10px] text-zinc-400 block uppercase font-medium">Done</span>
          <span className="text-sm font-semibold text-emerald-400 mt-0.5 block">{completed}</span>
        </div>
        <div className="squircle-md bg-[#18181b]/90 p-2 sm:p-2.5 border border-white/5 transition-colors">
          <span className="text-[10px] text-zinc-400 block uppercase font-medium">Open</span>
          <span className="text-sm font-semibold text-[#0A6CFF] mt-0.5 block">{open}</span>
        </div>
        <div className="squircle-md bg-[#18181b]/90 p-2 sm:p-2.5 border border-white/5 transition-colors">
          <span className="text-[10px] text-zinc-400 block uppercase font-medium">Overdue</span>
          <span className={`text-sm font-semibold mt-0.5 block ${overdue > 0 ? "text-rose-400" : "text-zinc-400"}`}>
            {overdue}
          </span>
        </div>
      </div>
    </div>
  )
}
