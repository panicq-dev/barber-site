import type { ReactNode } from "react"
import Button from "./Button"
import { useApp } from "../context/AppContext"

interface ScreenLayoutProps {
  children: ReactNode
  showBack?: boolean
  animClass?: string
}

export default function ScreenLayout({ children, showBack = true, animClass = "anim-slide-r" }: ScreenLayoutProps) {
  const { goBack } = useApp()
  return (
    <div className={`min-h-screen bg-[#080808] flex flex-col ${animClass}`}>
      {showBack && (
        <div className="px-6 pt-6">
          <Button variant="ghost" size="sm" onClick={goBack} className="flex items-center gap-2 text-[rgba(240,237,232,0.5)]">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Voltar
          </Button>
        </div>
      )}
      <div className="flex-1 px-6 pb-10 max-w-xl mx-auto w-full">
        {children}
      </div>
    </div>
  )
}
