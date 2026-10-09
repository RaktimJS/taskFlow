import React, { useState } from "react"
import { Plus, Trash2, Check, AlertTriangle, Layers, Edit2 } from "lucide-react"
import { useApp } from "../context/AppContext.jsx"
import { ColorSwatchPicker } from "./ColorSwatchPicker.jsx"
import { validateCategoryName, CATEGORY_COLOR_PRESETS } from "../lib/profileHelpers.js"

export function CategoryManager() {
  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    getTaskCountForCategory,
  } = useApp()

  // New category input state
  const [newName, setNewName] = useState("")
  const [newColor, setNewColor] = useState(CATEGORY_COLOR_PRESETS[0])
  const [addError, setAddError] = useState(null)
  const [savedIndicator, setSavedIndicator] = useState(false)

  // Inline rename state
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState("")
  const [editError, setEditError] = useState(null)

  // Delete confirmation modal state
  const [categoryToDelete, setCategoryToDelete] = useState(null)

  const triggerSaved = () => {
    setSavedIndicator(true)
    setTimeout(() => setSavedIndicator(false), 2000)
  }

  // Handle adding category
  const handleAddCategory = (e) => {
    e.preventDefault()
    const validation = validateCategoryName(newName, categories)
    if (!validation.isValid) {
      setAddError(validation.error)
      return
    }

    addCategory(validation.trimmedName, newColor)
    setNewName("")
    setAddError(null)
    // Rotate to next preset color
    const nextIdx =
      (CATEGORY_COLOR_PRESETS.indexOf(newColor) + 1) % CATEGORY_COLOR_PRESETS.length
    setNewColor(CATEGORY_COLOR_PRESETS[nextIdx])
    triggerSaved()
  }

  // Handle start editing
  const startEditing = (cat) => {
    setEditingId(cat.id)
    setEditName(cat.name)
    setEditError(null)
  }

  // Handle save editing
  const saveEditing = (id) => {
    const validation = validateCategoryName(editName, categories, id)
    if (!validation.isValid) {
      setEditError(validation.error)
      return
    }

    updateCategory(id, { name: validation.trimmedName })
    setEditingId(null)
    setEditError(null)
    triggerSaved()
  }

  // Handle key press during rename
  const handleEditKeyDown = (e, id) => {
    if (e.key === "Enter") {
      e.preventDefault()
      saveEditing(id)
    } else if (e.key === "Escape") {
      setEditingId(null)
      setEditError(null)
    }
  }

  // Handle color change
  const handleColorChange = (id, color) => {
    updateCategory(id, { color })
    triggerSaved()
  }

  // Handle delete request
  const requestDelete = (cat) => {
    const taskCount = getTaskCountForCategory(cat.id)
    if (taskCount > 0) {
      // Need confirmation dialog
      setCategoryToDelete({ ...cat, taskCount })
    } else {
      deleteCategory(cat.id)
      triggerSaved()
    }
  }

  const confirmDelete = () => {
    if (categoryToDelete) {
      deleteCategory(categoryToDelete.id)
      setCategoryToDelete(null)
      triggerSaved()
    }
  }

  return (
    <div className="theme-card squircle-2xl p-5 sm:p-7 relative overflow-hidden flex flex-col justify-between h-full border border-white/10 shadow-xl">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 squircle-md bg-[#0A6CFF]/15 border border-[#0A6CFF]/25 flex items-center justify-center text-[#3b82f6]">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Task Categories
            </h2>
          </div>

          {/* Autosave indicator */}
          {savedIndicator && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 squircle-sm border border-emerald-500/20 animate-smooth-pop">
              <Check className="w-3 h-3 stroke-[3]" />
              Saved
            </span>
          )}
        </div>

        <p className="text-xs text-zinc-400 mb-5">
          Categories you create here appear when you add a new task.
        </p>

        {/* Categories List */}
        <div className="flex flex-col gap-2 max-h-[340px] overflow-y-auto pr-1">
          {categories.length === 0 ? (
            <div className="py-8 text-center squircle-xl border border-dashed border-white/10 p-6">
              <p className="text-xs text-zinc-400">
                No categories yet. Add one below to organise your tasks.
              </p>
            </div>
          ) : (
            categories.map((cat) => {
              const taskCount = getTaskCountForCategory(cat.id)
              const isEditing = editingId === cat.id

              return (
                <div
                  key={cat.id}
                  className="squircle-lg p-2.5 bg-[#141416]/70 border border-white/5 hover:border-white/10 flex items-center justify-between gap-3 transition-colors"
                >
                  {/* Left: Color swatch & Name */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <ColorSwatchPicker
                      color={cat.color}
                      onChange={(newCol) => handleColorChange(cat.id, newCol)}
                    />

                    {isEditing ? (
                      <div className="flex flex-col flex-1 min-w-0">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => handleEditKeyDown(e, cat.id)}
                          onBlur={() => saveEditing(cat.id)}
                          autoFocus
                          maxLength={20}
                          className="bg-[#1c1c1f] border border-[#0A6CFF] squircle-sm px-2 py-1 text-xs text-white focus:outline-none w-full"
                        />
                        {editError && (
                          <span className="text-[10px] text-rose-400 mt-0.5">
                            {editError}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => startEditing(cat)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            startEditing(cat)
                          }
                        }}
                        title="Click to rename"
                        className="flex items-center gap-2 group/edit cursor-pointer min-w-0 flex-1 truncate"
                      >
                        <span className="text-xs sm:text-sm font-medium text-zinc-200 group-hover/edit:text-white truncate">
                          {cat.name}
                        </span>
                        <Edit2 className="w-3 h-3 text-zinc-500 opacity-0 group-hover/edit:opacity-100 transition-opacity flex-shrink-0" />
                      </div>
                    )}
                  </div>

                  {/* Right: Task Count & Delete button */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[11px] font-medium text-zinc-400 px-2 py-0.5 squircle-sm bg-white/5">
                      {taskCount} {taskCount === 1 ? "task" : "tasks"}
                    </span>

                    <button
                      type="button"
                      onClick={() => requestDelete(cat)}
                      title={`Delete category ${cat.name}`}
                      aria-label={`Delete category ${cat.name}`}
                      className="squircle-sm p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors focus:outline-none focus:ring-1 focus:ring-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Bottom Section: Add Category Form */}
      <form onSubmit={handleAddCategory} className="mt-5 pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          {/* Color picker for new category */}
          <ColorSwatchPicker color={newColor} onChange={setNewColor} />

          {/* Name input */}
          <input
            type="text"
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value)
              if (addError) setAddError(null)
            }}
            placeholder="New category name..."
            maxLength={20}
            className="flex-1 bg-[#141416] border border-white/10 hover:border-white/20 squircle-md px-3 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#0A6CFF] transition-all"
          />

          {/* Add button */}
          <button
            type="submit"
            disabled={!newName.trim() || categories.length >= 12}
            className="squircle-md px-3.5 py-2 bg-[#0A6CFF] hover:bg-[#005ae0] disabled:bg-white/5 disabled:text-zinc-500 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-[#0A6CFF]/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>

        {addError && (
          <p className="text-[11px] text-rose-400 mt-1.5 ml-9">{addError}</p>
        )}
      </form>

      {/* Confirmation Dialog when deleting a category with attached tasks */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-modal-backdrop">
          <div className="squircle-2xl bg-[#1c1c1f] border border-white/10 p-6 max-w-sm w-full shadow-2xl animate-smooth-pop flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 squircle-md bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400 flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  Delete "{categoryToDelete.name}"?
                </h3>
                <p className="text-xs text-zinc-300 mt-1">
                  <strong className="text-amber-400 font-bold">
                    {categoryToDelete.taskCount}{" "}
                    {categoryToDelete.taskCount === 1 ? "task uses" : "tasks use"}
                  </strong>{" "}
                  this category. They will become{" "}
                  <span className="text-zinc-100 font-medium">Uncategorized</span>.
                </p>
                <p className="text-[11px] text-zinc-500 mt-1">
                  The tasks themselves will NOT be deleted.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="squircle-md px-3.5 py-1.5 text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="squircle-md px-3.5 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors shadow-lg shadow-rose-950/40"
              >
                Remove Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
