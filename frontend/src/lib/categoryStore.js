// Category Store & Idempotent Migration

import { CATEGORY_COLOR_PRESETS } from "./profileHelpers.js"

export const CATEGORIES_STORAGE_KEY = "taskflow:categories:v1"

export const DEFAULT_CATEGORIES = [
  { id: "cat-planning", name: "Planning", color: "#3b82f6" },
  { id: "cat-frontend", name: "Frontend", color: "#8b5cf6" },
  { id: "cat-design", name: "Design", color: "#ec4899" },
  { id: "cat-product", name: "Product", color: "#10b981" },
]

/**
 * Creates a slug/id from a category name.
 */
export function slugifyCategory(name) {
  return "cat-" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

/**
 * Migrates existing tag strings into categories and converts tasks to use category IDs.
 * Pure and idempotent: safe to call multiple times.
 */
export function migrateCategoriesAndTasks(rawCategories, rawTasks) {
  let categories = []
  let tasks = Array.isArray(rawTasks) ? [...rawTasks] : []

  // Check if categories already exist
  if (Array.isArray(rawCategories) && rawCategories.length > 0) {
    categories = [...rawCategories]
  } else {
    // Start with default categories
    categories = [...DEFAULT_CATEGORIES]

    // Collect any other distinct tag strings present in existing tasks
    const existingTags = new Set(
      tasks
        .map((t) => (t.category || t.tag || "").trim())
        .filter((c) => c && !c.startsWith("cat-"))
    )

    let colorIndex = 4
    for (const tag of existingTags) {
      const alreadyHas = categories.some(
        (c) => c.name.toLowerCase() === tag.toLowerCase()
      )
      if (!alreadyHas) {
        const id = slugifyCategory(tag) || `cat-${Date.now()}-${colorIndex}`
        const color = CATEGORY_COLOR_PRESETS[colorIndex % CATEGORY_COLOR_PRESETS.length]
        categories.push({ id, name: tag, color })
        colorIndex++
      }
    }
  }

  // Idempotently convert tasks whose category is a tag name rather than an ID
  let tasksChanged = false
  tasks = tasks.map((t) => {
    const rawCategory = (t.category || t.tag || "").trim()
    if (!rawCategory) return t

    // Already a valid ID?
    if (categories.some((c) => c.id === rawCategory)) {
      if (t.category !== rawCategory || t.tag !== undefined) {
        tasksChanged = true
        const updated = { ...t, category: rawCategory }
        delete updated.tag
        return updated
      }
      return t
    }

    // Match by name (case-insensitive)
    const match = categories.find(
      (c) => c.name.toLowerCase() === rawCategory.toLowerCase()
    )
    if (match) {
      tasksChanged = true
      const updated = { ...t, category: match.id }
      delete updated.tag
      return updated
    }
    return t
  })

  return {
    categories,
    tasks,
    tasksChanged,
  }
}

/**
 * Loads stored categories from localStorage, running migration if needed.
 */
export function getStoredCategories() {
  if (typeof window === "undefined") return DEFAULT_CATEGORIES
  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }

    // If no categories stored yet, run initial migration with stored tasks
    const tasksRaw = localStorage.getItem("taskflow:tasks:v2")
    const tasks = tasksRaw ? JSON.parse(tasksRaw) : []
    const { categories, tasks: migratedTasks, tasksChanged } = migrateCategoriesAndTasks(
      null,
      tasks
    )

    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories))
    if (tasksChanged) {
      localStorage.setItem("taskflow:tasks:v2", JSON.stringify(migratedTasks))
    }

    return categories
  } catch (err) {
    console.error("Error loading categories:", err)
    return DEFAULT_CATEGORIES
  }
}

/**
 * Saves categories to localStorage.
 */
export function saveStoredCategories(categories) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories))
  } catch (err) {
    console.error("Failed to save categories:", err)
  }
}
