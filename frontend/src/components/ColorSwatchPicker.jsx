import React, { useState, useRef, useEffect } from "react"
import { Check } from "lucide-react"
import { CATEGORY_COLOR_PRESETS } from "../lib/profileHelpers.js"

export function ColorSwatchPicker({ color, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

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
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Pick category color"
        aria-expanded={isOpen}
        title="Change color"
        className="w-7 h-7 squircle-sm border border-white/20 transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#0A6CFF] flex items-center justify-center shadow-sm"
        style={{ backgroundColor: color }}
      >
        <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
      </button>

      {isOpen && (
        <div className="squircle-lg absolute left-0 bottom-full mb-2 p-2.5 bg-[#1c1c1f] border border-white/10 shadow-2xl z-50 w-44 grid grid-cols-5 gap-2 animate-smooth-pop">
          {CATEGORY_COLOR_PRESETS.map((c) => {
            const isSelected = c.toLowerCase() === color.toLowerCase()
            return (
              <button
                key={c}
                type="button"
                onClick={() => {
                  onChange(c)
                  setIsOpen(false)
                }}
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/40 ${
                  isSelected ? "ring-2 ring-white scale-105" : ""
                }`}
                style={{ backgroundColor: c }}
              >
                {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
