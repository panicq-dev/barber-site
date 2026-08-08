import { useEffect, useState } from "react"
import { useApp } from "../context/AppContext"

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1611313151697-d626e818dddf?w=1600&h=900&fit=crop&auto=format"

const SIDE_IMAGE =
  "https://images.unsplash.com/photo-1635273051937-a0ddef9573b6?w=600&h=900&fit=crop&auto=format"

export default function Home() {
  const { navigate } = useApp()
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 80)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="min-h-screen bg-[#080808] relative overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src={HERO_IMAGE}
          alt="Barbearia"
          className="w-full h-full object-cover opacity-30 transition-opacity duration-1000"
          style={{ filter: "grayscale(100%) contrast(1.1)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#080808]/60 via-transparent to-[#080808]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        {/* Left: Main content */}
        <div className="flex-1 flex flex-col justify-between p-8 lg:p-14 max-w-2xl">
          {/* Wordmark */}
          <div
            className={`transition-all duration-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
          >
            <div
              className="text-[10px] tracking-[0.3em] text-[rgba(240,237,232,0.6)] uppercase"
              style={{ fontFamily: "DM Mono, monospace" }}
            >
              AV. BOTURUSSU, 1768 - Barberia Ermelino, 2026
            </div>
          </div>

          {/* Hero text */}
          <div className="mt-auto mb-auto pt-16 lg:pt-0">
            <div
              className={`transition-all duration-700 delay-100 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            >
              <h1
                className="font-display text-[clamp(3rem,8vw,6rem)] leading-[0.9] text-[#f0ede8] mb-6"
                style={{ fontFamily: "DM Serif Display, Georgia, serif" }}
              >
                Arte em
                <br />
                <em className="italic">cada corte.</em>
              </h1>
            </div>
            <div
              className={`transition-all duration-700 delay-200 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            >
              <p className="text-[rgba(240,237,232,0.55)] text-lg max-w-md leading-relaxed mb-10">
                Precisão, estilo e tradição. Agende seu horário com nossos barbeiros e experimente o melhor da barbearia clássica.
              </p>
            </div>

            {/* CTA buttons */}
            <div
              className={`flex flex-col sm:flex-row gap-4 transition-all duration-700 delay-300 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            >
              <button
                onClick={() => navigate("client-info")}
                className="group relative overflow-hidden bg-[#f0ede8] text-[#080808] px-10 py-4 text-sm tracking-[0.2em] uppercase font-medium transition-all duration-300 hover:bg-white active:scale-[0.98]"
              >
                <span className="relative z-10">Agendar Agora</span>
                <div className="absolute inset-0 bg-white scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300" />
              </button>
              <button
                onClick={() => navigate("admin-login")}
                className="border border-[rgba(240,237,232,0.3)] text-[rgba(240,237,232,0.7)] px-10 py-4 text-sm tracking-[0.2em] uppercase font-medium hover:border-[rgba(240,237,232,0.6)] hover:text-[#f0ede8] transition-all duration-200 active:scale-[0.98]"
              >
                Área Administrativa
              </button>
            </div>
          </div>

          {/* Footer row */}
          <div
            className={`flex items-center gap-8 mt-10 transition-all duration-700 delay-500 ${loaded ? "opacity-100" : "opacity-0"}`}
          >
            {[["3", "Barbeiros"], ["500+", "Clientes"], ["4.9★", "Avaliação"]].map(([n, l]) => (
              <div key={l}>
                <div
                  className="text-xl text-[#f0ede8]"
                  style={{ fontFamily: "DM Mono, monospace" }}
                >
                  {n}
                </div>
                <div className="text-[10px] tracking-widest text-[rgba(240,237,232,0.35)] uppercase mt-0.5">
                  {l}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Side photo (hidden on small screens) */}
        <div
          className={`hidden lg:block w-80 relative transition-all duration-1000 delay-200 ${loaded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
        >
          <img
            src={SIDE_IMAGE}
            alt="Barbeiro trabalhando"
            className="h-full w-full object-cover"
            style={{ filter: "grayscale(100%) contrast(1.05)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#080808]/80" />
          {/* Vertical text label */}
          <div
            className="absolute bottom-12 right-6 text-[rgba(240,237,232,0.25)] text-[9px] tracking-[0.5em] uppercase"
            style={{
              writingMode: "vertical-rl",
              fontFamily: "DM Mono, monospace",
            }}
          >
            Barbearia Premium
          </div>
        </div>
      </div>

      {/* Bottom border line */}
      <div
        className={`absolute bottom-0 left-0 h-px bg-[rgba(240,237,232,0.08)] transition-all duration-1000 delay-700 ${loaded ? "w-full" : "w-0"}`}
      />
    </div>
  )
}
