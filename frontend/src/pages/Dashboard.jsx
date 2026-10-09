import React, { useState, useEffect, useMemo, useCallback } from "react"
import { AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import { useApp } from "../context/AppContext.jsx"
import { isOverdue } from "../lib/taskStore.js"
import { parseDateString } from "../lib/dateUtils.js"
import { Header } from "../components/Header.jsx"
import { TaskManagerCard } from "../components/TaskManagerCard.jsx"
import { ProgressRing } from "../components/ProgressRing.jsx"
import { SummaryCard } from "../components/SummaryCard.jsx"
import { CalendarPreview } from "../components/CalendarPreview.jsx"
import { CalendarModal } from "../components/CalendarModal.jsx"
import { TaskModal } from "../components/TaskModal.jsx"
import { Toast } from "../components/Toast.jsx"

export function Dashboard() {
  const {
    tasks,
    addTask,
    toggleTask,
    deleteTask,
    restoreTask,
    stats,
    streakData,
    categories,
  } = useApp()

  // UI state
  const [currentFilter, setCurrentFilter] = useState("all") // 'all' | 'open' | 'done'
  const [priorityFilter, setPriorityFilter] = useState("all") // 'all' | 'high' | 'medium' | 'low'
  const [categoryFilter, setCategoryFilter] = useState("all") // 'all' | 'uncategorized' | categoryId
  const [timeFilter, setTimeFilter] = useState("all") // 'all' | 'week' | 'today' | 'overdue'
  const [sortBy, setSortBy] = useState("dueDate") // 'dueDate' | 'priority' | 'createdAt' | 'title'
  const [sortDirection, setSortDirection] = useState("asc") // 'asc' | 'desc'
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalInitialDueDate, setModalInitialDueDate] = useState("")
  const [lastDeletedTask, setLastDeletedTask] = useState(null)
  const [toastTimeoutId, setToastTimeoutId] = useState(null)

  // Calendar expand state
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false)
  const [calendarOriginRect, setCalendarOriginRect] = useState(null)
  const [calendarInitialYear, setCalendarInitialYear] = useState(new Date().getFullYear())
  const [calendarInitialMonth, setCalendarInitialMonth] = useState(new Date().getMonth())

  // Dynamic origin rect getter (including when scrolled or sticky)
  const getLatestCardRect = useCallback(() => {
    if (typeof document === "undefined") return null
    const el = document.getElementById("calendar-preview-widget")
    return el ? el.getBoundingClientRect() : null
  }, [])

  // Open full calendar modal from clicked preview card rect
  const handleOpenCalendar = useCallback((rect, { year, month }) => {
    setCalendarOriginRect(rect)
    setCalendarInitialYear(year)
    setCalendarInitialMonth(month)
    setIsCalendarExpanded(true)
  }, [])

  const handleCloseCalendar = useCallback(() => {
    setIsCalendarExpanded(false)
  }, [])

  // Open New Task modal with pre-filled due date (from Calendar day click)
  const handleOpenNewTaskWithDate = useCallback((dateStr) => {
    setModalInitialDueDate(dateStr)
    setIsModalOpen(true)
  }, [])

  // Open New Task modal normally
  const handleOpenNewTask = useCallback(() => {
    setModalInitialDueDate("")
    setIsModalOpen(true)
  }, [])

  // Handle task completion toggle with celebration
  const handleToggle = useCallback(
    (id) => {
      const target = tasks.find((t) => t.id === id)
      toggleTask(id)

      if (target && !target.completed) {
        try {
          confetti({
            particleCount: 20,
            spread: 45,
            origin: { y: 0.82 },
            colors: ["#0A6CFF", "#60a5fa", "#ffffff"],
            disableForReducedMotion: true,
          })
        } catch {
          // fallback
        }
      }
    },
    [tasks, toggleTask]
  )

  // Handle delete with undo toast
  const handleDelete = useCallback(
    (id) => {
      const removed = deleteTask(id)
      if (removed) {
        if (toastTimeoutId) {
          clearTimeout(toastTimeoutId)
        }
        setLastDeletedTask(removed)
        const tid = setTimeout(() => {
          setLastDeletedTask(null)
        }, 5500)
        setToastTimeoutId(tid)
      }
    },
    [deleteTask, toastTimeoutId]
  )

  // Undo delete
  const handleUndo = useCallback(() => {
    if (lastDeletedTask) {
      restoreTask(lastDeletedTask)
      setLastDeletedTask(null)
      if (toastTimeoutId) {
        clearTimeout(toastTimeoutId)
      }
    }
  }, [lastDeletedTask, restoreTask, toastTimeoutId])

  // Dismiss toast
  const handleDismissToast = useCallback(() => {
    setLastDeletedTask(null)
    if (toastTimeoutId) {
      clearTimeout(toastTimeoutId)
    }
  }, [toastTimeoutId])

  // Sort direction toggle
  const handleToggleSortDirection = useCallback(() => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
  }, [])

  // Hold Tab key to show only High Priority tasks; release to go back to normal
  const [isTabHeld, setIsTabHeld] = useState(false)

  // Keyboard shortcut: Hold Tab key to filter High Priority tasks
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isModalOpen || isCalendarExpanded) return
      const activeTag = document.activeElement?.tagName
      if (["INPUT", "TEXTAREA", "SELECT"].includes(activeTag)) return

      if (e.key === "Tab" || e.code === "Tab") {
        e.preventDefault()
        e.stopPropagation()
        setIsTabHeld(true)
      }
    }

    const handleKeyUp = (e) => {
      if (e.key === "Tab" || e.code === "Tab") {
        e.preventDefault()
        e.stopPropagation()
        setIsTabHeld(false)
      }
    }

    const handleWindowBlur = () => {
      setIsTabHeld(false)
    }

    window.addEventListener("keydown", handleKeyDown, { capture: true })
    window.addEventListener("keyup", handleKeyUp, { capture: true })
    window.addEventListener("blur", handleWindowBlur)

    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true })
      window.removeEventListener("keyup", handleKeyUp, { capture: true })
      window.removeEventListener("blur", handleWindowBlur)
    }
  }, [isModalOpen, isCalendarExpanded])

  // Filtered and Sorted task list
  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks]

    // When Tab key is held down, ONLY tasks marked as high priority should be visible
    if (isTabHeld) {
      result = result.filter((t) => t.priority === "high")
    } else {
      // 1. Status Filter
      if (currentFilter === "open") {
        result = result.filter((t) => !t.completed)
      } else if (currentFilter === "done") {
        result = result.filter((t) => t.completed)
      }

      // 2. Priority Filter
      if (priorityFilter !== "all") {
        result = result.filter((t) => t.priority === priorityFilter)
      }

      // 3. Category Filter
      if (categoryFilter !== "all") {
        if (categoryFilter === "uncategorized") {
          result = result.filter((t) => !t.category)
        } else {
          result = result.filter((t) => t.category === categoryFilter)
        }
      }

      // 4. Time Filter
      if (timeFilter !== "all") {
        const now = new Date()
        now.setHours(0, 0, 0, 0)
        const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

        if (timeFilter === "today") {
          result = result.filter((t) => {
            if (!t.dueDate) return false
            const d = parseDateString(t.dueDate)
            if (!d) return false
            d.setHours(0, 0, 0, 0)
            return d.getTime() === now.getTime()
          })
        } else if (timeFilter === "week") {
          result = result.filter((t) => {
            if (!t.dueDate) return false
            const d = parseDateString(t.dueDate)
            if (!d) return false
            d.setHours(0, 0, 0, 0)
            return d.getTime() >= now.getTime() && d.getTime() <= oneWeekLater.getTime()
          })
        } else if (timeFilter === "overdue") {
          result = result.filter((t) => isOverdue(t.dueDate, t.completed))
        }
      }
    }

    // 5. Sorting
    const priorityWeight = { high: 3, medium: 2, low: 1 }

    result.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case "dueDate": {
          if (!a.dueDate && !b.dueDate) comparison = 0
          else if (!a.dueDate) comparison = 1
          else if (!b.dueDate) comparison = -1
          else {
            const da = parseDateString(a.dueDate)
            const db = parseDateString(b.dueDate)
            comparison = (da?.getTime() || 0) - (db?.getTime() || 0)
          }
          break
        }
        case "priority": {
          comparison = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0)
          break
        }
        case "createdAt": {
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          break
        }
        case "title": {
          comparison = a.title.localeCompare(b.title)
          break
        }
        default:
          comparison = 0
      }

      return sortDirection === "asc" ? comparison : -comparison
    })

    return result
  }, [tasks, currentFilter, priorityFilter, categoryFilter, timeFilter, sortBy, sortDirection, isTabHeld])

  return (
    <div className="min-h-screen bg-[#141416] text-[#e4e4e7] flex flex-col items-center justify-start py-6 px-3 sm:px-6 lg:px-8 animate-smooth-in">
      {/* Page Container: 1600px max width, centered */}
      <div className="w-full max-w-[1600px] flex flex-col gap-6">
        
        {/* App Header: 3-zone layout (Logo, StreakCard, ProfileCard) */}
        <Header
          stats={stats}
          streakData={streakData}
        />

        {/* 
          Dashboard Responsive Grid:
          - Desktop (>= 1280px, xl): 3 columns (LEFT: Calendar lowered slightly, CENTER: Task Manager, RIGHT: Gauge + Sprint)
          - Bottom line of Task Manager and Today's Sprint card aligned on the exact same level via xl:items-stretch
          - Tablet (768px - 1279px, md): 2 columns (Task Manager top full row, Calendar & Right cards side-by-side below)
          - Mobile (< 768px): 1 column (Task Manager, Calendar, Completion Gauge, Today's Sprint)
        */}
        <main className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[330px_minmax(0,1fr)_340px] gap-6 items-start xl:items-stretch">
          
          {/* LEFT COLUMN: Calendar preview card (lowered slightly with xl:mt-4, sticky, z-20 for hover overlay) */}
          <aside className="order-2 md:order-2 xl:order-1 xl:col-span-1 w-full xl:w-[330px] xl:sticky xl:top-10 self-start xl:mt-4 z-20">
            <CalendarPreview
              tasks={tasks}
              onOpenExpanded={handleOpenCalendar}
            />
          </aside>

          {/* CENTER COLUMN: Task Manager card (stretches to equalize bottom level with right column) */}
          <section className="order-1 md:order-1 md:col-span-2 xl:col-span-1 xl:order-2 flex flex-col min-w-0 w-full xl:h-full">
            <TaskManagerCard
              tasks={filteredAndSortedTasks}
              totalTasksCount={tasks.length}
              counts={stats}
              currentFilter={currentFilter}
              onFilterChange={setCurrentFilter}
              priorityFilter={priorityFilter}
              onPriorityFilterChange={setPriorityFilter}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
              categories={categories}
              isTabHeld={isTabHeld}
              timeFilter={timeFilter}
              onTimeFilterChange={setTimeFilter}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              sortDirection={sortDirection}
              onToggleSortDirection={handleToggleSortDirection}
              onToggleTask={handleToggle}
              onDeleteTask={handleDelete}
              onOpenNewTask={handleOpenNewTask}
            />
          </section>

          {/* RIGHT COLUMN: Sprint Velocity on top + Today's Sprint at bottom (ends on same level as Task Manager) */}
          <aside className="order-3 md:order-3 md:col-span-1 xl:col-span-1 xl:order-3 w-full xl:w-[340px] flex flex-col gap-6 xl:h-full xl:justify-between">
            {/* Completion Gauge Widget */}
            <div className="flex-shrink-0">
              <ProgressRing stats={stats} />
            </div>

            {/* Today's Sprint Summary Card (fills remainder so its bottom line matches Task Manager) */}
            <div className="flex-1 flex flex-col min-h-0">
              <SummaryCard stats={stats} />
            </div>
          </aside>
        </main>
      </div>

      {/* New Task Modal with smooth animation */}
      <AnimatePresence>
        {isModalOpen && (
          <TaskModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onAddTask={addTask}
            initialDueDate={modalInitialDueDate}
          />
        )}
      </AnimatePresence>

      {/* Zoom-in Full Calendar Modal */}
      <AnimatePresence>
        {isCalendarExpanded && (
          <CalendarModal
            isOpen={isCalendarExpanded}
            onClose={handleCloseCalendar}
            originRect={calendarOriginRect}
            getLatestCardRect={getLatestCardRect}
            initialYear={calendarInitialYear}
            initialMonth={calendarInitialMonth}
            tasks={tasks}
            onToggleTask={handleToggle}
            onDeleteTask={handleDelete}
            onOpenNewTaskWithDate={handleOpenNewTaskWithDate}
          />
        )}
      </AnimatePresence>

      {/* Undo Delete Toast */}
      {lastDeletedTask && (
        <Toast
          toast={{ taskTitle: lastDeletedTask.title }}
          onUndo={handleUndo}
          onDismiss={handleDismissToast}
        />
      )}
    </div>
  )
}
