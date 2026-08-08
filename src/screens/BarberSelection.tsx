import { useApp } from "../context/AppContext"
import ScreenLayout from "../components/ScreenLayout"
import StepIndicator from "../components/StepIndicator"
import Button from "../components/Button"
import { SEED_BARBERS } from "../lib/seed"
import { todayStr } from "../lib/format"

export default function BarberSelection() {
  const { timeSlots, requests, bookingDraft, setBookingDraft, navigate } = useApp()
  const today = todayStr()

  function getAvailableCount(barberId: string): number {
    const bookedSlotIds = new Set(requests.map((r) => r.slotId))
    return timeSlots.filter(
      (s) =>
        s.barberId === barberId &&
        s.isActive &&
        s.date >= today &&
        !bookedSlotIds.has(s.id),
    ).length
  }

  function handleSelect(barberId: string) {
    setBookingDraft({ barberId, slotId: undefined })
    navigate("product-selection")
  }

  return (
    <ScreenLayout>
      <div className="pt-8">
        <StepIndicator current={1} />

        <div className="mb-8 anim-fade-up stagger-1">
          <p
            className="text-[10px] tracking-[0.4em] text-[rgba(240,237,232,0.4)] uppercase mb-2"
            style={{ fontFamily: "DM Mono, monospace" }}
          >
            Etapa 2 — 6
          </p>
          <h2 className="font-display text-4xl text-[#f0ede8]">Escolha o barbeiro</h2>
          <p className="text-[rgba(240,237,232,0.45)] mt-2 text-sm">
            Selecione o profissional para o seu atendimento.
          </p>
        </div>

        <div className="space-y-3">
          {SEED_BARBERS.map((barber, i) => {
            const count = getAvailableCount(barber.id)
            const isSelected = bookingDraft.barberId === barber.id
            return (
              <button
                key={barber.id}
                onClick={() => handleSelect(barber.id)}
                className={`
                  w-full text-left p-5 border transition-all duration-200 anim-fade-up
                  ${isSelected
                    ? "border-[#f0ede8] bg-[rgba(240,237,232,0.05)]"
                    : "border-[rgba(240,237,232,0.15)] hover:border-[rgba(240,237,232,0.4)] hover:bg-[rgba(240,237,232,0.03)]"}
                  stagger-${i + 2}
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[#f0ede8] font-medium text-lg">{barber.name}</div>
                    <div
                      className="text-[rgba(240,237,232,0.4)] text-xs mt-0.5"
                      style={{ fontFamily: "DM Mono, monospace" }}
                    >
                      {barber.instagram}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-2xl font-medium ${count > 0 ? "text-[#f0ede8]" : "text-[rgba(240,237,232,0.3)]"}`}
                      style={{ fontFamily: "DM Mono, monospace" }}
                    >
                      {count}
                    </div>
                    <div
                      className="text-[10px] tracking-widest text-[rgba(240,237,232,0.35)] uppercase"
                      style={{ fontFamily: "DM Mono, monospace" }}
                    >
                      horários
                    </div>
                  </div>
                </div>
                {barber.priceMultiplier > 1 && (
                  <div
                    className="mt-3 text-[10px] tracking-widest text-[rgba(240,237,232,0.3)] uppercase"
                    style={{ fontFamily: "DM Mono, monospace" }}
                  >
                    +{Math.round((barber.priceMultiplier - 1) * 100)}% nos preços
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </ScreenLayout>
  )
}
