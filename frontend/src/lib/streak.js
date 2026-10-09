import { useState, useEffect, useCallback, useMemo } from "react"
import { getToday, addDaysToDateString, parseDateString, formatFriendlyDate } from "./dateUtils.js"

export const STREAK_HISTORY_KEY = "taskflow:streakHistory:v1"
export const STREAK_SEEDED_KEY = "taskflow:streakSeeded:v1"

/**
 * Extracts the assigned date string (YYYY-MM-DD) for a task.
 * Rule: "A day's tasks" = all tasks whose due date is that day.
 * A task with no due date counts for the day it was created.
 */
export function getTaskDate(task) {
  if (!task) return ""
  if (task.dueDate && typeof task.dueDate === "string" && task.dueDate.trim()) {
    return task.dueDate.trim().substring(0, 10)
  }
  if (task.createdAt) {
    try {
      const d = new Date(task.createdAt)
      if (!isNaN(d.getTime())) {
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, "0")
        const day = String(d.getDate()).padStart(2, "0")
        return `${y}-${m}-${day}`
      }
    } catch {
      // fallback
    }
    const isoPart = String(task.createdAt).substring(0, 10)
    if (/^\d{4}-\d{2}-\d{2}$/.test(isoPart)) {
      return isoPart
    }
  }
  return ""
}

/**
 * Finalizes past days from the day after the last finalized date up to yesterday.
 * Pure function: records "done", "missed", or "rest" in history map.
 * Locked: past finalized days are never overwritten.
 * If there is no history yet, starts tracking from today (does not invent a past).
 */
export function finalizeDays(tasks, history, todayStr) {
  const newHistory = { ...history }
  const keys = Object.keys(newHistory).sort()

  if (keys.length === 0) {
    // If there is no history yet, start tracking from today (do not invent a past)
    return newHistory
  }

  const lastFinalized = keys[keys.length - 1]
  let curr = addDaysToDateString(lastFinalized, 1)
  const yesterday = addDaysToDateString(todayStr, -1)

  while (curr <= yesterday) {
    const dayTasks = tasks.filter((t) => getTaskDate(t) === curr)
    if (dayTasks.length === 0) {
      newHistory[curr] = "rest"
    } else {
      const allDone = dayTasks.every((t) => t.completed)
      newHistory[curr] = allDone ? "done" : "missed"
    }
    curr = addDaysToDateString(curr, 1)
  }

  return newHistory
}

/**
 * Computes longest historical streak chain including live today.
 */
export function computeBestStreak(history, todayStatus, currentStreak) {
  const dates = Object.keys(history).sort()
  if (dates.length === 0) {
    return currentStreak
  }

  const minDate = dates[0]
  const todayStr = todayStatus.todayStr || getToday()

  let maxStreak = 0
  let tempStreak = 0
  let curr = minDate

  while (curr <= todayStr) {
    let status
    if (curr === todayStr) {
      status = todayStatus.isComplete
        ? "done"
        : (todayStatus.todayTotal === 0 ? "rest" : "pending")
    } else {
      status = history[curr]
    }

    if (status === "done") {
      tempStreak += 1
      if (tempStreak > maxStreak) {
        maxStreak = tempStreak
      }
    } else if (status === "rest") {
      // rest days skip: neither extend nor break the streak
    } else {
      // missed, pending, or unknown day breaks streak chain
      tempStreak = 0
    }

    curr = addDaysToDateString(curr, 1)
  }

  return Math.max(maxStreak, currentStreak)
}

/**
 * Computes the streak by walking backwards from yesterday:
 * - "done" adds 1
 * - "rest" is skipped
 * - "missed" or unknown day stops
 * Then adds 1 if today is complete.
 * Returns: { streak, bestStreak, todayDone, todayTotal, isComplete, state }
 * State: "active" (today complete), "atRisk" (today has incomplete tasks and streak/tasks exist),
 *        "idle" (no tasks today), "broken" (streak is 0).
 */
export function computeStreak(history, todayStatus) {
  const todayStr = todayStatus.todayStr || getToday()
  const todayDone = todayStatus.todayDone || 0
  const todayTotal = todayStatus.todayTotal || 0
  const isComplete = Boolean(todayStatus.isComplete)

  let streak = 0
  let checkDate = addDaysToDateString(todayStr, -1)

  // Walk backwards from yesterday
  while (true) {
    const status = history[checkDate]
    if (status === "done") {
      streak += 1
      checkDate = addDaysToDateString(checkDate, -1)
    } else if (status === "rest") {
      // Rest day: skipped when counting, preserves streak
      checkDate = addDaysToDateString(checkDate, -1)
    } else {
      // "missed" or unknown day stops
      break
    }
  }

  // Add 1 if today is complete
  if (isComplete) {
    streak += 1
  }

  const bestStreak = computeBestStreak(history, { ...todayStatus, todayStr, isComplete }, streak)

  // Determine state
  let state = "idle"
  if (isComplete) {
    state = "active"
  } else if (todayTotal > 0) {
    state = "atRisk"
  } else if (todayTotal === 0) {
    state = streak === 0 ? "broken" : "idle"
  }

  return {
    streak,
    bestStreak,
    todayDone,
    todayTotal,
    isComplete,
    state,
  }
}

/**
 * Generates the 7-day strip (last 6 days plus today).
 * Statuses: "done" | "missed" | "rest" | "today-complete" | "today-pending"
 */
