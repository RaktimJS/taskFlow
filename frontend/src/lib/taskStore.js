import { useState, useEffect, useCallback, useMemo } from "react"
import { parseDateString, formatDateString, getToday, addDaysToDateString } from "./dateUtils"

const STORAGE_KEY = "taskflow:tasks:v2"
const SEEDED_KEY = "taskflow:seeded:v2"

// Check if a task is overdue safely using local date string comparison
export function isOverdue(dueDate, completed) {
  if (!dueDate || completed) return false
  return dueDate < getToday()
}

// Generate relative sample tasks for initial load
function createInitialSeedTasks() {
  const todayStr = getToday()
  const addDays = (days) => addDaysToDateString(todayStr, days)

  return [
    {
      id: "task-seed-overdue",
      title: "Finalize API contract & specs",
      description: "Review endpoints, request schemas, and error conventions.",
      completed: false,
      priority: "high",
      dueDate: addDays(-2), // 2 days overdue
      category: "cat-planning",
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: "task-seed-today",
      title: "Team sync & roadmap review",
      description: "Standup alignment on sprint goals and task assignments.",
      completed: false,
      priority: "medium",
      dueDate: addDays(0), // Today
      category: "cat-planning",
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: "task-seed-tomorrow",
      title: "Implement squircle calendar grid",
      description: "Smooth superellipse day cells with dot badges.",
      completed: false,
      priority: "high",
      dueDate: addDays(1), // Tomorrow
      category: "cat-frontend",
      createdAt: new Date().toISOString(),
    },
    {
      id: "task-seed-in3",
      title: "Design research for mobile adaptive sheets",
      description: "Test touch interactions and drawer gestures on small screens.",
      completed: false,
      priority: "low",
      dueDate: addDays(3), // In 3 days
      category: "cat-design",
      createdAt: new Date().toISOString(),
    },
    {
      id: "task-seed-in8",
      title: "Quarterly performance metrics audit",
      description: "Analyze lighthouse scores, bundle sizes, and render passes.",
      completed: false,
      priority: "medium",
      dueDate: addDays(8), // In 8 days
      category: "cat-product",
      createdAt: new Date().toISOString(),
    },
  ]
}

// Safe retrieval from localStorage with one-time seed flag
export function getStoredTasks() {
  if (typeof window === "undefined") return []
  try {
    const hasSeeded = localStorage.getItem(SEEDED_KEY)
    const raw = localStorage.getItem(STORAGE_KEY)

    // First load ever: seed 5 relative tasks if not yet seeded and no tasks key exists
    if (!hasSeeded && raw === null) {
      const initial = createInitialSeedTasks()
      localStorage.setItem(SEEDED_KEY, "true")
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
      return initial
    }

    // Already seeded previously: read existing tasks (even if empty, never re-seed)
    if (raw !== null) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed
      }
    }

    return []
  } catch (err) {
    console.error("Error reading tasks from localStorage:", err)
    return []
  }
}

// Safe persistence to localStorage
export function saveStoredTasks(tasks) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  } catch (err) {
    console.error("Failed to save tasks to localStorage:", err)
  }
}

// Custom hook providing reactive state and task operations
export function useTasks() {
  const [tasks, setTasks] = useState(() => getStoredTasks())

  // Synchronize state changes to localStorage
  useEffect(() => {
    saveStoredTasks(tasks)
  }, [tasks])

  // Cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue)
          if (Array.isArray(updated)) {
            setTasks(updated)
          }
        } catch {
          // ignore corrupted cross-tab payload
        }
      }
    }
    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  // Add new task with whitespace validation
  const addTask = useCallback(({ title, description = "", priority = "medium", dueDate = "", category = "" }) => {
    const trimmedTitle = (title || "").trim()
    if (!trimmedTitle) {
      throw new Error("Task title cannot be empty or whitespace only.")
    }

    const newTask = {
      id: "task-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      title: trimmedTitle,
      description: description.trim(),
      completed: false,
      priority: ["high", "medium", "low"].includes(priority) ? priority : "medium",
      dueDate: dueDate || "",
      category: category ? category.trim() : "",
      createdAt: new Date().toISOString(),
    }

    setTasks((prev) => [newTask, ...prev])
    return newTask
  }, [])

  // Toggle completed status
  const toggleTask = useCallback((id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    )
  }, [])

  // Delete task with return of deleted item (for Undo support)
  const deleteTask = useCallback((id) => {
    let deletedItem = null
    setTasks((prev) => {
      deletedItem = prev.find((t) => t.id === id) || null
      return prev.filter((t) => t.id !== id)
    })
    return deletedItem
  }, [])

  // Restore deleted task (undo)
  const restoreTask = useCallback((task) => {
    if (!task || !task.id) return
    setTasks((prev) => {
      if (prev.some((t) => t.id === task.id)) return prev
      return [task, ...prev]
    })
  }, [])

  // Clear all completed tasks
  const clearCompleted = useCallback(() => {
    setTasks((prev) => prev.filter((t) => !t.completed))
  }, [])

  // Clear all tasks (will not re-seed because SEEDED_KEY is set)
  const clearAllTasks = useCallback(() => {
    setTasks([])
  }, [])

  // Derived statistics - completely computed from real task data
  const stats = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter((t) => t.completed).length
    const open = total - completed
    const overdue = tasks.filter((t) => isOverdue(t.dueDate, t.completed)).length
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100 * 10) / 10
    const highPriority = tasks.filter((t) => t.priority === "high" && !t.completed).length

    return {
      total,
      completed,
      open,
      overdue,
      percentage,
      highPriority,
    }
  }, [tasks])

  // Unassign category from tasks when category is deleted (tasks are NOT deleted)
  const unassignCategory = useCallback((categoryId) => {
    setTasks((prev) =>
      prev.map((t) => (t.category === categoryId ? { ...t, category: "" } : t))
    )
  }, [])

  return {
    tasks,
    addTask,
    toggleTask,
    deleteTask,
    restoreTask,
    clearCompleted,
    clearAllTasks,
    unassignCategory,
    stats,
  }
}
