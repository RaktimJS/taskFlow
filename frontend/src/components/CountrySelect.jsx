import React, { useState, useRef, useEffect } from "react"
import { ChevronDown, Search, Check, X } from "lucide-react"
import { COUNTRIES } from "../lib/countries.js"

export function CountrySelect({ value, onChange, id = "country-select" }) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const containerRef = useRef(null)
  const searchInputRef = useRef(null)

  const selectedCountry = COUNTRIES.find((c) => c.name === value || c.code === value) || null

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  const filtered = COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase().trim())
  )

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Combobox Trigger */}
      <button
        id={id}
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={() => {
          setIsOpen(!isOpen)
          setSearch("")
        }}
        className="squircle-md w-full flex items-center justify-between px-3.5 py-2.5 bg-[#141416] border border-white/10 hover:border-white/20 text-xs sm:text-sm text-left transition-colors focus:outline-none focus:ring-2 focus:ring-[#0A6CFF]"
      >
        <span className={selectedCountry ? "text-zinc-200 truncate font-medium" : "text-zinc-500"}>
          {selectedCountry ? selectedCountry.name : "Select your country"}
        </span>
        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          {selectedCountry && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation()
                onChange("")
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation()
                  onChange("")
                }
              }}
              aria-label="Clear country selection"
              className="p-0.5 text-zinc-400 hover:text-zinc-200"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown className="w-4 h-4 text-zinc-400" />
        </div>
      </button>

      {/* Dropdown with live search */}
      {isOpen && (
        <div className="squircle-lg absolute left-0 top-full mt-1.5 w-full bg-[#1c1c1f] border border-white/10 shadow-2xl py-2 z-50 animate-smooth-pop">
          {/* Search Input Box */}
          <div className="px-2.5 pb-2">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country..."
                className="w-full bg-[#141416] border border-white/10 squircle-sm pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#0A6CFF]"
              />
            </div>
          </div>

          {/* Countries list */}
          <div className="max-h-52 overflow-y-auto" role="listbox">
            {filtered.length === 0 ? (
              <div className="px-3.5 py-3 text-xs text-zinc-500 text-center">
                No countries found
              </div>
            ) : (
              filtered.map((c) => {
                const isSelected = selectedCountry?.name === c.name
                return (
                  <button
                    key={c.code}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(c.name)
                      setIsOpen(false)
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-1.5 text-xs text-left transition-colors ${
                      isSelected
                        ? "bg-[#0A6CFF]/20 text-[#3b82f6] font-medium"
                        : "text-zinc-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span>{c.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#0A6CFF] flex-shrink-0" />}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
