import React, { useEffect, useState } from "react"
import { RotateCcw, X, Trash2 } from "lucide-react"

export function Toast({ toast, onUndo, onDismiss }) {
  if (!toast) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
      <div className="squircle-xl bg-[#1c1c20] border border-white/15 shadow-2xl p-4 flex items-center gap-3.5 max-w-md text-sm text-white">
        <div className="w-8 h-8 squircle-md bg-rose-500/15 border border-rose-500/25 flex items-center justify-center text-rose-400 flex-shrink-0">
          <Trash2 className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0 pr-2">
          <p className="font-medium text-xs text-zinc-200 truncate">
            Task deleted: <span className="text-white font-semibold">"{toast.taskTitle}"</span>
          </p>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            You can restore it now
          </p>
        </div>

        <button
          onClick={onUndo}
          className="squircle-md flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#0A6CFF] hover:bg-[#005ae0] text-white shadow-md shadow-[#0A6CFF]/20 transition-all focus:outline-none focus:ring-2 focus:ring-[#0A6CFF]"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Undo</span>
        </button>

        <button
          onClick={onDismiss}
          aria-label="Dismiss toast"
          className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
