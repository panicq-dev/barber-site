import { useState, useEffect } from "react"
import { useApp } from "../context/AppContext"
import ScreenLayout from "../components/ScreenLayout"
import StepIndicator from "../components/StepIndicator"
import Button from "../components/Button"
import CalendarPicker from "../components/CalendarPicker"
import { groupSlotsByDate, todayStr } from "../lib/format"
import { getAvailableDates } from "../lib/storage"

export default function TimeSlotSelection() {
  const { timeSlots, requests, bookingDraft, setBookingDraft, navigate } = useApp()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const today = todayStr()
  const [dbDates, setDbDates] = useState<string[]>([])

  const bookedSlotIds = new Set(requests.map((r) => r.slotId))

  const availableSlots = timeSlots.filter(
    (s) =>
      s.barberId === bookingDraft.barberId &&
      s.isActive &&
      s.date >= today &&
      !bookedSlotIds.has(s.id),
  )

  const grouped = groupSlotsByDate(availableSlots)
  // If there are barber-specific available slots, prefer them.
  // Otherwise fall back to listing any active dates from the DB so the calendar shows days.
  const barberDates = Object.keys(grouped).sort()
  const enabledDates = barberDates.length > 0 ? barberDates : dbDates

  useEffect(() => {
    let mounted = true
    getAvailableDates().then((d) => {
      if (mounted) setDbDates(d)
    }).catch(() => {
      if (mounted) setDbDates([])
    })
    return () => { mounted = false }
  }, [timeSlots])

  const daySlots = selectedDate ? (grouped[selectedDate] ?? []).sort((a, b) => a.time.localeCompare(b.time)) : []

  function handleSelect(slotId: string) {
    setBookingDraft({ slotId })
  }

  return (
    <ScreenLayout>
      <div className="pt-8">
        <StepIndicator current={4} />

        <div className="mb-8 anim-fade-up stagger-1">
          <p
            className="text-[10px] tracking-[0.4em] text-[rgba(240,237,232,0.4)] uppercase mb-2"
            style={{ fontFamily: "DM Mono, monospace" }}
          >
            Etapa 5 — 6
          </p>
          <h2 className="font-display text-4xl text-[#f0ede8]">Escolha o horário</h2>
          <p className="text-[rgba(240,237,232,0.45)] mt-2 text-sm">
            Selecione uma data disponível e o horário desejado.
          </p>
        </div>

        {enabledDates.length === 0 ? (
          <div className="text-center py-16 border border-[rgba(240,237,232,0.1)]">
            <p className="text-[rgba(240,237,232,0.35)] text-sm">
              Nenhum horário disponível para este barbeiro.
            </p>
            <p className="text-[rgba(240,237,232,0.2)] text-xs mt-2">
              Tente outro barbeiro ou aguarde novos horários.
            </p>
          </div>
        ) : (
          <>
            <div className="border border-[rgba(240,237,232,0.12)] p-5 mb-6 anim-fade-up stagger-2">
              <CalendarPicker
                enabledDates={enabledDates}
                selected={selectedDate}
                onSelect={setSelectedDate}
              />
            </div>

            {selectedDate && (
              <div className="anim-scale-in">
                <div
                  className="text-[10px] tracking-[0.35em] text-[rgba(240,237,232,0.4)] uppercase mb-3"
                  style={{ fontFamily: "DM Mono, monospace" }}
                >
                  Horários disponíveis
                </div>

                {!bookingDraft.barberId ? (
                  <div className="text-center py-6 border border-[rgba(240,237,232,0.06)] text-sm text-[rgba(240,237,232,0.35)]">
                    Selecione um barbeiro para ver horários detalhados deste dia.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {daySlots.map((slot) => {
                      const isSelected = bookingDraft.slotId === slot.id
                      return (
                        <button
                          key={slot.id}
                          onClick={() => handleSelect(slot.id)}
                          className={`
                          py-3 text-sm border transition-all duration-150
                          ${isSelected
                            ? "bg-[#f0ede8] text-[#080808] border-[#f0ede8] font-medium"
                            : "border-[rgba(240,237,232,0.2)] text-[#f0ede8] hover:border-[rgba(240,237,232,0.6)] hover:bg-[rgba(240,237,232,0.04)]"}
                        `}
                          style={{ fontFamily: "DM Mono, monospace" }}
                        >
                          {slot.time}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <div className="mt-10">
          <Button
            size="lg"
            onClick={() => navigate("confirmation")}
            disabled={!bookingDraft.slotId}
            className="w-full"
          >
            Revisar agendamento
          </Button>
        </div>
      </div>
    </ScreenLayout>
  )
}
