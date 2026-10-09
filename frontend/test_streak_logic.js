// Test script for streak logic
import assert from "node:assert"
import {
  getTaskDate,
  finalizeDays,
  computeStreak,
  computeBestStreak,
  getWeekStrip,
} from "./src/lib/streak.js"
import { addDaysToDateString } from "./src/lib/dateUtils.js"

console.log("--- Starting Streak Logic Verification ---")

const today = "2026-10-10"
const yesterday = addDaysToDateString(today, -1) // 2026-10-09
const twoDaysAgo = addDaysToDateString(today, -2) // 2026-10-08
const threeDaysAgo = addDaysToDateString(today, -3) // 2026-10-07
const fourDaysAgo = addDaysToDateString(today, -4) // 2026-10-06

// Test 1: getTaskDate
assert.strictEqual(getTaskDate({ dueDate: "2026-10-10" }), "2026-10-10")
assert.strictEqual(getTaskDate({ dueDate: "", createdAt: "2026-10-09T14:30:00.000Z" }), "2026-10-09")
console.log("✓ Test 1: getTaskDate passed")

// Test 2: Seeded 3-day history with today incomplete
const initialHistory = {
  [threeDaysAgo]: "done",
  [twoDaysAgo]: "done",
  [yesterday]: "done",
}

const statusTodayIncomplete = {
  todayDone: 1,
  todayTotal: 2,
  isComplete: false,
  todayStr: today,
}

const res1 = computeStreak(initialHistory, statusTodayIncomplete)
assert.strictEqual(res1.streak, 3, "Streak should be 3 from yesterday backwards")
assert.strictEqual(res1.bestStreak, 3, "Best streak should be 3")
assert.strictEqual(res1.state, "atRisk", "State should be atRisk when tasks are incomplete")
console.log("✓ Test 2: 3-day streak with incomplete today passed")

// Test 3: Complete today's tasks -> streak becomes 4, state becomes active
const statusTodayComplete = {
  todayDone: 2,
  todayTotal: 2,
  isComplete: true,
  todayStr: today,
}

const res2 = computeStreak(initialHistory, statusTodayComplete)
assert.strictEqual(res2.streak, 4, "Streak should increase to 4 when today is complete")
assert.strictEqual(res2.bestStreak, 4, "Best streak should increase to 4")
assert.strictEqual(res2.state, "active", "State should be active when today is complete")
console.log("✓ Test 3: Today completed increases streak to 4 passed")

// Test 4: Untick today's task -> streak reverts back to 3
const res3 = computeStreak(initialHistory, { ...statusTodayComplete, isComplete: false, todayDone: 1 })
assert.strictEqual(res3.streak, 3, "Unticking today reverts streak back to 3")
assert.strictEqual(res3.state, "atRisk", "State reverts to atRisk")
console.log("✓ Test 4: Unticking today reverts streak to 3 passed")

// Test 5: Rest days are skipped and preserve streak
const historyWithRest = {
  [fourDaysAgo]: "done",
  [threeDaysAgo]: "rest", // 0 tasks
  [twoDaysAgo]: "done",
  [yesterday]: "done",
}

const resRest = computeStreak(historyWithRest, statusTodayIncomplete)
assert.strictEqual(resRest.streak, 3, "Rest day skipped, counting 3 done days")
console.log("✓ Test 5: Rest day skipped properly passed")

// Test 6: Missed day breaks streak
const historyWithMissed = {
  [fourDaysAgo]: "done",
  [threeDaysAgo]: "missed",
  [twoDaysAgo]: "done",
  [yesterday]: "done",
}

const resMissed = computeStreak(historyWithMissed, statusTodayIncomplete)
assert.strictEqual(resMissed.streak, 2, "Missed day stops backwards walk at 2 days")
assert.strictEqual(resMissed.bestStreak, 2, "Best streak tracks peak")
console.log("✓ Test 6: Missed day breaks streak passed")

// Test 7: Yesterday was missed -> streak is 0
const historyYesterdayMissed = {
  [twoDaysAgo]: "done",
  [yesterday]: "missed",
}

const resYesterdayMissed = computeStreak(historyYesterdayMissed, statusTodayIncomplete)
assert.strictEqual(resYesterdayMissed.streak, 0, "Yesterday missed results in 0 streak")
console.log("✓ Test 7: Yesterday missed streak 0 passed")

// Test 8: Finalize days logic
const sampleTasks = [
  { id: "1", dueDate: yesterday, completed: true },
  { id: "2", dueDate: twoDaysAgo, completed: false },
]

const startHistory = {
  [fourDaysAgo]: "done",
}

const finalized = finalizeDays(sampleTasks, startHistory, today)
assert.strictEqual(finalized[fourDaysAgo], "done", "Existing history remains locked")
assert.strictEqual(finalized[threeDaysAgo], "rest", "No tasks day finalized as rest")
assert.strictEqual(finalized[twoDaysAgo], "missed", "Incomplete task finalized as missed")
assert.strictEqual(finalized[yesterday], "done", "Completed task finalized as done")
console.log("✓ Test 8: Finalize days logic passed")

// Test 9: getWeekStrip
const strip = getWeekStrip(initialHistory, sampleTasks, today)
assert.strictEqual(strip.length, 7, "Week strip must contain 7 days")
assert.strictEqual(strip[6].isToday, true, "Last element must be today")
assert.strictEqual(strip[6].dateStr, today, "Last element date must match today")
assert.strictEqual(strip[5].dateStr, yesterday, "Second to last element must be yesterday")
console.log("✓ Test 9: getWeekStrip returns 7 days passed")

console.log("All 9 streak logic tests passed successfully!")
