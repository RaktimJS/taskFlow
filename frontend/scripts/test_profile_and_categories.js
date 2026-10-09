// Verification script for Profile and Category calculations, validation, and migration
import assert from "node:assert"
import {
  calculateAge,
  validateEmail,
  validateProfile,
  validateCategoryName,
} from "../src/lib/profileHelpers.js"
import {
  migrateCategoriesAndTasks,
  DEFAULT_CATEGORIES,
} from "../src/lib/categoryStore.js"

console.log("====================================================")
console.log(" Running Profile & Categories Verification Suite   ")
console.log("====================================================")

const today = "2026-10-10"

// ----------------------------------------------------
// TEST GROUP 1: calculateAge tests
// ----------------------------------------------------
console.log("\n[1] Testing calculateAge...")

// 1.1 Birthday is today
const ageToday = calculateAge("2000-10-10", today)
assert.strictEqual(ageToday, 26, "Birthday today should yield exact turn age 26")
console.log("  ✓ Birthday today: 2000-10-10 on 2026-10-10 is 26 years")

// 1.2 Birthday is tomorrow
const ageTomorrow = calculateAge("2000-10-11", today)
assert.strictEqual(ageTomorrow, 25, "Birthday tomorrow should yield 25 (not turned yet)")
console.log("  ✓ Birthday tomorrow: 2000-10-11 on 2026-10-10 is 25 years")

// 1.3 Birthday was yesterday
const ageYesterday = calculateAge("2000-10-09", today)
assert.strictEqual(ageYesterday, 26, "Birthday yesterday should yield 26")
console.log("  ✓ Birthday yesterday: 2000-10-09 on 2026-10-10 is 26 years")

// 1.4 Leap day birthday: Feb 29
// In leap year 2024 on Feb 29
assert.strictEqual(calculateAge("2000-02-29", "2024-02-29"), 24, "Leap day on Feb 29 in leap year")
// In non-leap year 2025 on Feb 28 (birthday has NOT happened yet)
assert.strictEqual(calculateAge("2000-02-29", "2025-02-28"), 24, "Leap day on Feb 28 in non-leap year")
// In non-leap year 2025 on March 1 (birthday HAS happened)
assert.strictEqual(calculateAge("2000-02-29", "2025-03-01"), 25, "Leap day on Mar 01 in non-leap year")
console.log("  ✓ Leap day birthdays (Feb 29) handled properly across leap and non-leap years")

// 1.5 Future DOB rejected
assert.strictEqual(calculateAge("2026-10-11", today), null, "DOB tomorrow should return null")
assert.strictEqual(calculateAge("2030-01-01", today), null, "DOB in 2030 should return null")
assert.strictEqual(calculateAge("1899-12-31", today), null, "DOB before 1900 should return null")
console.log("  ✓ Future DOB and pre-1900 DOB properly rejected (returns null)")

// ----------------------------------------------------
// TEST GROUP 2: Email validation tests
// ----------------------------------------------------
console.log("\n[2] Testing email validation...")

// Valid emails
assert.strictEqual(validateEmail("user@example.com"), true, "Valid standard email")
assert.strictEqual(validateEmail("first.last@company.org"), true, "Valid email with dot")
assert.strictEqual(validateEmail("developer+work@sub.domain.io"), true, "Valid email with subdomain & tag")
assert.strictEqual(validateEmail(""), true, "Empty email is valid since it is optional")
assert.strictEqual(validateEmail("   "), true, "Whitespace email is valid (optional)")

// Invalid emails
assert.strictEqual(validateEmail("plainaddress"), false, "Missing @ and domain")
assert.strictEqual(validateEmail("@missinguser.com"), false, "Missing username")
assert.strictEqual(validateEmail("user@"), false, "Missing domain")
assert.strictEqual(validateEmail("user@domain"), false, "Missing TLD")
assert.strictEqual(validateEmail("user@.com"), false, "Missing domain before TLD")
assert.strictEqual(validateEmail("user @domain.com"), false, "Whitespace inside email")
console.log("  ✓ Valid emails accepted and invalid formats rejected")

// Profile form validation for email
const validProfile = validateProfile({ name: "Alice", email: "alice@taskflow.dev" }, today)
assert.strictEqual(validProfile.isValid, true, "Profile with valid email should pass")

const invalidProfileEmail = validateProfile({ name: "Alice", email: "not-an-email" }, today)
assert.strictEqual(invalidProfileEmail.isValid, false, "Profile with bad email should fail")
assert.strictEqual(invalidProfileEmail.errors.email, "Please enter a valid email address")
console.log("  ✓ validateProfile correctly sets error for invalid email")

// ----------------------------------------------------
// TEST GROUP 3: Category name validation tests
// ----------------------------------------------------
console.log("\n[3] Testing category name validation...")

