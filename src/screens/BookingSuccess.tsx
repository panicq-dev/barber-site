import { useEffect, useState } from "react"
import { useApp } from "../context/AppContext"
import Button from "../components/Button"

export default function BookingSuccess() {
  const { navigate } = useApp()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center px-8 text-center">
      {/* Animated check */}
      <div
        className={`mb-10 transition-all duration-700 ${visible ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
      >
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <circle
            cx="40"
            cy="40"
            r="38"
            stroke="rgba(240,237,232,0.15)"
            strokeWidth="1"
          />
          <circle
            cx="40"
            cy="40"
            r="38"
            stroke="#f0ede8"
            strokeWidth="1"
            fill="none"
            strokeDasharray="240"
            strokeDashoffset="0"
            strokeLinecap="round"
            style={{
              animation: visible ? "circleDraw 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards" : "none",
              strokeDashoffset: 240,
            }}
          />
          <path
            d="M24 40l12 12 20-20"
            stroke="#f0ede8"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="60"
            strokeDashoffset="60"
            style={{
              animation: visible ? "checkDraw 0.5s 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards" : "none",
            }}
          />
        </svg>
      </div>

      <div
        className={`transition-all duration-700 delay-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      >
        <p
          className="text-[10px] tracking-[0.5em] text-[rgba(240,237,232,0.35)] uppercase mb-4"
          style={{ fontFamily: "DM Mono, monospace" }}
        >
          Solicitação enviada
        </p>
        <h1
          className="font-display text-5xl text-[#f0ede8] mb-4 leading-tight"
          style={{ fontFamily: "DM Serif Display, Georgia, serif" }}
        >
          Recebemos
          <br />
          <em>seu pedido.</em>
        </h1>
        <p className="text-[rgba(240,237,232,0.45)] max-w-sm leading-relaxed mt-4 mb-10">
          Sua solicitação foi enviada com sucesso e está aguardando aprovação da barbearia. Em breve entraremos em contato.
        </p>
        <Button
          size="lg"
          variant="outline"
          onClick={() => {
            navigate("home")
          }}
        >
          Voltar ao início
        </Button>
      </div>
    </div>
  )
}
