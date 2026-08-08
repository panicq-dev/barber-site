import { useApp } from "../context/AppContext"
import ScreenLayout from "../components/ScreenLayout"
import StepIndicator from "../components/StepIndicator"
import { SEED_BARBERS, SEED_PRODUCTS } from "../lib/seed"
import { formatPrice } from "../lib/format"

export default function ProductSelection() {
  const { bookingDraft, setBookingDraft, navigate } = useApp()
  const barber = SEED_BARBERS.find((b) => b.id === bookingDraft.barberId)

  function handleSelect(productId: string) {
    setBookingDraft({ productId, additionalProductIds: [] })
    navigate("extra-products")
  }

  return (
    <ScreenLayout>
      <div className="pt-8">
        <StepIndicator current={2} />

        <div className="mb-8 anim-fade-up stagger-1">
          <p
            className="text-[10px] tracking-[0.4em] text-[rgba(240,237,232,0.4)] uppercase mb-2"
            style={{ fontFamily: "DM Mono, monospace" }}
          >
            Etapa 3 — 6
          </p>
          <h2 className="font-display text-4xl text-[#f0ede8]">Escolha o serviço</h2>
          {barber && (
            <p className="text-[rgba(240,237,232,0.45)] mt-2 text-sm">
              Barbeiro: <span className="text-[rgba(240,237,232,0.7)]">{barber.name}</span>
            </p>
          )}
        </div>

        <div className="space-y-3">
          {SEED_PRODUCTS.map((product, i) => {
            const adjustedPrice = product.price * (barber?.priceMultiplier ?? 1)
            const isSelected = bookingDraft.productId === product.id
            return (
              <button
                key={product.id}
                onClick={() => handleSelect(product.id)}
                className={`
                  w-full text-left p-5 border transition-all duration-200 anim-fade-up
                  ${isSelected
                    ? "border-[#f0ede8] bg-[rgba(240,237,232,0.05)]"
                    : "border-[rgba(240,237,232,0.15)] hover:border-[rgba(240,237,232,0.4)] hover:bg-[rgba(240,237,232,0.03)]"}
                  stagger-${i + 2}
                `}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-[#f0ede8] font-medium">{product.name}</div>
                    <div className="text-[rgba(240,237,232,0.45)] text-sm mt-1">{product.description}</div>
                    <div
                      className="text-[rgba(240,237,232,0.3)] text-[10px] mt-2 tracking-widest uppercase"
                      style={{ fontFamily: "DM Mono, monospace" }}
                    >
                      {product.duration} min
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div
                      className="text-[#f0ede8] text-xl"
                      style={{ fontFamily: "DM Mono, monospace" }}
                    >
                      {formatPrice(adjustedPrice)}
                    </div>
                    {barber && barber.priceMultiplier !== 1 && (
                      <div
                        className="text-[rgba(240,237,232,0.25)] text-xs line-through mt-0.5"
                        style={{ fontFamily: "DM Mono, monospace" }}
                      >
                        {formatPrice(product.price)}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </ScreenLayout>
  )
}
