import React, { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { X, Calendar, Check, FolderPlus, AlertCircle, FileText, Tag } from "lucide-react"
import { CategorySelect } from "./CategorySelect.jsx"

export function TaskModal({ isOpen, onClose, onAddTask, initialDueDate = "" }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("medium")
  const [dueDate, setDueDate] = useState("")
  const [category, setCategory] = useState("")
  const [error, setError] = useState("")

  const inputRef = useRef(null)

  // Reset state and focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle("")
      setDescription("")
      setPriority("medium")
      setDueDate(initialDueDate || "")
      setCategory("")
      setError("")
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }, 80)
      return () => clearTimeout(timer)
    }
  }, [isOpen, initialDueDate])

  // Escape key handler
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    if (e) e.preventDefault()

    const trimmedTitle = title.trim()
    const trimmedCategory = category.trim()

    if (!trimmedTitle) {
      setError("Please enter a task title.")
      return
    }

    if (!dueDate) {
      setError("Please specify a due date.")
      return
    }

    try {
      onAddTask({
        title: trimmedTitle,
        description: description.trim(),
        priority,
        dueDate,
        category: trimmedCategory,
      })
      onClose()
    } catch (err) {
      setError(err.message || "Failed to create task.")
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      {/* Dark backdrop with smooth opacity fade */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm"
      />

      {/* Modal Card with smooth scale + vertical slide + opacity */}
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-lg theme-card squircle-2xl border border-white/10 shadow-2xl p-6 sm:p-8 overflow-hidden bg-[#18181b] z-10 my-auto"
      >
        {/* Radar Concentric Rings in top-center */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 pointer-events-none select-none">
          <div className="w-full h-full rounded-full border border-white/[0.04] animate-radar absolute inset-0" />
          <div className="w-48 h-48 rounded-full border border-white/[0.06] absolute inset-8" />
          <div className="w-32 h-32 rounded-full border border-[#0A6CFF]/15 absolute inset-16" />
        </div>

        {/* Close Button at top-right */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 squircle-md p-2 text-zinc-400 hover:text-white bg-[#141416]/70 hover:bg-[#25252a] border border-white/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0A6CFF]"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Centered Icon with subtle radial glow */}
        <div className="flex justify-center mb-3">
          <div className="relative w-14 h-14 squircle-xl bg-gradient-to-b from-[#2a2a30] to-[#1c1c20] border border-white/15 flex items-center justify-center text-white shadow-xl">
            <FolderPlus className="w-6 h-6 text-[#0A6CFF]" />
            <div className="absolute inset-0 bg-[#0A6CFF]/20 squircle-xl filter blur-lg -z-10" />
          </div>
        </div>

        {/* Modal Title & Subtitle */}
        <div className="text-center mb-6">
          <h2 id="modal-title" className="text-xl sm:text-2xl font-normal tracking-tight text-white">
            Create New Task
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-sm mx-auto">
            Define task details, assign priority, and set milestone deadlines.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Priority Segmented Control */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Priority Level
            </label>
            <div className="grid grid-cols-3 gap-1 p-1 bg-[#141416] border border-white/10 squircle-md">
              {[
                { id: "high", label: "High", activeBg: "bg-rose-500/20 border-rose-500/40 text-rose-300" },
                { id: "medium", label: "Medium", activeBg: "bg-amber-500/20 border-amber-500/40 text-amber-300" },
                { id: "low", label: "Low", activeBg: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300" },
              ].map((lvl) => {
                const isSelected = priority === lvl.id
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setPriority(lvl.id)}
                    className={`squircle-sm py-2 px-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 border ${
                      isSelected
                        ? `${lvl.activeBg} shadow-sm`
                        : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    <span>{lvl.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Title Input (Compulsory) */}
          <div>
            <label htmlFor="task-title" className="block text-xs font-medium text-zinc-400 mb-1.5">
              Task Title <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <FileText className="w-4 h-4" />
              </div>
              <input
                id="task-title"
                ref={inputRef}
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  if (error) setError("")
                }}
                placeholder="Enter task title..."
                className={`w-full pl-10 pr-4 py-2.5 text-sm bg-[#151518] border squircle-md text-white placeholder-zinc-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0A6CFF] focus:border-[#0A6CFF] ${
                  error && !title.trim()
                    ? "border-rose-500/60 ring-1 ring-rose-500/40"
                    : "border-white/10 hover:border-white/20"
                }`}
              />
            </div>
          </div>

          {/* Two-column row: Due Date (Compulsory) & Category (Compulsory) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Due Date Field */}
            <div>
              <label htmlFor="task-duedate" className="block text-xs font-medium text-zinc-400 mb-1.5">
                Due Date <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  id="task-duedate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => {
                    setDueDate(e.target.value)
                    if (error) setError("")
                  }}
                  className={`w-full pl-10 pr-3 py-2 text-xs bg-[#151518] border squircle-md text-white focus:outline-none focus:ring-2 focus:ring-[#0A6CFF] transition-all duration-200 scheme-dark ${
                    error && !dueDate
                      ? "border-rose-500/60 ring-1 ring-rose-500/40"
                      : "border-white/10 hover:border-white/20"
                  }`}
                />
              </div>
            </div>

            {/* Category Field */}
            <div>
              <label htmlFor="task-category" className="block text-xs font-medium text-zinc-400 mb-1.5">
                Category <span className="text-zinc-500 font-normal">(Optional)</span>
              </label>
              <CategorySelect
                value={category}
                onChange={(catId) => {
                  setCategory(catId)
                  if (error) setError("")
                }}
              />
            </div>
          </div>

          {/* Error Message banner if validation fails */}
          {error && (
            <div className="flex items-center gap-1.5 text-xs text-rose-400 p-2 squircle-sm bg-rose-500/10 border border-rose-500/20">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Description (Optional) */}
          <div>
            <label htmlFor="task-description" className="block text-xs font-medium text-zinc-400 mb-1.5">
              Description <span className="text-zinc-600 font-normal">(Optional)</span>
            </label>
            <textarea
              id="task-description"
              rows="2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add notes or acceptance criteria..."
              className="w-full px-3.5 py-2 text-xs bg-[#151518] border border-white/10 hover:border-white/20 squircle-md text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#0A6CFF] transition-all duration-200 resize-none"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-4 mt-6 border-t border-white/5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="squircle-md px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white bg-[#141416] hover:bg-[#202025] border border-white/10 transition-all duration-200"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="squircle-md px-6 py-2 text-xs sm:text-sm font-semibold text-white bg-[#0A6CFF] hover:bg-[#005ae0] active:bg-[#004cc0] shadow-lg shadow-[#0A6CFF]/30 transition-all duration-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#0A6CFF]"
            >
              <Check className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

