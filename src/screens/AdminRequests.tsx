import { useState, useMemo } from "react"
import { useApp } from "../context/AppContext"
import Button from "../components/Button"
import { SEED_BARBERS, SEED_PRODUCTS, ADDITIONAL_PRODUCTS, DB_BARBER_NAME_MAP } from "../lib/seed"
import { formatDate, formatPrice } from "../lib/format"
import type { BookingRequest } from "../lib/types"

type Tab = "requests" | "schedule"
type StatusFilter = "all" | "pending" | "approved" | "rejected"

export default function AdminRequests({ onTabChange }: { onTabChange: (t: Tab) => void }) {
  const { requests, approveRequest, rejectRequest, removeRequest, editRequestExtras, clearAll, logout } = useApp()
  const [filter, setFilter] = useState<StatusFilter>("all")
  const [editing, setEditing] = useState<string | null>(null)
  const [editExtras, setEditExtras] = useState<string[]>([])
  const [confirmClear, setConfirmClear] = useState(false)

  const filtered = useMemo(() =>
    filter === "all" ? requests : requests.filter((r) => r.status === filter),
    [requests, filter]
  )

  function parseSlotId(slotId: string) {
    const match = slotId.match(/^slot-(?:.+?)-(\d{4}-\d{2}-\d{2})-(\d{4})$/)
    if (!match) return null
    const [, date, time] = match
    return { date, time: `${time.slice(0, 2)}:${time.slice(2)}` }
  }

  // Metrics
  const approved = requests.filter((r) => r.status === "approved")
  const totalRevenue = approved.reduce((sum, r) => {
    const barberObj = SEED_BARBERS.find((b) => b.id === r.barberId)
    const product = SEED_PRODUCTS.find((p) => p.id === r.productId)
    const extras = ADDITIONAL_PRODUCTS.filter((a) => r.additionalProductIds.includes(a.id))
    const mult = barberObj?.priceMultiplier ?? 1
    return sum + (product?.price ?? 0) * mult + extras.reduce((s, e) => s + e.price * mult, 0)
  }, 0)

  const avgTicket = approved.length > 0 ? totalRevenue / approved.length : 0

  // Peak hours
  const hourCounts: Record<string, number> = {}
  approved.forEach((r) => {
    // find slot time from timeSlots — but we only have slotId; use first 2 chars as hour approx
    const hour = r.slotId.split("-").pop()?.slice(0, 2) ?? "?"
    hourCounts[hour] = (hourCounts[hour] ?? 0) + 1
  })
  const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—"

  function exportCSV() {
    const headers = ["ID", "Cliente", "Telefone", "Email", "Barbeiro", "Serviço", "Adicionais", "Data", "Horário", "Valor", "Status", "Data criação"]
    const rows = requests.map((r) => {
      const barber = SEED_BARBERS.find((b) => b.id === r.barberId)
      const product = SEED_PRODUCTS.find((p) => p.id === r.productId)
      const extras = ADDITIONAL_PRODUCTS.filter((a) => r.additionalProductIds.includes(a.id))
      const mult = barber?.priceMultiplier ?? 1
      const price = (product?.price ?? 0) * mult + extras.reduce((s, e) => s + e.price * mult, 0)
      const slotInfo = parseSlotId(r.slotId)
      return [
        r.id,
        r.clientName,
        `(${r.phoneDD}) ${r.phoneNumber}`,
        r.email,
        barber?.name ?? r.barberId,
        product?.name ?? r.productId,
        extras.map((e) => e.name).join("; "),
        slotInfo ? formatDate(slotInfo.date) : "",
        slotInfo ? slotInfo.time : "",
        formatPrice(price),
        r.status,
        new Date(r.createdAt).toLocaleString("pt-BR"),
      ]
    })
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "solicitacoes.csv"
    a.click()
  }

  function startEdit(req: BookingRequest) {
    setEditing(req.id)
    setEditExtras(req.additionalProductIds)
  }

  async function saveEdit() {
    if (!editing) return
    await editRequestExtras(editing, editExtras)
    setEditing(null)
  }

  const statusColor: Record<string, string> = {
    pending: "text-amber-400 border-amber-900",
    approved: "text-emerald-400 border-emerald-900",
    rejected: "text-red-400 border-red-900",
  }
  const statusLabel: Record<string, string> = {
    pending: "Pendente",
    approved: "Aprovado",
    rejected: "Recusado",
  }

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
              className="px-4 py-2 text-xs tracking-widest uppercase border-b-2 border-[#f0ede8] text-[#f0ede8]"
              style={{ fontFamily: "DM Mono, monospace" }}
            >
              Solicitações
            </button>
            <button
              onClick={() => onTabChange("schedule")}
              className="px-4 py-2 text-xs tracking-widest uppercase text-[rgba(240,237,232,0.4)] hover:text-[rgba(240,237,232,0.7)] transition-colors"
              style={{ fontFamily: "DM Mono, monospace" }}
            >
              Horários
            </button>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={logout}>
          Sair
        </Button>
      </div>

      <div className="flex-1 p-6 max-w-5xl mx-auto w-full">
        {/* Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 anim-fade-up">
          {[
            ["Aprovados", approved.length, ""],
            ["Receita total", formatPrice(totalRevenue), ""],
            ["Ticket médio", formatPrice(avgTicket), ""],
            ["Pico", peakHour !== "—" ? `${peakHour}h` : "—", ""],
          ].map(([label, value]) => (
            <div
              key={label}
              className="border border-[rgba(240,237,232,0.1)] p-4"
            >
              <div
                className="text-[10px] tracking-widest text-[rgba(240,237,232,0.35)] uppercase mb-2"
                style={{ fontFamily: "DM Mono, monospace" }}
              >
                {label}
              </div>
              <div
                className="text-2xl text-[#f0ede8]"
                style={{ fontFamily: "DM Mono, monospace" }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex gap-2">
            {(["all", "pending", "approved", "rejected"] as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 text-[10px] tracking-widest uppercase border transition-colors ${
                  filter === s
                    ? "border-[#f0ede8] text-[#f0ede8]"
                    : "border-[rgba(240,237,232,0.15)] text-[rgba(240,237,232,0.4)] hover:border-[rgba(240,237,232,0.4)]"
                }`}
                style={{ fontFamily: "DM Mono, monospace" }}
              >
                {s === "all" ? "Todos" : statusLabel[s]}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportCSV}>
              Exportar CSV
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setConfirmClear(true)}
            >
              Limpar tudo
            </Button>
          </div>
        </div>

        {/* Confirm clear */}
        {confirmClear && (
          <div className="border border-red-900 p-4 mb-5 flex items-center justify-between gap-4 anim-scale-in">
            <p className="text-red-400 text-sm">
              Isso irá apagar todos os registros do banco. Confirma?
            </p>
            <div className="flex gap-2">
              <Button variant="danger" size="sm" onClick={async () => { await clearAll(); setConfirmClear(false) }}>
                Confirmar
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmClear(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* List */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-[rgba(240,237,232,0.25)] text-sm">
            Nenhuma solicitação encontrada.
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((req, i) => {
              const barberObj = SEED_BARBERS.find((b) => b.id === req.barberId)
              const barberName = barberObj?.name ?? DB_BARBER_NAME_MAP[req.barberId] ?? req.barberId
              const product = SEED_PRODUCTS.find((p) => p.id === req.productId)
              const extras = ADDITIONAL_PRODUCTS.filter((a) => req.additionalProductIds.includes(a.id))
              const mult = barberObj?.priceMultiplier ?? 1
              const price =
                (product?.price ?? 0) * mult +
                extras.reduce((s, e) => s + e.price * mult, 0)
              const slotInfo = parseSlotId(req.slotId)

              return (
                <div
                  key={req.id}
                  className="border border-[rgba(240,237,232,0.1)] p-5 anim-fade-up"
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  {editing === req.id ? (
                    <div>
                      <p className="text-[#f0ede8] text-sm mb-3">Editar adicionais:</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {ADDITIONAL_PRODUCTS.map((a) => {
                          const on = editExtras.includes(a.id)
                          return (
                            <button
                              key={a.id}
                              onClick={() =>
                                setEditExtras((prev) =>
                                  on ? prev.filter((x) => x !== a.id) : [...prev, a.id],
                                )
                              }
                              className={`px-3 py-1.5 text-xs border transition-colors ${
                                on
                                  ? "border-[#f0ede8] text-[#f0ede8] bg-[rgba(240,237,232,0.05)]"
                                  : "border-[rgba(240,237,232,0.2)] text-[rgba(240,237,232,0.5)]"
                              }`}
                            >
                              {a.name}
                            </button>
                          )
                        })}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEdit}>Salvar</Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>Cancelar</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-[#f0ede8] font-medium truncate">{req.clientName}</span>
                          <span
                            className={`text-[10px] tracking-widest uppercase border px-2 py-0.5 ${statusColor[req.status]}`}
                            style={{ fontFamily: "DM Mono, monospace" }}
                          >
                            {statusLabel[req.status]}
                          </span>
                        </div>
                        <div
                          className="text-[rgba(240,237,232,0.4)] text-xs"
                          style={{ fontFamily: "DM Mono, monospace" }}
                        >
                          {barberName} · {product?.name}
                          {extras.length > 0 ? ` · ${extras.map((e) => e.name).join(", ")}` : ""}
                          {slotInfo ? ` · ${formatDate(slotInfo.date)} ${slotInfo.time}` : ""}
                          {" · "}
                          {formatPrice(price)}
                        </div>
                        <div
                          className="text-[rgba(240,237,232,0.25)] text-[10px] mt-1"
                          style={{ fontFamily: "DM Mono, monospace" }}
                        >
                          {new Date(req.createdAt).toLocaleString("pt-BR")}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {req.status === "pending" && (
                          <>
                            <Button size="sm" onClick={() => approveRequest(req.id)}>Aprovar</Button>
                            <Button variant="outline" size="sm" onClick={() => rejectRequest(req.id)}>Recusar</Button>
                          </>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => startEdit(req)}>Editar</Button>
                        <Button variant="danger" size="sm" onClick={() => removeRequest(req.id)}>✕</Button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
