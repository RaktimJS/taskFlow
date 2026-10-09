import React, { useState, useRef, useEffect } from "react"
import { Filter, ArrowUpDown, ChevronDown, Check, Calendar, RotateCcw } from "lucide-react"

export function Toolbar({
  priorityFilter = "all",
  onPriorityFilterChange,
  categoryFilter = "all",
  onCategoryFilterChange,
  categories = [],
  sortBy,
  onSortByChange,
  sortDirection,
  onToggleSortDirection,
}) {
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)

  const filterRef = useRef(null)
  const sortRef = useRef(null)

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false)
      }
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setSortOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Format today's date
  const formattedToday = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date())

  const sortOptions = [
    { id: "dueDate", label: "Due Date" },
    { id: "priority", label: "Priority" },
    { id: "createdAt", label: "Date Created" },
    { id: "title", label: "Alphabetical" },
  ]

  const priorityOptions = [
    { id: "all", label: "All Priorities" },
    { id: "high", label: "High Priority" },
    { id: "medium", label: "Medium Priority" },
    { id: "low", label: "Low Priority" },
  ]

  const isFilterActive = priorityFilter !== "all" || categoryFilter !== "all"
  const activeCategory = categories.find((c) => c.id === categoryFilter)

  // Filter button label computation
  const getFilterButtonLabel = () => {
    if (!isFilterActive) return "Filter"

    const parts = []
    if (priorityFilter !== "all") {
      parts.push(priorityFilter.charAt(0).toUpperCase() + priorityFilter.slice(1))
    }
    if (categoryFilter !== "all") {
      parts.push(activeCategory ? activeCategory.name : "Uncategorized")
    }
    return `Filter: ${parts.join(" · ")}`
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 pb-1 border-t border-white/5 text-xs text-zinc-400">
      {/* Controls on the left: Filter & Sort */}
      <div className="flex items-center gap-2">
        {/* Filter Dropdown (Priority + Category) */}
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => {
              setFilterOpen(!filterOpen)
              setSortOpen(false)
            }}
            aria-expanded={filterOpen}
            aria-haspopup="true"
            className={`squircle-md flex items-center gap-1.5 px-3 py-1.5 border transition-all duration-200 ${
              isFilterActive
                ? "bg-[#0A6CFF]/15 text-[#3b82f6] border-[#0A6CFF]/30 font-medium"
                : "bg-[#18181b] hover:bg-[#222226] text-zinc-300 border-white/10"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span className="max-w-[170px] truncate">{getFilterButtonLabel()}</span>
            <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
          </button>

          {filterOpen && (
            <div className="squircle-lg absolute left-0 top-full mt-1.5 w-52 bg-[#1c1c1f] border border-white/10 shadow-2xl py-2 z-30 animate-smooth-pop max-h-80 overflow-y-auto">
              {/* Section 1: Priority */}
              <div className="px-3 py-1 text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">
                Filter by Priority
              </div>
              {priorityOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    onPriorityFilterChange(opt.id)
                  }}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-left text-zinc-300 hover:text-white hover:bg-white/5 transition-colors duration-150"
                >
                  <span>{opt.label}</span>
                  {priorityFilter === opt.id && (
                    <Check className="w-3.5 h-3.5 text-[#0A6CFF]" />
                  )}
                </button>
              ))}

              {/* Section 2: Category */}
              <div className="border-t border-white/5 my-1.5" />
              <div className="px-3 py-1 text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">
                Filter by Category
              </div>

              {/* All categories option */}
              <button
                onClick={() => {
                  onCategoryFilterChange?.("all")
                }}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-left text-zinc-300 hover:text-white hover:bg-white/5 transition-colors duration-150"
              >
                <span>All Categories</span>
                {categoryFilter === "all" && (
                  <Check className="w-3.5 h-3.5 text-[#0A6CFF]" />
                )}
              </button>

              {/* Uncategorized option */}
              <button
                onClick={() => {
                  onCategoryFilterChange?.("uncategorized")
                }}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-left text-zinc-300 hover:text-white hover:bg-white/5 transition-colors duration-150"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-zinc-600" />
                  <span>Uncategorized</span>
                </div>
                {categoryFilter === "uncategorized" && (
                  <Check className="w-3.5 h-3.5 text-[#0A6CFF]" />
                )}
              </button>

              {/* User categories */}
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    onCategoryFilterChange?.(cat.id)
                  }}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-left text-zinc-300 hover:text-white hover:bg-white/5 transition-colors duration-150"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="truncate">{cat.name}</span>
                  </div>
                  {categoryFilter === cat.id && (
                    <Check className="w-3.5 h-3.5 text-[#0A6CFF] flex-shrink-0" />
                  )}
                </button>
              ))}

              {/* Reset option if active */}
              {isFilterActive && (
                <div className="border-t border-white/5 mt-1.5 pt-1">
                  <button
                    onClick={() => {
                      onPriorityFilterChange("all")
                      onCategoryFilterChange?.("all")
                      setFilterOpen(false)
                    }}
                    className="w-full px-3 py-1.5 text-xs text-left text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset All Filters</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="relative" ref={sortRef}>
          <button
            onClick={() => {
              setSortOpen(!sortOpen)
              setFilterOpen(false)
            }}
            aria-expanded={sortOpen}
            aria-haspopup="true"
            className="squircle-md flex items-center gap-1.5 px-3 py-1.5 bg-[#18181b] hover:bg-[#222226] text-zinc-300 border border-white/10 transition-all duration-200"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>
              Sort: {sortOptions.find((s) => s.id === sortBy)?.label || "Due Date"}
            </span>
            <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
          </button>

          {sortOpen && (
            <div className="squircle-lg absolute left-0 top-full mt-1.5 w-48 bg-[#1c1c1f] border border-white/10 shadow-2xl py-1.5 z-30 animate-smooth-pop">
              <div className="px-3 py-1 text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">
                Sort Options
              </div>
              {sortOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    onSortByChange(opt.id)
                    setSortOpen(false)
                  }}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-left text-zinc-300 hover:text-white hover:bg-white/5 transition-colors duration-150"
                >
                  <span>{opt.label}</span>
                  {sortBy === opt.id && (
                    <Check className="w-3.5 h-3.5 text-[#0A6CFF]" />
                  )}
                </button>
              ))}
              <div className="border-t border-white/5 mt-1 pt-1">
                <button
                  onClick={() => {
                    onToggleSortDirection()
                    setSortOpen(false)
                  }}
                  className="w-full px-3 py-1.5 text-xs text-left text-zinc-400 hover:text-zinc-200 hover:bg-white/5 flex items-center justify-between transition-colors"
                >
                  <span>Order: {sortDirection === "asc" ? "Ascending" : "Descending"}</span>
                  <span className="text-[10px] text-zinc-500">Toggle</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right side: Created on date */}
      <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
        <Calendar className="w-3.5 h-3.5 text-zinc-500" />
        <span>
          Created on: <span className="text-zinc-200 font-medium">{formattedToday}</span>
        </span>
      </div>
    </div>
  )
}
