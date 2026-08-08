import { useState } from "react"
import { useApp } from "../context/AppContext"
import Button from "../components/Button"

export default function AdminLogin() {
  const { login, navigate, goBack } = useApp()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  function handleLogin() {
    setError("")
    setLoading(true)
    setTimeout(() => {
      const ok = login(username, password)
      setLoading(false)
      if (ok) {
        // navigate based on session type — AppContext will do it in App.tsx
        navigate(username === "admin" ? "admin-requests" : "barber-schedule")
      } else {
        setError("Usuário ou senha inválidos.")
      }
    }, 500)
  }

  const inputClass =
    "w-full bg-transparent border-b border-[rgba(240,237,232,0.2)] text-[#f0ede8] py-3 text-base outline-none focus:border-[rgba(240,237,232,0.8)] transition-colors placeholder:text-[rgba(240,237,232,0.2)]"

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col">
      <div className="px-6 pt-6">
        <Button variant="ghost" size="sm" onClick={goBack} className="flex items-center gap-2 text-[rgba(240,237,232,0.5)]">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Voltar
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-sm anim-scale-in">
          <div className="mb-10 text-center">
            <div
              className="text-[10px] tracking-[0.5em] text-[rgba(240,237,232,0.3)] uppercase mb-3"
              style={{ fontFamily: "DM Mono, monospace" }}
            >
              Acesso restrito
            </div>
            <h1
              className="font-display text-4xl text-[#f0ede8]"
              style={{ fontFamily: "DM Serif Display, Georgia, serif" }}
            >
              Área Administrativa
            </h1>
          </div>

          <div className="space-y-6">
            <div>
              <label
                className="block text-[10px] tracking-[0.3em] text-[rgba(240,237,232,0.4)] uppercase mb-1"
                style={{ fontFamily: "DM Mono, monospace" }}
              >
                Usuário
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className={inputClass}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            <div>
              <label
                className="block text-[10px] tracking-[0.3em] text-[rgba(240,237,232,0.4)] uppercase mb-1"
                style={{ fontFamily: "DM Mono, monospace" }}
              >
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className={inputClass}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm mt-4 text-center">{error}</p>
          )}

          <Button
            size="lg"
            loading={loading}
            onClick={handleLogin}
            className="w-full mt-8"
          >
            Entrar
          </Button>
        </div>
      </div>
    </div>
  )
}
