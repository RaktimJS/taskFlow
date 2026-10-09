import React, { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronLeft,
  ChevronRight,
  X,
  Calendar as CalendarIcon,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react"
import {
  getMonthName,
  getCalendarMonthDays,
  formatDateString,
} from "../lib/dateUtils"
import { CalendarGrid } from "./CalendarGrid"
import { DayTasksPanel } from "./DayTasksPanel"

export function CalendarModal({
  isOpen,
  onClose,
  originRect,
  getLatestCardRect,
  initialYear,
  initialMonth,
  tasks,
  onToggleTask,
  onDeleteTask,
  onOpenNewTaskWithDate,
}) {
  const modalRef = useRef(null)
  const previousActiveElement = useRef(null)
  const lastSwipeTime = useRef(0)

  const today = new Date()
  const todayDateString = formatDateString(today)

  // Track calendar view mode: 'days' | 'years' | 'months'
  const [calendarView, setCalendarView] = useState("days")

  // Track calendar navigation
  const [viewYear, setViewYear] = useState(initialYear ?? today.getFullYear())
  const [viewMonth, setViewMonth] = useState(initialMonth ?? today.getMonth())
  const [selectedDate, setSelectedDate] = useState(todayDateString)
  const [isAnimationComplete, setIsAnimationComplete] = useState(false)
  const [slideDirection, setSlideDirection] = useState(0)

  // Decade pagination for years view (12 years per view)
  const [decadeStart, setDecadeStart] = useState(() => Math.floor((initialYear ?? today.getFullYear()) / 12) * 12)

  // Check prefers-reduced-motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
      setPrefersReducedMotion(mediaQuery.matches)
      const handler = (e) => setPrefersReducedMotion(e.matches)
      mediaQuery.addEventListener("change", handler)
      return () => mediaQuery.removeEventListener("change", handler)
    }
  }, [])

  // Sync initial month if changed
  useEffect(() => {
    if (isOpen) {
      if (initialYear !== undefined) {
        setViewYear(initialYear)
        setDecadeStart(Math.floor(initialYear / 12) * 12)
      }
      if (initialMonth !== undefined) setViewMonth(initialMonth)
      setCalendarView("days")
      setSlideDirection(0)
      previousActiveElement.current = document.activeElement
      setIsAnimationComplete(false)
    }
  }, [isOpen, initialYear, initialMonth])

  // Scroll lock and focus restoration
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = "hidden"

      setTimeout(() => {
        if (modalRef.current) {
          modalRef.current.focus()
        }
      }, 50)

      return () => {
        document.body.style.overflow = originalOverflow
        if (previousActiveElement.current && previousActiveElement.current.focus) {
          previousActiveElement.current.focus()
        }
      }
    }
  }, [isOpen])

  // Month navigation with directional slide tracking
  const handlePrevMonth = useCallback(() => {
    setSlideDirection(-1)
    setViewMonth((prev) => {
      if (prev === 0) {
        setViewYear((y) => y - 1)
        return 11
      }
      return prev - 1
    })
  }, [])

  const handleNextMonth = useCallback(() => {
    setSlideDirection(1)
    setViewMonth((prev) => {
      if (prev === 11) {
        setViewYear((y) => y + 1)
        return 0
      }
      return prev + 1
    })
  }, [])

  // Keyboard navigation: Escape to back/close, ArrowLeft/ArrowRight to switch months
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName
      const isInputFocused = ["INPUT", "TEXTAREA", "SELECT"].includes(activeTag)

      if (e.key === "Escape") {
        if (calendarView === "months") {
          setCalendarView("years")
        } else if (calendarView === "years") {
          setCalendarView("days")
        } else {
          onClose()
        }
      } else if (!isInputFocused && calendarView === "days") {
        if (e.key === "ArrowLeft") {
          e.preventDefault()
          handlePrevMonth()
        } else if (e.key === "ArrowRight") {
          e.preventDefault()
          handleNextMonth()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, calendarView, onClose, handlePrevMonth, handleNextMonth])

  const handleGoToday = useCallback(() => {
    setSlideDirection(0)
    setViewYear(today.getFullYear())
    setViewMonth(today.getMonth())
    setSelectedDate(todayDateString)
    setCalendarView("days")
  }, [todayDateString])

  // Touchpad two-finger horizontal swipe navigation
  useEffect(() => {
    if (!isOpen) return

    const handleWheel = (e) => {
      // Only switch months via horizontal swipe when looking at days grid
      if (calendarView !== "days") return

      // Dominant horizontal motion check
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 22) {
        const now = Date.now()
        if (now - lastSwipeTime.current < 450) {
          return // Cooldown to ensure single month switch per deliberate gesture
        }

        // Prompt specification:
        // "If I with my two fingers on my touchpad swipe right, next month should come, if left then previous month"
        if (e.deltaX > 0) {
          lastSwipeTime.current = now
          handleNextMonth()
        } else if (e.deltaX < 0) {
          lastSwipeTime.current = now
          handlePrevMonth()
        }
      }
    }

    // Touch screen swipe support for tablets/laptops
    let touchStartX = 0
    let touchStartY = 0

    const handleTouchStart = (e) => {
      if (e.touches && e.touches[0]) {
        touchStartX = e.touches[0].clientX
        touchStartY = e.touches[0].clientY
      }
    }

    const handleTouchEnd = (e) => {
      if (calendarView !== "days") return
      if (e.changedTouches && e.changedTouches[0]) {
        const deltaX = e.changedTouches[0].clientX - touchStartX
        const deltaY = e.changedTouches[0].clientY - touchStartY
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
          const now = Date.now()
          if (now - lastSwipeTime.current < 450) return
          lastSwipeTime.current = now
          // Swipe right -> next month; swipe left -> prev month
          if (deltaX > 0) {
            handleNextMonth()
          } else {
            handlePrevMonth()
          }
        }
      }
    }

    const modalEl = modalRef.current
    if (modalEl) {
      modalEl.addEventListener("wheel", handleWheel, { passive: true })
      modalEl.addEventListener("touchstart", handleTouchStart, { passive: true })
      modalEl.addEventListener("touchend", handleTouchEnd, { passive: true })
    }

    return () => {
      if (modalEl) {
        modalEl.removeEventListener("wheel", handleWheel)
        modalEl.removeEventListener("touchstart", handleTouchStart)
        modalEl.removeEventListener("touchend", handleTouchEnd)
      }
    }
  }, [isOpen, calendarView, handleNextMonth, handlePrevMonth])

  // Calculate days for current view
  const monthDays = useMemo(() => {
    return getCalendarMonthDays(viewYear, viewMonth)
  }, [viewYear, viewMonth])

  // Memoize tasks grouped by date for O(1) cell lookup
  const tasksByDate = useMemo(() => {
    const map = {}
    tasks.forEach((t) => {
      if (t.dueDate) {
        if (!map[t.dueDate]) map[t.dueDate] = []
        map[t.dueDate].push(t)
      }
    })
    return map
  }, [tasks])

  // Tasks for currently selected day
  const selectedDayTasks = useMemo(() => {
    return tasksByDate[selectedDate] || []
  }, [tasksByDate, selectedDate])

  // 12 years array for years view
  const yearsList = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => decadeStart + i)
  }, [decadeStart])

  // Tasks count helper for a specific month
  const getTasksCountForMonth = useCallback(
    (year, monthIdx) => {
      const monthPrefix = `${year}-${String(monthIdx + 1).padStart(2, "0")}`
      return tasks.filter((t) => t.dueDate && t.dueDate.startsWith(monthPrefix)).length
    },
    [tasks]
  )

  // Tasks count helper for a specific year
  const getTasksCountForYear = useCallback(
    (year) => {
      const yearPrefix = `${year}-`
      return tasks.filter((t) => t.dueDate && t.dueDate.startsWith(yearPrefix)).length
    },
    [tasks]
  )

  if (!isOpen) return null

  // Fixed viewport geometry for expanded modal
  const windowWidth = typeof window !== "undefined" ? window.innerWidth : 1200
  const windowHeight = typeof window !== "undefined" ? window.innerHeight : 800
  const targetWidth = Math.min(windowWidth * 0.92, 1100)
  const targetHeight = Math.min(windowHeight * 0.86, 760)
  const targetLeft = (windowWidth - targetWidth) / 2
  const targetTop = (windowHeight - targetHeight) / 2

  // Measured card rect at open and close
  const origin = (getLatestCardRect ? getLatestCardRect() : null) || originRect || {
    left: targetLeft,
    top: targetTop,
    width: targetWidth * 0.5,
    height: targetHeight * 0.5,
  }

  // Pure FLIP calculations: animate ONLY transform (translate + scale) and opacity
  const initialScaleX = origin.width / targetWidth
  const initialScaleY = origin.height / targetHeight
  const initialTranslateX = origin.left + origin.width / 2 - (targetLeft + targetWidth / 2)
  const initialTranslateY = origin.top + origin.height / 2 - (targetTop + targetHeight / 2)

  const panelVariants = {
    initial: prefersReducedMotion
      ? { opacity: 0 }
      : {
          x: initialTranslateX,
          y: initialTranslateY,
          scaleX: initialScaleX,
          scaleY: initialScaleY,
          opacity: 0.85,
        },
    animate: {
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      transition: {
        duration: prefersReducedMotion ? 0.15 : 0.45,
        ease: [0.32, 0.72, 0, 1],
      },
    },
    exit: () => {
      const exitOrigin = (getLatestCardRect ? getLatestCardRect() : null) || origin
      const exitScaleX = exitOrigin.width / targetWidth
      const exitScaleY = exitOrigin.height / targetHeight
      const exitTranslateX = exitOrigin.left + exitOrigin.width / 2 - (targetLeft + targetWidth / 2)
      const exitTranslateY = exitOrigin.top + exitOrigin.height / 2 - (targetTop + targetHeight / 2)

      return prefersReducedMotion
        ? { opacity: 0, transition: { duration: 0.15 } }
        : {
            x: exitTranslateX,
            y: exitTranslateY,
            scaleX: exitScaleX,
            scaleY: exitScaleY,
            opacity: 0,
            transition: {
              duration: 0.35,
              ease: [0.32, 0.72, 0, 1],
            },
          }
    },
  }

  // Smooth step transitions between views (days <-> years <-> months)
  const viewStepVariants = {
    initial: { opacity: 0, scale: 0.97, y: 4 },
    animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, scale: 0.97, y: -4, transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] } },
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="calendar-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Plain dark backdrop: animate ONLY opacity, NO backdrop-filter / blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 z-40"
      />

      {/* Main Expanded Panel: animates ONLY transform & opacity */}
      <motion.div
        ref={modalRef}
        tabIndex={-1}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={panelVariants}
        onAnimationComplete={() => setIsAnimationComplete(true)}
        style={{
          position: "fixed",
          top: targetTop,
          left: targetLeft,
          width: targetWidth,
          height: targetHeight,
          willChange: isAnimationComplete ? "auto" : "transform, opacity",
          transform: "translateZ(0)",
        }}
        className="theme-card squircle-2xl border border-white/15 shadow-2xl flex flex-col overflow-hidden outline-none bg-[#18181b] z-50"
      >
        {/* Inner Content: Crossfade opacity (starts ~150ms into animation) without scaling text/cells */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            delay: prefersReducedMotion ? 0 : 0.15,
            duration: prefersReducedMotion ? 0.15 : 0.25,
            ease: "easeOut",
          }}
          className="flex flex-col h-full w-full"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-white/10 flex-shrink-0 bg-[#161619]">
            {/* Title & Navigation */}
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              <div className="w-9 h-9 squircle-md bg-[#0A6CFF]/15 border border-[#0A6CFF]/30 flex items-center justify-center text-[#0A6CFF] flex-shrink-0">
                <CalendarIcon className="w-4 h-4" />
              </div>

              {/* View-specific Header Titles & Selectors */}
              {calendarView === "days" && (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {/* Month button (clickable) with smooth roll animation */}
                  <button
                    type="button"
                    onClick={() => setCalendarView("months")}
                    title="Click to select month"
                    className="text-lg sm:text-xl font-semibold tracking-tight text-white hover:text-[#0A6CFF] px-2 py-0.5 squircle-md hover:bg-white/5 transition-colors flex items-center gap-1 overflow-hidden h-9"
                  >
                    <AnimatePresence mode="popLayout" custom={slideDirection} initial={false}>
                      <motion.span
                        key={`${viewYear}-${viewMonth}`}
                        custom={slideDirection}
                        variants={{
                          enter: (dir) => ({ y: dir > 0 ? 14 : dir < 0 ? -14 : 0, opacity: 0 }),
                          center: { y: 0, opacity: 1 },
                          exit: (dir) => ({ y: dir > 0 ? -14 : dir < 0 ? 14 : 0, opacity: 0 }),
                        }}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="inline-block"
                      >
                        {getMonthName(viewMonth)}
                      </motion.span>
                    </AnimatePresence>
                  </button>

                  {/* Year button (prominently clickable with blue tint) */}
                  <button
                    type="button"
                    onClick={() => {
                      setDecadeStart(Math.floor(viewYear / 12) * 12)
                      setCalendarView("years")
                    }}
                    title="Click to browse years"
                    className="text-lg sm:text-xl font-bold tracking-tight text-[#0A6CFF] hover:text-white px-2.5 py-0.5 squircle-md bg-[#0A6CFF]/10 hover:bg-[#0A6CFF] border border-[#0A6CFF]/30 transition-all shadow-sm"
                  >
                    <span>{viewYear}</span>
                  </button>
                </div>
              )}

              {calendarView === "years" && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCalendarView("days")}
                    className="squircle-sm flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                  <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-white">
                    Select Year ({decadeStart} – {decadeStart + 11})
                  </h2>
                </div>
              )}

              {calendarView === "months" && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCalendarView("years")}
                    className="squircle-sm flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Years</span>
                  </button>
                  <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-white flex items-center gap-2">
                    <span>Select Month in</span>
                    <span className="text-[#0A6CFF]">{viewYear}</span>
                  </h2>
                </div>
              )}

              {/* Prev / Next / Today Navigation (only active in days or years view) */}
              {calendarView === "days" && (
                <div className="flex items-center gap-1 ml-1 sm:ml-2">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    title="Previous month (or swipe left with 2 fingers)"
                    aria-label="Previous month"
                    className="squircle-sm p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    title="Next month (or swipe right with 2 fingers)"
                    aria-label="Next month"
                    className="squircle-sm p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleGoToday}
                    className="squircle-sm px-2.5 py-1 text-xs font-semibold bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 ml-1 transition-colors"
                  >
                    Today
                  </button>
                </div>
              )}

              {calendarView === "years" && (
                <div className="flex items-center gap-1 ml-1 sm:ml-2">
                  <button
                    type="button"
                    onClick={() => setDecadeStart((d) => d - 12)}
                    aria-label="Previous decade"
                    className="squircle-sm p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecadeStart((d) => d + 12)}
                    aria-label="Next decade"
                    className="squircle-sm p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Right: Legend & Close Button */}
            <div className="flex items-center justify-between sm:justify-end gap-4">
              {/* Priority Legend */}
              {calendarView === "days" && (
                <div className="hidden md:flex items-center gap-3 text-xs text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="text-[11px]">High</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-[11px]">Medium</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[11px]">Low</span>
                  </div>
                </div>
              )}

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close calendar"
                className="squircle-md p-2 text-zinc-400 hover:text-white bg-[#141416] hover:bg-[#25252a] border border-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0A6CFF]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Body with AnimatePresence between views */}
          <div className="flex-1 overflow-hidden relative flex flex-col min-h-0">
            <AnimatePresence mode="wait" initial={false}>
              
              {/* =========================================================================
                  STEP 1: YEARS SELECTION VIEW (Animated Grid of Years)
                  ========================================================================= */}
              {calendarView === "years" && (
                <motion.div
                  key="years-view"
                  variants={viewStepVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="flex-1 p-5 sm:p-8 flex flex-col justify-between overflow-y-auto"
                >
                  <div className="mb-3 text-center sm:text-left">
                    <p className="text-xs text-zinc-400">
                      Select a year to explore scheduled tasks and milestones
                    </p>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4 my-auto">
                    {yearsList.map((year) => {
                      const isSelected = viewYear === year
                      const isCurrentYear = today.getFullYear() === year
                      const taskCount = getTasksCountForYear(year)

                      return (
                        <button
                          key={year}
                          type="button"
                          onClick={() => {
                            setViewYear(year)
                            // Smoothly advance to Step 2: Months selection
                            setCalendarView("months")
                          }}
                          className={`squircle-xl p-4 sm:p-5 flex flex-col items-center justify-center gap-1.5 border transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-[#0A6CFF] ${
                            isSelected
                              ? "bg-[#0A6CFF] text-white border-[#0A6CFF] shadow-lg shadow-[#0A6CFF]/25 font-bold"
                              : "bg-[#18181b]/80 hover:bg-[#222227] border-white/5 hover:border-white/20 text-zinc-200"
                          }`}
                        >
                          <span className="text-xl sm:text-2xl tracking-tight">
                            {year}
                          </span>

                          <div className="flex items-center gap-1.5 mt-0.5">
                            {isCurrentYear && (
                              <span
                                className={`text-[10px] px-1.5 py-0.2 squircle-xs font-semibold ${
                                  isSelected ? "bg-white/20 text-white" : "bg-[#0A6CFF]/20 text-[#3b82f6]"
                                }`}
                              >
                                Current
                              </span>
                            )}
                            {taskCount > 0 && (
                              <span
                                className={`text-[10px] px-1.5 py-0.2 squircle-xs font-medium ${
                                  isSelected ? "bg-white/20 text-white" : "bg-white/5 text-zinc-400"
                                }`}
                              >
                                {taskCount} {taskCount === 1 ? "task" : "tasks"}
                              </span>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  <div className="pt-4 mt-2 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500">
                    <span>Decade {decadeStart} – {decadeStart + 11}</span>
                    <button
                      type="button"
                      onClick={() => setCalendarView("days")}
                      className="text-zinc-400 hover:text-white transition-colors"
                    >
                      Cancel and return to current month
                    </button>
                  </div>
                </motion.div>
              )}

              {/* =========================================================================
                  STEP 2: MONTHS SELECTION VIEW (Animated 12 Months of Selected Year)
                  ========================================================================= */}
              {calendarView === "months" && (
                <motion.div
                  key="months-view"
                  variants={viewStepVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="flex-1 p-5 sm:p-8 flex flex-col justify-between overflow-y-auto"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs text-zinc-400">
                      Select a month in <strong className="text-white">{viewYear}</strong> to load its calendar & tasks
                    </p>
                    <button
                      type="button"
                      onClick={() => setCalendarView("years")}
                      className="text-xs text-[#0A6CFF] hover:underline"
                    >
                      Change Year ({viewYear})
                    </button>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4 my-auto">
                    {Array.from({ length: 12 }, (_, monthIdx) => {
                      const monthName = getMonthName(monthIdx)
                      const isSelected = viewMonth === monthIdx
                      const isCurrentMonth = today.getFullYear() === viewYear && today.getMonth() === monthIdx
                      const taskCount = getTasksCountForMonth(viewYear, monthIdx)

                      return (
                        <button
                          key={monthIdx}
                          type="button"
                          onClick={() => {
                            setViewMonth(monthIdx)
                            // Smoothly advance to Step 3: Day calendar view
                            setCalendarView("days")
                          }}
                          className={`squircle-xl p-3.5 sm:p-4 flex flex-col items-center justify-center gap-1 border transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-[#0A6CFF] ${
                            isSelected
                              ? "bg-[#0A6CFF] text-white border-[#0A6CFF] shadow-lg shadow-[#0A6CFF]/25 font-bold"
                              : "bg-[#18181b]/80 hover:bg-[#222227] border-white/5 hover:border-white/20 text-zinc-200"
                          }`}
                        >
                          <span className="text-base sm:text-lg tracking-tight font-medium">
                            {monthName}
                          </span>

                          <div className="flex items-center gap-1.5 mt-0.5">
                            {isCurrentMonth && (
                              <span
                                className={`text-[10px] px-1.5 py-0.2 squircle-xs font-semibold ${
                                  isSelected ? "bg-white/20 text-white" : "bg-[#0A6CFF]/20 text-[#3b82f6]"
                                }`}
                              >
                                Current
                              </span>
                            )}
                            {taskCount > 0 && (
                              <span
                                className={`text-[10px] px-1.5 py-0.2 squircle-xs font-medium ${
                                  isSelected ? "bg-white/20 text-white" : "bg-white/5 text-zinc-400"
                                }`}
                              >
                                {taskCount} {taskCount === 1 ? "task" : "tasks"}
                              </span>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  <div className="pt-4 mt-2 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500">
                    <span>Year {viewYear}</span>
                    <button
                      type="button"
                      onClick={() => setCalendarView("days")}
                      className="text-zinc-400 hover:text-white transition-colors"
                    >
                      Return to Month Grid
                    </button>
                  </div>
                </motion.div>
              )}

              {/* =========================================================================
                  STEP 3: DAYS CALENDAR VIEW (Full Month Grid + Task Detail Drawer)
                  ========================================================================= */}
              {calendarView === "days" && (
                <motion.div
                  key="days-view"
                  variants={viewStepVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0"
                >
                  {/* Calendar Grid Container with smooth directional slide between months */}
                  <div className="flex-1 p-3 sm:p-5 overflow-y-auto overflow-x-hidden relative flex flex-col min-h-0">
                    <CalendarGrid
                      monthDays={monthDays}
                      tasksByDate={tasksByDate}
                      selectedDate={selectedDate}
                      onSelectDate={setSelectedDate}
                      slideDirection={slideDirection}
                      monthKey={`${viewYear}-${viewMonth}`}
                      prefersReducedMotion={prefersReducedMotion}
                    />
                  </div>

                  {/* Side Panel for Selected Day */}
                  <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 border-t lg:border-t-0 border-white/10">
                    <DayTasksPanel
                      selectedDate={selectedDate}
                      tasks={selectedDayTasks}
                      onToggleTask={onToggleTask}
                      onDeleteTask={onDeleteTask}
                    />
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
