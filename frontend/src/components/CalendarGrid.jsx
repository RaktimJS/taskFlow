import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DayCell } from "./DayCell"

export const CalendarGrid = React.memo(function CalendarGrid({
  monthDays,
  tasksByDate,
  selectedDate,
  onSelectDate,
  slideDirection = 0,
  monthKey,
  prefersReducedMotion = false,
}) {
  const weekDays = [
    { short: "Mon", full: "Monday" },
    { short: "Tue", full: "Tuesday" },
    { short: "Wed", full: "Wednesday" },
    { short: "Thu", full: "Thursday" },
    { short: "Fri", full: "Friday" },
    { short: "Sat", full: "Saturday" },
    { short: "Sun", full: "Sunday" },
  ]

  const gridVariants = {
    enter: (direction) => ({
      x: prefersReducedMotion ? 0 : direction > 0 ? 64 : direction < 0 ? -64 : 0,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "tween", duration: prefersReducedMotion ? 0.05 : 0.28, ease: [0.16, 1, 0.3, 1] },
        opacity: { duration: prefersReducedMotion ? 0.05 : 0.22, ease: "easeOut" },
      },
    },
    exit: (direction) => ({
      x: prefersReducedMotion ? 0 : direction > 0 ? -64 : direction < 0 ? 64 : 0,
      opacity: 0,
      transition: {
        x: { type: "tween", duration: prefersReducedMotion ? 0.05 : 0.22, ease: [0.16, 1, 0.3, 1] },
        opacity: { duration: prefersReducedMotion ? 0.05 : 0.18, ease: "easeIn" },
      },
    }),
  }

  return (
    <div className="flex flex-col w-full h-full select-none">
      {/* 7-column Weekday Headers (Fixed & stationary at top to prevent jitter) */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center mb-2 flex-shrink-0" role="row">
        {weekDays.map((d, idx) => (
          <div
            key={idx}
            className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider py-1"
          >
            <span className="hidden sm:inline">{d.full}</span>
            <span className="sm:hidden">{d.short}</span>
          </div>
        ))}
      </div>

      {/* 7-column Day Cells Grid with Smooth Directional Slide */}
      <div className="flex-1 relative overflow-hidden min-h-[340px]">
        <AnimatePresence mode="popLayout" custom={slideDirection} initial={false}>
          <motion.div
            key={monthKey || "current-grid"}
            custom={slideDirection}
            variants={gridVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="grid grid-cols-7 gap-1.5 sm:gap-2 w-full h-full"
            role="grid"
            aria-label="Month calendar grid"
          >
            {monthDays.map((cell) => {
              const dayTasks = tasksByDate[cell.dateString] || []
              const isSelected = selectedDate === cell.dateString

              return (
                <DayCell
                  key={cell.dateString}
                  cell={cell}
                  tasks={dayTasks}
                  isSelected={isSelected}
                  onSelectDate={onSelectDate}
                />
              )
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
})

