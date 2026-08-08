import { useState } from "react"
import { useApp } from "../context/AppContext"
import ScreenLayout from "../components/ScreenLayout"
import StepIndicator from "../components/StepIndicator"
import Button from "../components/Button"
import { isValidEmail, isValidDD, isValidPhoneNumber } from "../lib/format"

export default function ClientInfo() {
  const { bookingDraft, setBookingDraft, navigate } = useApp()
  const [name, setName] = useState(bookingDraft.clientName ?? "")
  const [dd, setDD] = useState(bookingDraft.phoneDD ?? "")
  const [phone, setPhone] = useState(bookingDraft.phoneNumber ?? "")
  const [email, setEmail] = useState(bookingDraft.email ?? "")
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = "Nome obrigatório"
    if (!isValidDD(dd)) e.dd = "DDD com 2 dígitos"
    if (!isValidPhoneNumber(phone)) e.phone = "Número com 8–9 dígitos"
    if (!isValidEmail(email)) e.email = "E-mail inválido"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleNext() {
    if (!validate()) return
    setBookingDraft({ clientName: name.trim(), phoneDD: dd, phoneNumber: phone, email: email.trim() })
    navigate("barber-selection")
  }

  const inputClass =
    "w-full bg-transparent border-b border-[rgba(240,237,232,0.2)] text-[#f0ede8] py-3 text-base outline-none focus:border-[rgba(240,237,232,0.8)] transition-colors placeholder:text-[rgba(240,237,232,0.2)]"

  const errorClass = "text-red-400 text-xs mt-1"

  return (
    <ScreenLayout>
      <div className="pt-8">
        <StepIndicator current={0} />

        <div className="mb-8 anim-fade-up stagger-1">
          <p
            className="text-[10px] tracking-[0.4em] text-[rgba(240,237,232,0.4)] uppercase mb-2"
            style={{ fontFamily: "DM Mono, monospace" }}
          >
            Etapa 1 — 6
          </p>
          <h2 className="font-display text-4xl text-[#f0ede8]">
            Seus dados
          </h2>
          <p className="text-[rgba(240,237,232,0.45)] mt-2 text-sm leading-relaxed">
            Preencha seus dados para identificação no agendamento.
          </p>
        </div>

        <div className="space-y-6">
          <div className="anim-fade-up stagger-2">
            <label className="block text-[10px] tracking-[0.3em] text-[rgba(240,237,232,0.4)] uppercase mb-1" style={{ fontFamily: "DM Mono, monospace" }}>
              Nome completo
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: João Silva"
              className={inputClass}
            />
            {errors.name && <p className={errorClass}>{errors.name}</p>}
          </div>

          <div className="anim-fade-up stagger-3">
            <label className="block text-[10px] tracking-[0.3em] text-[rgba(240,237,232,0.4)] uppercase mb-1" style={{ fontFamily: "DM Mono, monospace" }}>
              Telefone
            </label>
            <div className="flex gap-3">
              <div className="w-20">
                <input
                  type="tel"
                  value={dd}
                  onChange={(e) => setDD(e.target.value.replace(/\D/g, "").slice(0, 2))}
                  placeholder="DDD"
                  className={inputClass}
                  style={{ fontFamily: "DM Mono, monospace" }}
                />
                {errors.dd && <p className={errorClass}>{errors.dd}</p>}
              </div>
              <div className="flex-1">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))}
                  placeholder="Número"
                  className={inputClass}
                  style={{ fontFamily: "DM Mono, monospace" }}
                />
                {errors.phone && <p className={errorClass}>{errors.phone}</p>}
              </div>
            </div>
          </div>

          <div className="anim-fade-up stagger-4">
            <label className="block text-[10px] tracking-[0.3em] text-[rgba(240,237,232,0.4)] uppercase mb-1" style={{ fontFamily: "DM Mono, monospace" }}>
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className={inputClass}
            />
            {errors.email && <p className={errorClass}>{errors.email}</p>}
          </div>
        </div>

        <div className="mt-12 anim-fade-up stagger-5">
          <Button size="lg" onClick={handleNext} className="w-full">
            Continuar
          </Button>
        </div>
      </div>
    </ScreenLayout>
  )
}
