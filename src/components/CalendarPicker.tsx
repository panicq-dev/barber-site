import { useState } from "react"
import { todayStr } from "../lib/format"

interface CalendarPickerProps {
  enabledDates: string[]
  selected: string | null
  onSelect: (date: string) => void
  onAddDay?: (date: string) => void
}

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

export default function CalendarPicker({ enabledDates, selected, onSelect, onAddDay }: CalendarPickerProps) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const todayIso = todayStr()

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="w-8 h-8 flex items-center justify-center border border-[rgba(240,237,232,0.15)] hover:border-[rgba(240,237,232,0.4)] transition-colors text-[#f0ede8]"
        >
          ‹
        </button>
        <span className="font-display text-base text-[#f0ede8]">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center border border-[rgba(240,237,232,0.15)] hover:border-[rgba(240,237,232,0.4)] transition-colors text-[#f0ede8]"
        >
          ›
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] tracking-widest text-[rgba(240,237,232,0.35)]"
            style={{ fontFamily: "DM Mono, monospace" }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`e${idx}`} />
          const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
          const enabled = enabledDates.includes(iso)
          const isSelected = selected === iso
          const isPast = iso < todayIso
          const isToday = iso === todayIso

          return (
            <button
              key={iso}
              disabled={!enabled && !onAddDay}
              onClick={() => {
                if (enabled) onSelect(iso)
                else if (onAddDay && !isPast) onAddDay(iso)
              }}
              className={`
                aspect-square flex items-center justify-center text-xs transition-all duration-150
                ${isSelected ? "bg-[#f0ede8] text-[#080808] font-semibold" : ""}
                ${enabled && !isSelected ? "border border-[rgba(240,237,232,0.25)] text-[#f0ede8] hover:border-[rgba(240,237,232,0.6)] hover:bg-[rgba(240,237,232,0.05)]" : ""}
                ${!enabled && onAddDay && !isPast ? "border border-dashed border-[rgba(240,237,232,0.1)] text-[rgba(240,237,232,0.2)] hover:border-[rgba(240,237,232,0.3)] hover:text-[rgba(240,237,232,0.5)]" : ""}
                ${!enabled && (!onAddDay || isPast) ? "text-[rgba(240,237,232,0.15)] cursor-default" : "cursor-pointer"}
                ${isToday && !isSelected ? "ring-1 ring-[rgba(240,237,232,0.4)]" : ""}
              `}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}
