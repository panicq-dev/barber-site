import { useState } from "react"
import { useApp } from "../context/AppContext"
import ScreenLayout from "../components/ScreenLayout"
import StepIndicator from "../components/StepIndicator"
import Button from "../components/Button"
import { SEED_BARBERS, SEED_PRODUCTS, ADDITIONAL_PRODUCTS } from "../lib/seed"
import { formatDate, formatPhone, formatPrice } from "../lib/format"

export default function Confirmation() {
  const { bookingDraft, timeSlots, submitBooking, navigate } = useApp()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const barber = SEED_BARBERS.find((b) => b.id === bookingDraft.barberId)
  const product = SEED_PRODUCTS.find((p) => p.id === bookingDraft.productId)
  const slot = timeSlots.find((s) => s.id === bookingDraft.slotId)
  const extras = ADDITIONAL_PRODUCTS.filter((a) =>
    bookingDraft.additionalProductIds?.includes(a.id),
  )

  const basePrice = (product?.price ?? 0) * (barber?.priceMultiplier ?? 1)
  const extraTotal = extras.reduce((sum, e) => sum + e.price * (barber?.priceMultiplier ?? 1), 0)
  const total = basePrice + extraTotal

  async function handleSubmit() {
    setLoading(true)
    setError("")
    try {
      await submitBooking()
      navigate("booking-success")
    } catch (e) {
      setError("Erro ao enviar solicitação. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const rowClass = "flex justify-between items-baseline py-3 border-b border-[rgba(240,237,232,0.08)]"
  const labelClass = "text-[rgba(240,237,232,0.4)] text-xs tracking-widest uppercase"
  const valueClass = "text-[#f0ede8] text-sm"

  return (
    <ScreenLayout>
      <div className="pt-8">
        <StepIndicator current={5} />

        <div className="mb-8 anim-fade-up stagger-1">
          <p
            className="text-[10px] tracking-[0.4em] text-[rgba(240,237,232,0.4)] uppercase mb-2"
            style={{ fontFamily: "DM Mono, monospace" }}
          >
            Etapa 6 — 6
          </p>
          <h2 className="font-display text-4xl text-[#f0ede8]">Confirmar</h2>
          <p className="text-[rgba(240,237,232,0.45)] mt-2 text-sm">
            Revise os detalhes do seu agendamento.
          </p>
        </div>

        <div className="border border-[rgba(240,237,232,0.12)] p-6 space-y-0 anim-fade-up stagger-2">
          <div className={rowClass}>
            <span className={labelClass} style={{ fontFamily: "DM Mono, monospace" }}>Cliente</span>
            <span className={valueClass}>{bookingDraft.clientName}</span>
          </div>
          <div className={rowClass}>
            <span className={labelClass} style={{ fontFamily: "DM Mono, monospace" }}>Telefone</span>
            <span className={valueClass} style={{ fontFamily: "DM Mono, monospace" }}>
              {formatPhone(bookingDraft.phoneDD ?? "", bookingDraft.phoneNumber ?? "")}
            </span>
          </div>
          <div className={rowClass}>
            <span className={labelClass} style={{ fontFamily: "DM Mono, monospace" }}>E-mail</span>
            <span className={valueClass}>{bookingDraft.email}</span>
          </div>
          <div className={rowClass}>
            <span className={labelClass} style={{ fontFamily: "DM Mono, monospace" }}>Barbeiro</span>
            <span className={valueClass}>{barber?.name}</span>
          </div>
          <div className={rowClass}>
            <span className={labelClass} style={{ fontFamily: "DM Mono, monospace" }}>Serviço</span>
            <span className={valueClass}>{product?.name}</span>
          </div>
          {extras.length > 0 && (
            <div className={rowClass}>
              <span className={labelClass} style={{ fontFamily: "DM Mono, monospace" }}>Adicionais</span>
              <span className={`${valueClass} text-right`}>{extras.map((e) => e.name).join(", ")}</span>
            </div>
          )}
          {slot && (
            <>
              <div className={rowClass}>
                <span className={labelClass} style={{ fontFamily: "DM Mono, monospace" }}>Data</span>
                <span className={valueClass}>{formatDate(slot.date)}</span>
              </div>
              <div className={rowClass}>
                <span className={labelClass} style={{ fontFamily: "DM Mono, monospace" }}>Horário</span>
                <span className={valueClass} style={{ fontFamily: "DM Mono, monospace" }}>{slot.time}</span>
              </div>
            </>
          )}
          <div className="flex justify-between items-baseline pt-4 mt-2">
            <span
              className="text-[rgba(240,237,232,0.5)] text-xs tracking-widest uppercase"
              style={{ fontFamily: "DM Mono, monospace" }}
            >
              Total estimado
            </span>
            <span
              className="text-[#f0ede8] text-2xl"
              style={{ fontFamily: "DM Mono, monospace" }}
            >
              {formatPrice(total)}
            </span>
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-sm mt-4 text-center">{error}</p>
        )}

        <div className="mt-8 anim-fade-up stagger-5">
          <p className="text-[rgba(240,237,232,0.3)] text-xs text-center mb-5 leading-relaxed">
            Ao confirmar, sua solicitação será enviada para análise. Você será notificado após aprovação.
          </p>
          <Button size="lg" onClick={handleSubmit} loading={loading} className="w-full">
            Enviar solicitação
          </Button>
        </div>
      </div>
    </ScreenLayout>
  )
}
