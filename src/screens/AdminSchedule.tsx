import { useState, useEffect } from "react"
import { useApp } from "../context/AppContext"
import Button from "../components/Button"
import CalendarPicker from "../components/CalendarPicker"
import { SEED_BARBERS, PRESET_TIMES, DB_BARBER_NAME_MAP } from "../lib/seed"
import { formatDate } from "../lib/format"
import type { TimeSlot } from "../lib/types"
import { getDistinctBarberIds } from "../lib/storage"

type Tab = "requests" | "schedule"

export default function AdminSchedule({ onTabChange }: { onTabChange: (t: Tab) => void }) {
  const { timeSlots, toggleSlot, removeSlot, removeDaySlots, addSlot, addFullDay, logout, loadData } = useApp()
  const [barbersList, setBarbersList] = useState(SEED_BARBERS)
  const [selectedBarber, setSelectedBarber] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [newTime, setNewTime] = useState("")
  const [addingTime, setAddingTime] = useState(false)

  const barberSlots = selectedBarber ? timeSlots.filter((s) => s.barberId === selectedBarber) : []
  const dayDates = [...new Set(barberSlots.map((s) => s.date))].sort()
  const daySlots = selectedDate
    ? barberSlots.filter((s) => s.date === selectedDate).sort((a, b) => a.time.localeCompare(b.time))
    : []

  // If selected date has slots for other barbers, expose quick-switch buttons
  const otherBarbersWithSlots = selectedDate
    ? Array.from(new Set(timeSlots.filter((s) => s.date === selectedDate).map((s) => s.barberId))).filter(
        (id) => id !== selectedBarber,
      )
    : []

  async function handleAddTime() {
    if (!selectedBarber || !selectedDate || !newTime) return
    const slot: TimeSlot = {
      id: `slot-${selectedBarber}-${selectedDate}-${newTime.replace(":", "")}`,
      barberId: selectedBarber,
      date: selectedDate,
      time: newTime,
      isActive: true,
    }
    await addSlot(slot)
    setNewTime("")
    setAddingTime(false)
  }

  async function handleAddFullDay() {
    if (!selectedBarber || !selectedDate) return
    await addFullDay(selectedBarber, selectedDate, PRESET_TIMES)
  }

  async function handleAddDayFromCalendar(date: string) {
    setSelectedDate(date)
    if (!selectedBarber) return
    await addFullDay(selectedBarber, date, PRESET_TIMES)
  }

  useEffect(() => {
    let mounted = true
    getDistinctBarberIds().then((ids) => {
      if (!mounted) return
      const existing = new Set(SEED_BARBERS.map((b) => b.id))
      const extras = ids.filter((id) => !existing.has(id)).map((id) => ({
        id,
        name: DB_BARBER_NAME_MAP[id] ?? id,
        instagram: "",
        priceMultiplier: 1,
        username: id,
        password: "",
      }))

      // Merge and deduplicate by display name. If a DB extra has the same
      // display name as a seeded barber, prefer the DB entry so the admin
      // selector points to the DB id (avoids creating duplicates with same name).
      const byName = new Map<string, typeof SEED_BARBERS[0]>()
      for (const s of SEED_BARBERS) byName.set(s.name, s)
      for (const e of extras) byName.set(e.name, e)
      const merged = Array.from(byName.values())
      setBarbersList(merged)
      // If no selected barber yet, pick first barber that has slots or the first merged
      if (!selectedBarber) {
        const barberWithSlots = ids.length > 0 ? ids[0] : merged[0].id
        setSelectedBarber(barberWithSlots)
      }
    }).catch(() => {
      if (!selectedBarber) setSelectedBarber(SEED_BARBERS[0].id)
    })
    return () => { mounted = false }
  }, [])

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col">
      {/* Top bar */}
      <div className="border-b border-[rgba(240,237,232,0.08)] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1
            className="font-display text-xl text-[#f0ede8]"
            style={{ fontFamily: "DM Serif Display, Georgia, serif" }}
          >
            Black &amp; Sharp
          </h1>
          <div className="flex items-center">
            <button
              onClick={() => onTabChange("requests")}
              className="px-4 py-2 text-xs tracking-widest uppercase text-[rgba(240,237,232,0.4)] hover:text-[rgba(240,237,232,0.7)] transition-colors"
              style={{ fontFamily: "DM Mono, monospace" }}
            >
              Solicitações
            </button>
            <button
              onClick={() => onTabChange("schedule")}
              className="px-4 py-2 text-xs tracking-widest uppercase border-b-2 border-[#f0ede8] text-[#f0ede8]"
              style={{ fontFamily: "DM Mono, monospace" }}
            >
              Horários
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => loadData()}>
            Atualizar
          </Button>
          <Button variant="ghost" size="sm" onClick={logout}>
            Sair
          </Button>
        </div>
      </div>

      <div className="flex-1 p-6 max-w-5xl mx-auto w-full">
        {/* Barber selector */}
        <div className="flex gap-2 mb-6 anim-fade-up">
          {barbersList.map((b) => (
            <button
              key={b.id}
              onClick={() => { setSelectedBarber(b.id); setSelectedDate(null) }}
              className={`px-4 py-2 text-sm border transition-colors ${
                selectedBarber === b.id
                  ? "border-[#f0ede8] text-[#f0ede8] bg-[rgba(240,237,232,0.05)]"
                  : "border-[rgba(240,237,232,0.15)] text-[rgba(240,237,232,0.5)] hover:border-[rgba(240,237,232,0.4)]"
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <div className="border border-[rgba(240,237,232,0.12)] p-5 anim-fade-up stagger-2">
            <p
              className="text-[10px] tracking-widest text-[rgba(240,237,232,0.35)] uppercase mb-4"
              style={{ fontFamily: "DM Mono, monospace" }}
            >
              Selecionar data — clique em dia vazio para adicionar dia completo
            </p>
            {/* Show calendar enabled dates as union of all timeslots so admin sees days
                that have slots even if current barber selection has none. */}
            {(() => {
              const allDates = [...new Set(timeSlots.map((s) => s.date))].sort()
              return (
                <CalendarPicker
                  enabledDates={allDates}
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  onAddDay={handleAddDayFromCalendar}
                />
              )
            })()}
          </div>

          {/* Day slots */}
          <div className="anim-fade-up stagger-3">
            {selectedDate ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p
                      className="text-[10px] tracking-widest text-[rgba(240,237,232,0.35)] uppercase"
                      style={{ fontFamily: "DM Mono, monospace" }}
                    >
                      {formatDate(selectedDate)}
                    </p>
                    <p className="text-[#f0ede8] text-sm mt-0.5">{daySlots.length} horário{daySlots.length !== 1 ? "s" : ""}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleAddFullDay}>
                      + Dia completo
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => { removeDaySlots(selectedBarber, selectedDate); setSelectedDate(null) }}
                    >
                      Excluir dia
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto scroll-area">
                  {daySlots.length === 0 && otherBarbersWithSlots.length > 0 ? (
                    <div className="p-4 text-sm text-[rgba(240,237,232,0.35)]">
                      Este dia tem horários para outros barbeiros:
                      <div className="flex gap-2 mt-2">
                        {otherBarbersWithSlots.map((id) => {
                          const b = barbersList.find((bb) => bb.id === id)
                          return (
                            <button
                              key={id}
                              onClick={() => { setSelectedBarber(id); }}
                              className="px-3 py-1.5 text-xs border"
                            >
                              {b?.name ?? id}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    <>
                      {daySlots.map((slot) => (
                        <div
                          key={slot.id}
                          className="flex items-center justify-between px-4 py-3 border border-[rgba(240,237,232,0.1)] transition-colors hover:border-[rgba(240,237,232,0.2)]"
                        >
                          <span
                            className={`text-sm ${slot.isActive ? "text-[#f0ede8]" : "text-[rgba(240,237,232,0.3)] line-through"}`}
                            style={{ fontFamily: "DM Mono, monospace" }}
                          >
                            {slot.time}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => toggleSlot(slot.id, slot.isActive)}
                              className={`text-[10px] tracking-widest uppercase px-2 py-1 border transition-colors ${
                                slot.isActive
                                  ? "border-[rgba(240,237,232,0.25)] text-[rgba(240,237,232,0.6)] hover:border-[rgba(240,237,232,0.5)]"
                                  : "border-[rgba(240,237,232,0.1)] text-[rgba(240,237,232,0.3)] hover:border-[rgba(240,237,232,0.3)]"
                              }`}
                              style={{ fontFamily: "DM Mono, monospace" }}
                            >
                              {slot.isActive ? "Desativar" : "Ativar"}
                            </button>
                            <button
                              onClick={() => removeSlot(slot.id)}
                              className="text-red-400 hover:text-red-300 transition-colors px-2 text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                {/* Add time */}
                {addingTime ? (
                  <div className="mt-3 flex gap-2 items-center">
                    <input
                      type="time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="bg-transparent border-b border-[rgba(240,237,232,0.3)] text-[#f0ede8] py-2 outline-none flex-1 text-sm"
                      style={{ fontFamily: "DM Mono, monospace" }}
                    />
                    <Button size="sm" onClick={handleAddTime}>Adicionar</Button>
                    <Button variant="ghost" size="sm" onClick={() => setAddingTime(false)}>✕</Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAddingTime(true)}
                    className="mt-3 text-[rgba(240,237,232,0.5)]"
                  >
                    + Adicionar horário
                  </Button>
                )}
              </>
            ) : (
              <div className="border border-[rgba(240,237,232,0.08)] p-8 text-center text-[rgba(240,237,232,0.3)] text-sm h-full flex items-center justify-center">
                Selecione uma data no calendário
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
