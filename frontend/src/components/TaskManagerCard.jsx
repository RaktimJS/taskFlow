import React, { useState } from "react"
import { Plus, ChevronDown, Check, CalendarDays } from "lucide-react"
import { FilterTabs } from "./FilterTabs"
import { Toolbar } from "./Toolbar"
import { TaskList } from "./TaskList"

export function TaskManagerCard({
  tasks,
  totalTasksCount,
  counts,
  currentFilter,
  onFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  categories,
  _isTabHeld = false,
  timeFilter,
  onTimeFilterChange,
  sortBy,
  onSortByChange,
  sortDirection,
  onToggleSortDirection,
  onToggleTask,
  onDeleteTask,
  onOpenNewTask,
}) {
  const [viewDropdownOpen, setViewDropdownOpen] = useState(false)

  const timeOptions = [
    { id: "all", label: "All Tasks" },
    { id: "week", label: "Due This Week" },
    { id: "today", label: "Due Today" },
    { id: "overdue", label: "Overdue Only" },
  ]

  const currentLabel = timeOptions.find((t) => t.id === timeFilter)?.label || "All Tasks"

  return (
    <div className="theme-card squircle-2xl p-5 sm:p-7 relative overflow-hidden transition-all duration-300 h-full flex flex-col justify-between">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 flex-shrink-0">
        <div>
          <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
            Task Manager
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Organize priorities, deadlines, and milestone deliverables
          </p>
        </div>

        {/* Top Controls: Timeframe Selector & New Task Button */}
        <div className="flex items-center gap-3">
          {/* Functional Time Filter Dropdown (replaces dummy Week dropdown) */}
          <div className="relative">
            <button
              onClick={() => setViewDropdownOpen(!viewDropdownOpen)}
              className="squircle-md flex items-center gap-2 px-3 py-2 text-xs font-medium bg-[#141416]/80 hover:bg-[#232328] text-zinc-300 border border-white/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0A6CFF]"
            >
              <CalendarDays className="w-3.5 h-3.5 text-zinc-400" />
              <span>{currentLabel}</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            {viewDropdownOpen && (
              <div className="squircle-lg absolute right-0 top-full mt-1.5 w-44 bg-[#1c1c1f] border border-white/10 shadow-2xl py-1.5 z-40 animate-smooth-pop">
                {timeOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      onTimeFilterChange(opt.id)
                      setViewDropdownOpen(false)
                    }}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-left text-zinc-300 hover:text-white hover:bg-white/5 transition-colors duration-150"
                  >
                    <span>{opt.label}</span>
                    {timeFilter === opt.id && <Check className="w-3.5 h-3.5 text-[#0A6CFF]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Vibrant Blue "New Task" button */}
          <button
            onClick={onOpenNewTask}
            className="squircle-md flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#0A6CFF] hover:bg-[#005ae0] active:bg-[#004dc0] shadow-lg shadow-[#0A6CFF]/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0A6CFF] focus:ring-offset-2 focus:ring-offset-[#141416]"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="mb-4 flex-shrink-0">
        <FilterTabs
          currentFilter={currentFilter}
          onFilterChange={onFilterChange}
          counts={counts}
        />
      </div>

      {/* Toolbar Row */}
      <div className="flex-shrink-0">
        <Toolbar
          priorityFilter={priorityFilter}
          onPriorityFilterChange={onPriorityFilterChange}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={onCategoryFilterChange}
          categories={categories}
          sortBy={sortBy}
          onSortByChange={onSortByChange}
          sortDirection={sortDirection}
          onToggleSortDirection={onToggleSortDirection}
        />
      </div>

      {/* Tasks List - Flex expands to match exact height of side column */}
      <TaskList
        tasks={tasks}
        totalTasksCount={totalTasksCount}
        currentFilter={currentFilter}
        onToggleTask={onToggleTask}
        onDeleteTask={onDeleteTask}
        onOpenNewTask={onOpenNewTask}
      />
    </div>
  )
}
