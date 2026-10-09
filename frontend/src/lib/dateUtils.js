// Date utility functions avoiding timezone parsing issues
// Stored format: "YYYY-MM-DD"

// Returns today's date in local YYYY-MM-DD string format.
// Honors "taskflow:debugToday" from localStorage for test/debug if present.
export function getToday() {
  if (typeof window !== "undefined") {
    try {
      const debug = localStorage.getItem("taskflow:debugToday")
      if (debug && /^\d{4}-\d{2}-\d{2}$/.test(debug.trim())) {
        return debug.trim()
      }
    } catch {
      // ignore localStorage read failure
    }
  }
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function parseDateString(str) {
  if (!str || typeof str !== "string") return null
  const parts = str.trim().split("-").map(Number)
  if (parts.length !== 3 || parts.some(isNaN)) return null
  const [year, month, day] = parts
  return new Date(year, month - 1, day)
}

export function formatDateString(date) {
  if (!date || isNaN(date.getTime())) return ""
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function addDaysToDateString(dateStr, days) {
  const d = parseDateString(dateStr)
  if (!d) return dateStr
  d.setDate(d.getDate() + days)
  return formatDateString(d)
}

export function isSameDay(d1, d2) {
  if (!d1 || !d2) return false
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

export function isDateStringToday(str) {
  if (!str) return false
  return str === getToday()
}

export function getMonthName(monthIndex) {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]
  return months[monthIndex] || ""
}

// Generates 7-column grid days starting on Monday
export function getCalendarMonthDays(year, monthIndex) {
  const todayStr = getToday()
  const firstDayOfMonth = new Date(year, monthIndex, 1)
  const lastDayOfMonth = new Date(year, monthIndex + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()

  // JS getDay(): Sunday = 0, Monday = 1 ... Saturday = 6
  // Convert so Monday = 0, Tuesday = 1, ... Sunday = 6
  const startOffset = (firstDayOfMonth.getDay() + 6) % 7

  const days = []

  // Preceding days from previous month
  const prevMonthLastDay = new Date(year, monthIndex, 0).getDate()
  for (let i = startOffset - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i
    const d = new Date(year, monthIndex - 1, dayNum)
    const dStr = formatDateString(d)
    days.push({
      date: d,
      dateString: dStr,
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: dStr === todayStr,
    })
  }

  // Days in current month
  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const d = new Date(year, monthIndex, dayNum)
    const dStr = formatDateString(d)
    days.push({
      date: d,
      dateString: dStr,
      dayNumber: dayNum,
      isCurrentMonth: true,
      isToday: dStr === todayStr,
    })
  }

  // Trailing days from next month to complete the grid weeks
  const totalCells = Math.ceil(days.length / 7) * 7
  const nextMonthDaysToAdd = totalCells - days.length
  for (let dayNum = 1; dayNum <= nextMonthDaysToAdd; dayNum++) {
    const d = new Date(year, monthIndex + 1, dayNum)
    const dStr = formatDateString(d)
    days.push({
      date: d,
      dateString: dStr,
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: dStr === todayStr,
    })
  }

  return days
}

// Get tasks due on a specific dateString ("YYYY-MM-DD")
export function getTasksForDate(tasks, dateString) {
  if (!tasks || !dateString) return []
  return tasks.filter((t) => t.dueDate === dateString)
}

// Get the next upcoming deadlines (open tasks with due dates sorted soonest first)
export function getUpcomingDeadlines(tasks, limit = 3) {
  if (!tasks) return []
  const todayStr = getToday()

  return tasks
    .filter((t) => !t.completed && Boolean(t.dueDate) && t.dueDate >= todayStr)
    .slice()
    .sort((a, b) => {
      const da = parseDateString(a.dueDate)
      const db = parseDateString(b.dueDate)
      if (!da && !db) return 0
      if (!da) return 1
      if (!db) return -1
      return da.getTime() - db.getTime()
    })
    .slice(0, limit)
}

// Format friendly date like "Oct 12" or "Today" or "Tomorrow"
export function formatFriendlyDate(dateStr) {
  if (!dateStr) return ""
  const todayStr = getToday()

  if (dateStr === todayStr) return "Today"
  if (dateStr === addDaysToDateString(todayStr, 1)) return "Tomorrow"
  if (dateStr === addDaysToDateString(todayStr, -1)) return "Yesterday"

  const d = parseDateString(dateStr)
  if (!d) return dateStr

  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}
