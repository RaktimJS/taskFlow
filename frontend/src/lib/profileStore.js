// Profile storage helper

export const PROFILE_STORAGE_KEY = "taskflow:profile:v1"

export const DEFAULT_PROFILE = {
  name: "User",
  dob: "",
  email: "",
  country: "",
}

export function getStoredProfile() {
  if (typeof window === "undefined") return DEFAULT_PROFILE
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        ...DEFAULT_PROFILE,
        ...parsed,
        name: (parsed.name || "User").trim() || "User",
      }
    }
    return DEFAULT_PROFILE
  } catch (err) {
    console.error("Error reading profile:", err)
    return DEFAULT_PROFILE
  }
}

export function saveStoredProfile(profile) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile))
  } catch (err) {
    console.error("Failed to save profile:", err)
  }
}
