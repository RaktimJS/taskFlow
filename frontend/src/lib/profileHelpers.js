// Profile and Category validation and calculation pure helpers

/**
 * Calculates user age in full years from DOB string (YYYY-MM-DD) and today's date string (YYYY-MM-DD).
 * Handles birthdays that haven't happened yet this year and Feb 29 leap day birthdays.
 * Returns null if no DOB, if DOB is before 1900, or if DOB is in the future.
 */
export function calculateAge(dob, todayStr) {
  if (!dob || typeof dob !== "string" || !dob.trim()) return null
  if (!todayStr || typeof todayStr !== "string") return null

  const dobParts = dob.trim().split("-").map(Number)
  const todayParts = todayStr.trim().split("-").map(Number)

  if (dobParts.length !== 3 || todayParts.length !== 3) return null
  if (dobParts.some(isNaN) || todayParts.some(isNaN)) return null

  const [bYear, bMonth, bDay] = dobParts
  const [tYear, tMonth, tDay] = todayParts

  // Future DOB is invalid
  if (
    bYear > tYear ||
    (bYear === tYear && bMonth > tMonth) ||
    (bYear === tYear && bMonth === tMonth && bDay > tDay)
  ) {
    return null
  }

  // Not before 1900
  if (bYear < 1900) {
    return null
  }

  let age = tYear - bYear

  // Check if birthday has occurred yet this year
  if (tMonth < bMonth || (tMonth === bMonth && tDay < bDay)) {
    age--
  }

  return Math.max(0, age)
}

/**
 * Validates email format according to standard email rules.
 * If empty or whitespace, considered valid as email is optional.
 * If provided, must match standard user@domain.tld pattern.
 */
export function validateEmail(email) {
  if (!email || typeof email !== "string" || !email.trim()) return true
  const trimmed = email.trim().toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(trimmed)
}

/**
 * Validates profile fields.
 * Name: required, 1-30 characters trimmed.
 * DOB: optional, cannot be in future, not before 1900.
 * Email: optional, must match standard email format if provided.
 */
export function validateProfile(values, todayStr) {
  const errors = {}

  // Name validation
  const trimmedName = (values?.name || "").trim()
  if (!trimmedName) {
    errors.name = "Name is required"
  } else if (trimmedName.length > 30) {
    errors.name = "Name must be 30 characters or less"
  }

  // DOB validation
  if (values?.dob && values.dob.trim()) {
    const dob = values.dob.trim()
    if (dob > todayStr) {
      errors.dob = "Date of birth cannot be in the future"
    } else if (dob < "1900-01-01") {
      errors.dob = "Date of birth must be 1900 or later"
    }
  }

  // Email validation
  if (values?.email && values.email.trim()) {
    const email = values.email.trim().toLowerCase()
    if (!validateEmail(email)) {
      errors.email = "Please enter a valid email address"
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Validates a category name.
 * Rules: required, 1-20 characters trimmed, unique case-insensitive, maximum 12 categories.
 */
export function validateCategoryName(name, existingCategories = [], editingId = null) {
  const trimmedName = (name || "").trim()

  if (!trimmedName) {
    return {
      isValid: false,
      error: "Category name is required",
      trimmedName: "",
    }
  }

  if (trimmedName.length > 20) {
    return {
      isValid: false,
      error: "Category name must be 20 characters or less",
      trimmedName,
    }
  }

  const isDuplicate = existingCategories.some(
    (c) =>
      c.id !== editingId &&
      c.name.trim().toLowerCase() === trimmedName.toLowerCase()
  )

  if (isDuplicate) {
    return {
      isValid: false,
      error: "Category name already exists",
      trimmedName,
    }
  }

  // Check 12-category limit when adding a new category
  if (!editingId && existingCategories.length >= 12) {
    return {
      isValid: false,
      error: "Maximum of 12 categories allowed",
      trimmedName,
    }
  }

  return {
    isValid: true,
    error: null,
    trimmedName,
  }
}

/**
 * 10 curated preset colors for category tags
 */
export const CATEGORY_COLOR_PRESETS = [
  "#0A6CFF", // Electric Blue
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#f43f5e", // Rose
  "#f97316", // Orange
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#14b8a6", // Teal
  "#06b6d4", // Cyan
  "#6366f1", // Indigo
]
