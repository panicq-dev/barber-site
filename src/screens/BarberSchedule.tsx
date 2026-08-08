import { useMemo } from "react"
import { useApp } from "../context/AppContext"
import Button from "../components/Button"
import { SEED_PRODUCTS, ADDITIONAL_PRODUCTS, SEED_BARBERS } from "../lib/seed"
import { formatDateLong, formatPrice } from "../lib/format"

export default function BarberSchedule() {
  const { requests, timeSlots, authSession, logout } = useApp()

  const barberId = authSession?.type === "barber" ? authSession.barberId : null
  const barberName = authSession?.type === "barber" ? authSession.barberName : "Barbeiro"

  const myRequests = useMemo(
    () => requests.filter((r) => r.barberId === barberId && r.status === "approved"),
    [requests, barberId],
  )

  const todayIso = new Date().toISOString().split("T")[0]
  const thisMonth = todayIso.slice(0, 7)

  // Revenue calculations
  function getRevenue(reqs: typeof myRequests) {
    return reqs.reduce((sum, r) => {
      const product = SEED_PRODUCTS.find((p) => p.id === r.productId)
      const productPrice = product?.price ?? 0
      const extras = ADDITIONAL_PRODUCTS.filter((a) => r.additionalProductIds.includes(a.id))
      const extraPrice = extras.reduce((s, e) => s + e.price, 0)
      const barber = SEED_BARBERS.find((b) => b.id === r.barberId)
      const mult = barber?.priceMultiplier ?? 1
      const base = productPrice + extraPrice
      return sum + base * mult
    }, 0)
  }

  const todayRequests = myRequests.filter((r) => {
    const slot = timeSlots.find((s) => s.id === r.slotId)
    return slot?.date === todayIso
  })

  const monthRequests = myRequests.filter((r) => {
    const slot = timeSlots.find((s) => s.id === r.slotId)
    return slot?.date?.startsWith(thisMonth)
  })

  const todayRevenue = getRevenue(todayRequests)
  const monthRevenue = getRevenue(monthRequests)
  const commission = monthRevenue * 0.2

  // Group by date
  const byDate: Record<string, typeof myRequests> = {}
  myRequests.forEach((r) => {
    const slot = timeSlots.find((s) => s.id === r.slotId)
    const date = slot?.date ?? "sem-data"
    byDate[date] = byDate[date] ? [...byDate[date], r] : [r]
  })
  const sortedDates = Object.keys(byDate).sort()

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col">
      {/* Header */}
      <div className="border-b border-[rgba(240,237,232,0.08)] px-6 py-4 flex items-center justify-between">
        <div>
          <div
            className="text-[10px] tracking-[0.4em] text-[rgba(240,237,232,0.35)] uppercase"
            style={{ fontFamily: "DM Mono, monospace" }}
          >
            Agenda do barbeiro
          </div>
          <h1
            className="font-display text-xl text-[#f0ede8]"
            style={{ fontFamily: "DM Serif Display, Georgia, serif" }}
          >
            {barberName}
          </h1>
        </div>
        <Button variant="ghost" size="sm" onClick={logout}>
          Sair
        </Button>
      </div>

      <div className="flex-1 p-6 max-w-2xl mx-auto w-full">
        {/* Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 anim-fade-up">
          {[
            ["Faturamento hoje", formatPrice(todayRevenue)],
            ["Faturamento mês", formatPrice(monthRevenue)],
            ["Comissão (20%)", formatPrice(commission)],
            ["Total aprovados", String(myRequests.length)],
          ].map(([label, value]) => (
            <div key={label} className="border border-[rgba(240,237,232,0.1)] p-4">
              <div
                className="text-[10px] tracking-widest text-[rgba(240,237,232,0.35)] uppercase mb-2"
                style={{ fontFamily: "DM Mono, monospace" }}
              >
                {label}
              </div>
              <div
                className="text-xl text-[#f0ede8]"
                style={{ fontFamily: "DM Mono, monospace" }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Agenda */}
        {sortedDates.length === 0 ? (
          <div className="text-center py-20 border border-[rgba(240,237,232,0.08)] text-[rgba(240,237,232,0.25)] text-sm">
            Nenhum agendamento aprovado.
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map((date, di) => (
              <div key={date} className="anim-fade-up" style={{ animationDelay: `${di * 0.06}s` }}>
                <div
                  className="text-[10px] tracking-[0.35em] text-[rgba(240,237,232,0.4)] uppercase mb-3 pb-2 border-b border-[rgba(240,237,232,0.08)]"
                  style={{ fontFamily: "DM Mono, monospace" }}
                >
                  {date === todayIso ? "Hoje — " : ""}
                  {formatDateLong(date)}
                </div>
                <div className="space-y-2">
                  {byDate[date]
                    .sort((a, b) => {
                      const sa = timeSlots.find((s) => s.id === a.slotId)?.time ?? ""
                      const sb = timeSlots.find((s) => s.id === b.slotId)?.time ?? ""
                      return sa.localeCompare(sb)
                    })
                    .map((req) => {
                      const slot = timeSlots.find((s) => s.id === req.slotId)
                      const product = SEED_PRODUCTS.find((p) => p.id === req.productId)
                      const resolvedProductName = req.serviceName || req.serviceLabel || product?.name || (req.productId ? req.productId : "Serviço")
                      const extras = ADDITIONAL_PRODUCTS.filter((a) =>
                        req.additionalProductIds.includes(a.id),
                      )
                      const extraItems = (req.additionalServiceNames?.length
                        ? req.additionalServiceNames
                            .map((name) => SEED_PRODUCTS.find((p) => p.name.toLowerCase() === name.toLowerCase()))
                            .filter((item): item is (typeof SEED_PRODUCTS)[number] => Boolean(item))
                        : extras)
                      const barber = SEED_BARBERS.find((b) => b.id === req.barberId)
                      const mult = barber?.priceMultiplier ?? 1
                      const productPrice = product?.price ?? 0
                      const extraPrice = extraItems.reduce((s, e) => s + e.price, 0)
                      const price = (productPrice + extraPrice) * mult
                      return (
                        <div
                          key={req.id}
                          className="flex items-center gap-4 border border-[rgba(240,237,232,0.1)] px-4 py-3 hover:border-[rgba(240,237,232,0.2)] transition-colors"
                        >
                          <div
                            className="text-[#f0ede8] text-sm w-12 flex-shrink-0"
                            style={{ fontFamily: "DM Mono, monospace" }}
                          >
                            {slot?.time ?? "—"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[#f0ede8] font-medium truncate">{req.clientName}</div>
                            <div
                              className="text-[rgba(240,237,232,0.4)] text-xs"
                              style={{ fontFamily: "DM Mono, monospace" }}
                            >
                              {resolvedProductName}
                              {extraItems.length > 0 ? ` + ${extraItems.map((e) => e.name).join(", ")}` : ""}
                            </div>
                          </div>
                          <div
                            className="text-[#f0ede8] text-sm flex-shrink-0"
                            style={{ fontFamily: "DM Mono, monospace" }}
                          >
                            {formatPrice(price)}
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
