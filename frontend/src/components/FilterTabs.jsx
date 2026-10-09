import React from "react"

export function FilterTabs({
  currentFilter,
  onFilterChange,
  counts,
}) {
  const tabs = [
    { id: "all", label: "All", count: counts.total },
    { id: "open", label: "Open", count: counts.open },
    { id: "done", label: "Done", count: counts.completed },
  ]

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Status Tabs */}
      <div
        role="tablist"
        aria-label="Filter tasks by status"
        className="flex items-center gap-1.5 p-1 bg-[#141416]/60 border border-white/5 squircle-lg w-fit"
      >
        {tabs.map((tab) => {
          const isActive = currentFilter === tab.id
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => onFilterChange(tab.id)}
              className={`squircle-md relative flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] outline-none focus-visible:ring-2 focus-visible:ring-[#0A6CFF] ${
                isActive
                  ? "bg-[#0A6CFF]/20 text-white border border-[#0A6CFF]/40 shadow-sm shadow-[#0A6CFF]/10 font-semibold"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[11px] px-1.5 py-0.2 squircle-sm font-semibold transition-all duration-250 ${
                  isActive
                    ? "bg-[#0A6CFF] text-white scale-105"
                    : "bg-white/10 text-zinc-400 scale-100"
                }`}
              >
                {tab.count}
              </span>
              {isActive && (
                <span className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-3 h-[2px] bg-[#0A6CFF] rounded-full shadow-[0_0_8px_#0A6CFF] transition-all duration-300" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
