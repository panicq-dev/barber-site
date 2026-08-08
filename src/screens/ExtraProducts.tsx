import { useState } from "react"
import { useApp } from "../context/AppContext"
import ScreenLayout from "../components/ScreenLayout"
import StepIndicator from "../components/StepIndicator"
import Button from "../components/Button"
import { SEED_BARBERS, ADDITIONAL_PRODUCTS, ADDITIONAL_PRODUCT_OPTIONS } from "../lib/seed"
import { formatPrice } from "../lib/format"

export default function ExtraProducts() {
  const { bookingDraft, setBookingDraft, navigate } = useApp()
  const barber = SEED_BARBERS.find((b) => b.id === bookingDraft.barberId)
  const [selected, setSelected] = useState<string[]>(bookingDraft.additionalProductIds ?? [])

  const allowedIds = ADDITIONAL_PRODUCT_OPTIONS[bookingDraft.productId ?? ""] ?? []
  const allowed = ADDITIONAL_PRODUCTS.filter((p) => allowedIds.includes(p.id))

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  function handleNext() {
    setBookingDraft({ additionalProductIds: selected })
    navigate("time-slot-selection")
  }

  return (
    <ScreenLayout>
      <div className="pt-8">
        <StepIndicator current={3} />

        <div className="mb-8 anim-fade-up stagger-1">
          <p
            className="text-[10px] tracking-[0.4em] text-[rgba(240,237,232,0.4)] uppercase mb-2"
            style={{ fontFamily: "DM Mono, monospace" }}
          >
            Etapa 4 — 6
          </p>
          <h2 className="font-display text-4xl text-[#f0ede8]">Adicionais</h2>
          <p className="text-[rgba(240,237,232,0.45)] mt-2 text-sm">
            Complementos opcionais para o seu atendimento.
          </p>
        </div>

        {allowed.length === 0 ? (
          <div className="text-center py-12 border border-[rgba(240,237,232,0.1)] anim-fade-up stagger-2">
            <p className="text-[rgba(240,237,232,0.35)] text-sm">
              Nenhum adicional disponível para este serviço.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {allowed.map((extra, i) => {
              const price = extra.price * (barber?.priceMultiplier ?? 1)
              const isOn = selected.includes(extra.id)
              return (
                <button
                  key={extra.id}
                  onClick={() => toggle(extra.id)}
                  className={`
                    w-full text-left p-5 border transition-all duration-200 anim-fade-up
                    ${isOn
                      ? "border-[#f0ede8] bg-[rgba(240,237,232,0.05)]"
                      : "border-[rgba(240,237,232,0.15)] hover:border-[rgba(240,237,232,0.4)] hover:bg-[rgba(240,237,232,0.03)]"}
                    stagger-${i + 2}
                  `}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {/* Toggle box */}
                      <div
                        className={`w-5 h-5 flex-shrink-0 border transition-all duration-200 flex items-center justify-center ${isOn ? "bg-[#f0ede8] border-[#f0ede8]" : "border-[rgba(240,237,232,0.3)]"}`}
                      >
                        {isOn && (
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="#080808" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className="text-[#f0ede8] font-medium">{extra.name}</div>
                        <div className="text-[rgba(240,237,232,0.4)] text-sm mt-0.5">{extra.description}</div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div
                        className="text-[#f0ede8]"
                        style={{ fontFamily: "DM Mono, monospace" }}
                      >
                        +{formatPrice(price)}
                      </div>
                      <div
                        className="text-[rgba(240,237,232,0.3)] text-[10px] tracking-widest uppercase"
                        style={{ fontFamily: "DM Mono, monospace" }}
                      >
                        {extra.duration} min
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        <div className="mt-10 anim-fade-up stagger-6">
          <Button size="lg" onClick={handleNext} className="w-full">
            {selected.length > 0 ? `Continuar com ${selected.length} adicional${selected.length > 1 ? "is" : ""}` : "Continuar sem adicionais"}
          </Button>
        </div>
      </div>
    </ScreenLayout>
  )
}