export function getWeekStrip(history, tasks, todayStr) {
  const weekdayInitials = ["S", "M", "T", "W", "T", "F", "S"]
  const strip = []

  for (let i = 6; i >= 0; i--) {
    const dateStr = addDaysToDateString(todayStr, -i)
    const isToday = i === 0
    const d = parseDateString(dateStr)
    const dayInitial = d ? weekdayInitials[d.getDay()] : ""
    const dayNumber = d ? d.getDate() : ""

    const dayTasks = tasks.filter((t) => getTaskDate(t) === dateStr)
    const dayTotal = dayTasks.length
    const dayDone = dayTasks.filter((t) => t.completed).length

    let status = "rest"
    let tooltip = ""

    if (isToday) {
      const todayComplete = dayTotal > 0 && dayDone === dayTotal
      status = todayComplete ? "today-complete" : "today-pending"
      tooltip = todayComplete
        ? `Today (${formatFriendlyDate(dateStr)}): Streak secured (${dayDone}/${dayTotal} done)`
        : dayTotal > 0
        ? `Today (${formatFriendlyDate(dateStr)}): ${dayDone}/${dayTotal} tasks done (Streak at risk)`
        : `Today (${formatFriendlyDate(dateStr)}): No tasks scheduled`
    } else {
      const historyStatus = history[dateStr]
      if (historyStatus) {
        status = historyStatus
      } else {
        if (dayTotal === 0) status = "rest"
        else status = dayDone === dayTotal ? "done" : "missed"
      }

      if (status === "done") {
        tooltip = `${formatFriendlyDate(dateStr)}: Completed`
      } else if (status === "missed") {
        tooltip = `${formatFriendlyDate(dateStr)}: Missed`
      } else {
        tooltip = `${formatFriendlyDate(dateStr)}: Rest day`
      }
    }

    strip.push({
      dateStr,
      dayInitial,
      dayNumber,
      status,
      isToday,
      dayTotal,
      dayDone,
      tooltip,
    })
  }

  return strip
}

/**
 * Loads stored streak history map with one-time 3-day seed on first load.
 */
export function getStoredStreakHistory(todayStr) {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(STREAK_HISTORY_KEY)
    const seeded = localStorage.getItem(STREAK_SEEDED_KEY)

    // Seed 3 days before today as "done" if not yet seeded and no history exists
    if (!seeded && raw === null) {
      const initial = {}
      initial[addDaysToDateString(todayStr, -3)] = "done"
      initial[addDaysToDateString(todayStr, -2)] = "done"
      initial[addDaysToDateString(todayStr, -1)] = "done"

      localStorage.setItem(STREAK_SEEDED_KEY, "true")
      localStorage.setItem(STREAK_HISTORY_KEY, JSON.stringify(initial))
      return initial
    }

    if (raw !== null) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === "object") {
        return parsed
      }
    }

    return {}
  } catch (err) {
    console.error("Error reading streak history from localStorage:", err)
    return {}
  }
}

/**
 * Persists history map to localStorage.
 */
export function saveStoredStreakHistory(history) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STREAK_HISTORY_KEY, JSON.stringify(history))
  } catch (err) {
    console.error("Failed to save streak history to localStorage:", err)
  }
}

/**
 * React hook managing reactive streak state and overnight midnight timer.
 */
export function useStreak(tasks) {
  const [todayStr, setTodayStr] = useState(() => getToday())
  const [history, setHistory] = useState(() => getStoredStreakHistory(getToday()))

  const updateFinalization = useCallback((currentToday) => {
    setHistory((prevHistory) => {
      const updated = finalizeDays(tasks, prevHistory, currentToday)
      if (JSON.stringify(prevHistory) !== JSON.stringify(updated)) {
        saveStoredStreakHistory(updated)
        return updated
      }
      return prevHistory
    })
  }, [tasks])

  // Date check, visibility listener, and midnight timer
  useEffect(() => {
    const checkDate = () => {
      const nowToday = getToday()
      if (nowToday !== todayStr) {
        setTodayStr(nowToday)
      }
      updateFinalization(nowToday)
    }

    checkDate()

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        checkDate()
      }
    }
    document.addEventListener("visibilitychange", handleVisibility)

    const now = new Date()
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1)
    const msUntilMidnight = Math.max(1000, midnight.getTime() - now.getTime())

    const midnightTimer = setTimeout(() => {
      checkDate()
    }, msUntilMidnight)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility)
      clearTimeout(midnightTimer)
    }
  }, [todayStr, updateFinalization])

  // Live today tasks calculation
  const todayTasks = useMemo(() => {
    return tasks.filter((t) => getTaskDate(t) === todayStr)
  }, [tasks, todayStr])

  const todayTotal = todayTasks.length
  const todayDone = todayTasks.filter((t) => t.completed).length
  const isComplete = todayTotal > 0 && todayDone === todayTotal

  const todayStatus = useMemo(() => ({
    todayDone,
    todayTotal,
    isComplete,
    todayStr,
  }), [todayDone, todayTotal, isComplete, todayStr])

  const streakData = useMemo(() => {
    return computeStreak(history, todayStatus)
  }, [history, todayStatus])

  const weekStrip = useMemo(() => {
    return getWeekStrip(history, tasks, todayStr)
  }, [history, tasks, todayStr])

  return {
    ...streakData,
    weekStrip,
    history,
    todayStr,
  }
}