const existingCategories = [
  { id: "cat-planning", name: "Planning", color: "#3b82f6" },
  { id: "cat-frontend", name: "Frontend", color: "#8b5cf6" },
  { id: "cat-design", name: "Design", color: "#ec4899" },
  { id: "cat-product", name: "Product", color: "#10b981" },
]

// 3.1 Empty or whitespace name
const resEmpty = validateCategoryName("", existingCategories)
assert.strictEqual(resEmpty.isValid, false)
assert.strictEqual(resEmpty.error, "Category name is required")

const resWhitespace = validateCategoryName("    ", existingCategories)
assert.strictEqual(resWhitespace.isValid, false)
assert.strictEqual(resWhitespace.error, "Category name is required")
console.log("  ✓ Empty category names rejected with clear error")

// 3.2 Duplicate with different case
const resDupLower = validateCategoryName("planning", existingCategories)
assert.strictEqual(resDupLower.isValid, false)
assert.strictEqual(resDupLower.error, "Category name already exists")

const resDupUpper = validateCategoryName("DESIGN", existingCategories)
assert.strictEqual(resDupUpper.isValid, false)
assert.strictEqual(resDupUpper.error, "Category name already exists")
console.log("  ✓ Case-insensitive duplicates ('planning', 'DESIGN') rejected")

// 3.3 Name too long (> 20 characters)
const longName = "A".repeat(21)
const resTooLong = validateCategoryName(longName, existingCategories)
assert.strictEqual(resTooLong.isValid, false)
assert.strictEqual(resTooLong.error, "Category name must be 20 characters or less")

const maxLenName = "A".repeat(20)
const resMaxLen = validateCategoryName(maxLenName, existingCategories)
assert.strictEqual(resMaxLen.isValid, true, "20 characters must be accepted")
console.log("  ✓ Category names > 20 characters rejected; 20 characters accepted")

// 3.4 12 categories maximum limit
const twelveCategories = Array.from({ length: 12 }, (_, i) => ({
  id: `cat-${i}`,
  name: `Category ${i}`,
  color: "#3b82f6",
}))

const resLimit = validateCategoryName("Category 13", twelveCategories)
assert.strictEqual(resLimit.isValid, false)
assert.strictEqual(resLimit.error, "Maximum of 12 categories allowed")

// Editing an existing category within the 12 limit is allowed
const resEditWithinLimit = validateCategoryName("Category Renamed", twelveCategories, "cat-0")
assert.strictEqual(resEditWithinLimit.isValid, true, "Renaming existing category when at 12 limit must be allowed")
console.log("  ✓ 12-category limit enforced for new additions, allowed for editing")

// ----------------------------------------------------
// TEST GROUP 4: Idempotent tag strings migration
// ----------------------------------------------------
console.log("\n[4] Testing tag migration idempotency...")

const legacyTasks = [
  { id: "task-1", title: "Setup repo", category: "Planning" },
  { id: "task-2", title: "Build UI", category: "Frontend" },
  { id: "task-3", title: "Style mockups", category: "Design" },
  { id: "task-4", title: "Custom feature", category: "Mobile App" }, // new tag
  { id: "task-5", title: "No category", category: "" },
]

// First migration run (from null categories)
const migration1 = migrateCategoriesAndTasks(null, legacyTasks)
assert.strictEqual(migration1.tasksChanged, true, "First run should convert tags to IDs")
assert.ok(migration1.categories.length >= 5, "Should have 4 default + 1 new Mobile App category")

const mobileCat = migration1.categories.find((c) => c.name === "Mobile App")
assert.ok(mobileCat, "New Mobile App category created")
assert.strictEqual(migration1.tasks[0].category, "cat-planning", "Planning tag converted to cat-planning ID")
assert.strictEqual(migration1.tasks[1].category, "cat-frontend", "Frontend tag converted to cat-frontend ID")
assert.strictEqual(migration1.tasks[2].category, "cat-design", "Design tag converted to cat-design ID")
assert.strictEqual(migration1.tasks[3].category, mobileCat.id, "Mobile App tag converted to ID")
assert.strictEqual(migration1.tasks[4].category, "", "Empty category preserved")
console.log("  ✓ Migration run 1: Created categories and converted task tags to IDs")

// Second migration run (idempotency check)
const migration2 = migrateCategoriesAndTasks(migration1.categories, migration1.tasks)
assert.strictEqual(migration2.tasksChanged, false, "Second run should make zero changes")
assert.strictEqual(
  migration2.categories.length,
  migration1.categories.length,
  "Category count must not duplicate"
)
assert.deepStrictEqual(migration2.tasks, migration1.tasks, "Tasks must be completely unchanged")
console.log("  ✓ Migration run 2: Idempotent (no changes made, no duplicate categories)")

console.log("\n====================================================")
console.log(" ALL TESTS PASSED SUCCESSFULLY!                    ")
console.log("====================================================\n")
