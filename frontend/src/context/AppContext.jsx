import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"
import { useTasks } from "../lib/taskStore.js"
import { useStreak } from "../lib/streak.js"
import { getStoredProfile, saveStoredProfile, DEFAULT_PROFILE } from "../lib/profileStore.js"
import {
  getStoredCategories,
  saveStoredCategories,
  DEFAULT_CATEGORIES,
  slugifyCategory,
  migrateCategoriesAndTasks,
} from "../lib/categoryStore.js"

const AppContext = createContext(null)

export function AppProvider({ children }) {
  // Tasks state & operations
  const taskStore = useTasks()
  const { tasks, unassignCategory } = taskStore

  // Streak state derived from live tasks
  const streakData = useStreak(tasks)

  // Profile state
  const [profile, setProfileState] = useState(() => getStoredProfile())

  const updateProfile = useCallback((updates) => {
    setProfileState((prev) => {
      const next = { ...prev, ...updates }
      saveStoredProfile(next)
      return next
    })
  }, [])

  // Categories state
  const [categories, setCategoriesState] = useState(() => getStoredCategories())

  // Initial migration check: ensure any tasks with raw tag strings are converted to IDs
  useEffect(() => {
    if (tasks.length > 0) {
      const { categories: migratedCats, tasksChanged } = migrateCategoriesAndTasks(
        categories,
        tasks
      )
      if (migratedCats.length !== categories.length) {
        setCategoriesState(migratedCats)
        saveStoredCategories(migratedCats)
      }
    }
  }, [tasks, categories])

  const getCategoryById = useCallback(
    (id) => {
      if (!id) return null
      return categories.find((c) => c.id === id) || null
    },
    [categories]
  )

  const getTaskCountForCategory = useCallback(
    (id) => {
      if (!id) return 0
      return tasks.filter((t) => t.category === id).length
    },
    [tasks]
  )

  const addCategory = useCallback(
    (name, color) => {
      const trimmed = name.trim()
      const id = slugifyCategory(trimmed) + "-" + Date.now().toString(36).substring(2, 6)
      const newCat = { id, name: trimmed, color }
      setCategoriesState((prev) => {
        const next = [...prev, newCat]
        saveStoredCategories(next)
        return next
      })
      return newCat
    },
    []
  )

  const updateCategory = useCallback((id, updates) => {
    setCategoriesState((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
      saveStoredCategories(next)
      return next
    })
  }, [])

  const deleteCategory = useCallback(
    (id) => {
      // 1. Remove from category list
      setCategoriesState((prev) => {
        const next = prev.filter((c) => c.id !== id)
        saveStoredCategories(next)
        return next
      })
      // 2. Unassign from all tasks using this category
      unassignCategory(id)
    },
    [unassignCategory]
  )

  const value = useMemo(
    () => ({
      ...taskStore,
      streakData,
      profile,
      updateProfile,
      categories,
      addCategory,
      updateCategory,
      deleteCategory,
      getCategoryById,
      getTaskCountForCategory,
    }),
    [
      taskStore,
      streakData,
      profile,
      updateProfile,
      categories,
      addCategory,
      updateCategory,
      deleteCategory,
      getCategoryById,
      getTaskCountForCategory,
    ]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}

export function useProfile() {
  const { profile, updateProfile } = useApp()
  return { profile, updateProfile }
}

export function useCategories() {
  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    getTaskCountForCategory,
  } = useApp()
  return {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    getTaskCountForCategory,
  }
}
