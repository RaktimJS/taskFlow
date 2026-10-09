import React, { useState, useRef, useEffect } from "react"
import { ChevronDown, Check } from "lucide-react"
import { useApp } from "../context/AppContext.jsx"

export function CategorySelect({ value, onChange }) {
  const { categories } = useApp()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  const selectedCategory = categories.find((c) => c.id === value) || null

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="squircle-md w-full flex items-center justify-between px-3.5 py-2.5 bg-[#141416] border border-white/10 hover:border-white/20 text-xs sm:text-sm text-left transition-colors focus:outline-none focus:ring-2 focus:ring-[#0A6CFF]"
      >
        <div className="flex items-center gap-2 min-w-0">
          {selectedCategory ? (
            <>
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: selectedCategory.color }}
              />
              <span className="text-zinc-200 truncate font-medium">
                {selectedCategory.name}
              </span>
            </>
          ) : (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-600 flex-shrink-0" />
              <span className="text-zinc-400">Uncategorized</span>
            </>
          )}
        </div>
        <ChevronDown className="w-4 h-4 text-zinc-400 flex-shrink-0 ml-2" />
      </button>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="squircle-lg absolute left-0 top-full mt-1.5 w-full bg-[#1c1c1f] border border-white/10 shadow-2xl py-1.5 z-50 max-h-56 overflow-y-auto animate-smooth-pop">
          {/* Default Uncategorized option */}
          <button
            type="button"
            onClick={() => {
              onChange("")
              setIsOpen(false)
            }}
            className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-left text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-zinc-600" />
              <span>Uncategorized</span>
            </div>
            {!value && <Check className="w-3.5 h-3.5 text-[#0A6CFF]" />}
          </button>

          {/* User Categories */}
          {categories.map((cat) => {
            const isSelected = cat.id === value
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  onChange(cat.id)
                  setIsOpen(false)
                }}
                className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-left text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="truncate">{cat.name}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#0A6CFF] flex-shrink-0" />}
              </button>
            )
          })}

          {categories.length === 0 && (
            <div className="px-3.5 py-2 text-xs text-zinc-500 italic">
              No categories yet.{" "}
              <a
                href="#/profile"
                className="text-[#0A6CFF] hover:underline"
                onClick={() => setIsOpen(false)}
              >
                Create one in Profile
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
