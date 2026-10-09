import React, { useState, useRef, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Maximize2, Calendar as CalendarIcon, Clock } from "lucide-react"
import {
  getMonthName,
  getCalendarMonthDays,
  getTasksForDate,
  getUpcomingDeadlines,
  formatFriendlyDate,
} from "../lib/dateUtils"
import { isOverdue } from "../lib/taskStore"

export function CalendarPreview({ tasks, onOpenExpanded }) {
  const cardRef = useRef(null)
  const today = new Date()

  // Track currently viewed month/year in preview
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [slideDirection, setSlideDirection] = useState(0)
  const [hoveredCell, setHoveredCell] = useState(null)
  const hideTimeoutRef = useRef(null)

  // Clear hide timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
    }
  }, [])

  // Prev / next month navigation without triggering expand
  const handlePrevMonth = (e) => {
    e.stopPropagation()
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }
    setHoveredCell(null)
    setSlideDirection(-1)
    setViewMonth((prev) => {
      if (prev === 0) {
        setViewYear((y) => y - 1)
        return 11
      }
      return prev - 1
    })
  }

  const handleNextMonth = (e) => {
    e.stopPropagation()
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }
    setHoveredCell(null)
    setSlideDirection(1)
    setViewMonth((prev) => {
      if (prev === 11) {
        setViewYear((y) => y + 1)
        return 0
      }
      return prev + 1
    })
  }

  const handleCellMouseEnter = (cell, cellTasks, e) => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }

    if (!cellTasks || cellTasks.length === 0) {
      // If moving from a date with tasks to a date with NO tasks, close smoothly
      hideTimeoutRef.current = setTimeout(() => {
        setHoveredCell(null)
      }, 150)
      return
    }

    const cellEl = e.currentTarget
    const cardEl = cardRef.current
    if (!cellEl || !cardEl) return

    const cellRect = cellEl.getBoundingClientRect()
    const cardRect = cardEl.getBoundingClientRect()

    // Determine primary priority: high > medium > low
    let primaryPriority = "low"
    if (cellTasks.some((t) => t.priority === "high")) {
      primaryPriority = "high"
    } else if (cellTasks.some((t) => t.priority === "medium")) {
      primaryPriority = "medium"
    }

    setHoveredCell({
      cell,
      tasks: cellTasks,
      primaryPriority,
      x: cellRect.left - cardRect.left + cellRect.width / 2,
      y: cellRect.top - cardRect.top,
      cellHeight: cellRect.height,
      cellWidth: cellRect.width,
    })
  }

  const handleCellMouseLeave = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
    }
    hideTimeoutRef.current = setTimeout(() => {
      setHoveredCell(null)
    }, 220)
  }

  const handleBoxMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }
  }

  const handleBoxMouseLeave = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
    }
    hideTimeoutRef.current = setTimeout(() => {
      setHoveredCell(null)
    }, 220)
  }

  // Two-finger touchpad horizontal swipe support on the preview widget
  useEffect(() => {
    const cardEl = cardRef.current
    if (!cardEl) return

    let lastSwipe = 0
    const handleWheel = (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 22) {
        const now = Date.now()
        if (now - lastSwipe < 450) return
        lastSwipe = now

        if (e.deltaX > 0) {
          setSlideDirection(1)
          setViewMonth((prev) => {
            if (prev === 11) {
              setViewYear((y) => y + 1)
              return 0
            }
            return prev + 1
          })
        } else if (e.deltaX < 0) {
          setSlideDirection(-1)
          setViewMonth((prev) => {
            if (prev === 0) {
              setViewYear((y) => y - 1)
              return 11
            }
            return prev - 1
          })
        }
      }
    }

    cardEl.addEventListener("wheel", handleWheel, { passive: true })
    return () => cardEl.removeEventListener("wheel", handleWheel)
  }, [])

  // Calculate month grid days
  const monthDays = useMemo(() => {
    return getCalendarMonthDays(viewYear, viewMonth)
  }, [viewYear, viewMonth])

  // Upcoming 3 deadlines from tasks
  const upcomingTasks = useMemo(() => {
    return getUpcomingDeadlines(tasks, 3)
  }, [tasks])

  // Open full calendar modal passing origin bounding rect
  const handleCardClick = () => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect()
      onOpenExpanded(rect, { year: viewYear, month: viewMonth })
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault()
      e.stopPropagation()
      handlePrevMonth(e)
    } else if (e.key === "ArrowRight") {
      e.preventDefault()
      e.stopPropagation()
      handleNextMonth(e)
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      handleCardClick()
    }
  }

  // Priority color styling
  const priorityDotColors = {
    high: "bg-rose-500",
    medium: "bg-amber-500",
    low: "bg-emerald-500",
  }

  const priorityBadgeStyles = {
    high: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    low: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  }

  const weekHeaders = ["M", "T", "W", "T", "F", "S", "S"]

  return (
    <div
      ref={cardRef}
      id="calendar-preview-widget"
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      aria-label={`Calendar ${getMonthName(viewMonth)} ${viewYear}. Press Enter to expand.`}
      className="theme-card squircle-2xl p-5 sm:p-6 cursor-pointer group relative overflow-visible transition-all duration-300 hover:border-white/20 hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A6CFF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141416] w-full z-20"
    >
      {/* Background glow on hover bounded to squircle */}
      <div className="absolute inset-0 squircle-2xl overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-36 h-36 bg-[#0A6CFF]/5 group-hover:bg-[#0A6CFF]/10 filter blur-2xl transition-all duration-300" />
      </div>

      {/* Header Row */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 squircle-md bg-[#0A6CFF]/15 border border-[#0A6CFF]/25 flex items-center justify-center text-[#0A6CFF]">
            <CalendarIcon className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="overflow-hidden h-6 flex items-center">
              <AnimatePresence mode="popLayout" custom={slideDirection} initial={false}>
                <motion.h3
                  key={`${viewYear}-${viewMonth}`}
                  custom={slideDirection}
                  variants={{
                    enter: (dir) => ({ y: dir > 0 ? 12 : dir < 0 ? -12 : 0, opacity: 0 }),
                    center: { y: 0, opacity: 1 },
                    exit: (dir) => ({ y: dir > 0 ? -12 : dir < 0 ? 12 : 0, opacity: 0 }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="text-base font-medium text-white group-hover:text-white transition-colors"
                >
                  {getMonthName(viewMonth)} {viewYear}
                </motion.h3>
              </AnimatePresence>
            </div>
            <p className="text-[11px] text-zinc-400">Click to expand full view</p>
          </div>
        </div>

        {/* Action Controls: Month Prev/Next & Expand icon hint */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            aria-label="Previous month in preview"
            className="squircle-sm p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            aria-label="Next month in preview"
            className="squircle-sm p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <div
            title="Expand to full calendar"
            className="squircle-sm p-1.5 text-zinc-500 group-hover:text-[#0A6CFF] group-hover:bg-[#0A6CFF]/10 transition-all duration-200 ml-1"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Weekday headers (Monday start - stationary) */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1 flex-shrink-0">
        {weekHeaders.map((day, idx) => (
          <span
            key={idx}
            className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider py-0.5"
          >
            {day}
          </span>
        ))}
      </div>

      {/* Compact Month Grid with Smooth Directional Slide */}
      <div className="relative overflow-hidden min-h-[175px]">
        <AnimatePresence mode="popLayout" custom={slideDirection} initial={false}>
          <motion.div
            key={`${viewYear}-${viewMonth}`}
            custom={slideDirection}
            variants={{
              enter: (dir) => ({
                x: dir > 0 ? 48 : dir < 0 ? -48 : 0,
                opacity: 0,
              }),
              center: {
                x: 0,
                opacity: 1,
                transition: {
                  x: { type: "tween", duration: 0.28, ease: [0.16, 1, 0.3, 1] },
                  opacity: { duration: 0.22, ease: "easeOut" },
                },
              },
              exit: (dir) => ({
                x: dir > 0 ? -48 : dir < 0 ? 48 : 0,
                opacity: 0,
                transition: {
                  x: { type: "tween", duration: 0.22, ease: [0.16, 1, 0.3, 1] },
                  opacity: { duration: 0.18, ease: "easeIn" },
                },
              }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            className="grid grid-cols-7 gap-1 text-center w-full"
          >
            {monthDays.map((cell) => {
              const dayTasks = getTasksForDate(tasks, cell.dateString)
              const hasTasks = dayTasks.length > 0

              return (
                <div
                  key={cell.dateString}
                  onMouseEnter={(e) => handleCellMouseEnter(cell, dayTasks, e)}
                  onMouseLeave={handleCellMouseLeave}
                  className={`h-7 flex flex-col items-center justify-center squircle-sm transition-all duration-150 relative ${
                    hasTasks ? "cursor-pointer hover:ring-2 hover:ring-white/20" : ""
                  } ${
                    cell.isToday
                      ? "bg-[#0A6CFF] text-white font-bold shadow-sm shadow-[#0A6CFF]/30"
                      : cell.isCurrentMonth
                      ? "text-zinc-200 hover:bg-white/5"
                      : "text-zinc-600 opacity-40"
                  }`}
                >
                  <span className="text-[11px] leading-none">{cell.dayNumber}</span>

                  {/* Coloured dots for tasks due */}
                  {hasTasks && (
                    <div className="flex items-center justify-center gap-0.5 mt-0.5 max-w-[20px]">
                      {dayTasks.slice(0, 3).map((t, idx) => (
                        <span
                          key={idx}
                          className={`w-1 h-1 rounded-full ${
                            cell.isToday ? "bg-white" : priorityDotColors[t.priority] || "bg-zinc-400"
                          }`}
                        />
                      ))}
                      {dayTasks.length > 3 && (
                        <span className={`text-[7px] font-bold ${cell.isToday ? "text-white" : "text-zinc-400"}`}>
                          +
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Hover Box for Task Deadlines: Points directly towards hovered date */}
      <AnimatePresence>
        {hoveredCell && (() => {
          // If the date cell is near the top of the card (< 120px from card top), position box below the cell with arrow pointing UP.
          // Otherwise, position box above the cell with arrow pointing DOWN.
          const isNearTop = hoveredCell.y < 120

          // Anchor box horizontally so the pointer arrow aligns dead-center with hovered date (hoveredCell.x)
          const boxLeft = Math.max(8, hoveredCell.x - 32)
          const arrowLeft = hoveredCell.x - boxLeft

          const priorityConfig = {
            high: {
              bg: "bg-rose-600 text-white border-2 border-rose-300 shadow-rose-950/90",
              fill: "#e11d48",
              badge: "bg-black/30 text-white",
            },
            medium: {
              bg: "bg-[#facc15] text-zinc-950 border-2 border-amber-200 shadow-amber-950/80",
              fill: "#facc15",
              badge: "bg-black/15 text-zinc-950 font-extrabold",
            },
            low: {
              bg: "bg-emerald-600 text-white border-2 border-emerald-300 shadow-emerald-950/90",
              fill: "#059669",
              badge: "bg-black/30 text-white",
            },
          }

          const currentConfig = priorityConfig[hoveredCell.primaryPriority] || priorityConfig.low

          return (
            <div
              style={{
                position: "absolute",
                left: `${boxLeft}px`,
                top: isNearTop
                  ? `${hoveredCell.y + hoveredCell.cellHeight + 8}px`
                  : `${hoveredCell.y - 8}px`,
                transform: isNearTop ? "none" : "translateY(-100%)",
                zIndex: 80,
              }}
              onMouseEnter={handleBoxMouseEnter}
              onMouseLeave={handleBoxMouseLeave}
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto"
            >
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.88,
                  y: isNearTop ? -6 : 6,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.88,
                  y: isNearTop ? -4 : 4,
                }}
                transition={{
                  type: "spring",
                  stiffness: 450,
                  damping: 26,
                  mass: 0.6,
                }}
                className={`squircle-xl p-3 min-w-[180px] max-w-[260px] shadow-2xl flex flex-col gap-1.5 relative ${currentConfig.bg}`}
              >
                {/* Precision Pointer Arrow pointing directly towards the date */}
                <svg
                  width="16"
                  height="8"
                  viewBox="0 0 16 8"
                  style={{ left: `${arrowLeft}px` }}
                  className={`absolute -translate-x-1/2 pointer-events-none ${
                    isNearTop ? "-top-[8px]" : "-bottom-[8px]"
                  }`}
                >
                  {isNearTop ? (
                    /* Box is below date: Arrow at top of box points UP directly into date cell */
                    <polygon points="8,0 16,8 0,8" fill={currentConfig.fill} />
                  ) : (
                    /* Box is above date: Arrow at bottom of box points DOWN directly into date cell */
                    <polygon points="0,0 16,0 8,8" fill={currentConfig.fill} />
                  )}
                </svg>

                {/* Task list and priority badge */}
                <div className="flex flex-col gap-2">
                  {hoveredCell.tasks.map((task) => (
                    <div key={task.id} className="flex flex-col">
                      <span className="text-xs font-bold leading-snug line-clamp-2">
                        {task.title}
                      </span>
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <span
                          className={`text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 squircle-xs ${currentConfig.badge}`}
                        >
                          {task.priority} Priority
                        </span>
                        {task.category && (
                          <span className="text-[10px] font-semibold opacity-90 truncate max-w-[90px]">
                            {task.category}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )
        })()}
      </AnimatePresence>

      {/* Upcoming Deadlines Section */}
      <div className="mt-4 pt-3 border-t border-white/5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] uppercase font-semibold text-zinc-400 tracking-wider">
            Upcoming Deadlines
          </span>
          <span className="text-[10px] text-zinc-500">Next 3</span>
        </div>

        {upcomingTasks.length === 0 ? (
          <p className="text-xs text-zinc-500 italic py-1 text-center">
            No upcoming deadlines
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {upcomingTasks.map((task) => {
              const overdue = isOverdue(task.dueDate, task.completed)
              return (
                <div
                  key={task.id}
                  className="squircle-md flex items-center justify-between gap-2 p-2 bg-[#18181b]/80 border border-white/5 text-xs transition-colors hover:border-white/10"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        priorityDotColors[task.priority] || "bg-zinc-400"
                      }`}
                    />
                    <span className="text-zinc-200 truncate font-medium text-[11px] sm:text-xs">
                      {task.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 squircle-sm border ${
                        overdue
                          ? "bg-rose-500/20 text-rose-300 border-rose-500/40 font-semibold"
                          : "bg-white/5 text-zinc-300 border-white/10"
                      }`}
                    >
                      {formatFriendlyDate(task.dueDate)}
                    </span>
                    <span
                      className={`text-[9px] uppercase px-1.5 py-0.2 squircle-sm border font-semibold ${
                        priorityBadgeStyles[task.priority]
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
