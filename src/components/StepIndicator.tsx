const STEPS = [
  "Dados",
  "Barbeiro",
  "Serviço",
  "Adicionais",
  "Horário",
  "Confirmação",
]

export default function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-8 overflow-x-auto scroll-area">
      {STEPS.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={label} className="flex items-center flex-shrink-0">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-7 h-7 flex items-center justify-center text-xs transition-all duration-300 ${
                  done
                    ? "bg-[#f0ede8] text-[#080808]"
                    : active
                      ? "border border-[#f0ede8] text-[#f0ede8]"
                      : "border border-[rgba(240,237,232,0.2)] text-[rgba(240,237,232,0.3)]"
                }`}
                style={{ fontFamily: "DM Mono, monospace", fontSize: 11 }}
              >
                {done ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#080808" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-[10px] tracking-widest uppercase transition-all duration-300 ${
                  active ? "text-[#f0ede8]" : done ? "text-[rgba(240,237,232,0.5)]" : "text-[rgba(240,237,232,0.2)]"
                }`}
                style={{ fontFamily: "DM Mono, monospace" }}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-px w-8 mx-2 transition-all duration-500 ${
                  done ? "bg-[rgba(240,237,232,0.5)]" : "bg-[rgba(240,237,232,0.1)]"
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
