import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"
import type { BookingDraft, BookingRequest, TimeSlot, AuthSession, Screen } from "../lib/types"
import { SEED_BARBERS } from "../lib/seed"
import {
  getRequests,
  getTimeSlots,
  saveRequest,
  updateRequestStatus,
  updateRequestAdditionalProducts,
  deleteRequest,
  toggleSlotActive,
  deleteTimeSlot,
  deleteTimeSlotsByDate,
  addTimeSlot,
  saveTimeSlots,
  clearDatabaseRecords,
} from "../lib/storage"

interface AppContextType {
  // Data
  requests: BookingRequest[]
  timeSlots: TimeSlot[]
  isLoading: boolean

  // Auth
  authSession: AuthSession | null
  login: (username: string, password: string) => boolean
  logout: () => void

  // Navigation
  currentScreen: Screen
  navigate: (screen: Screen) => void
  goBack: () => void

  // Booking
  bookingDraft: Partial<BookingDraft>
  setBookingDraft: (patch: Partial<BookingDraft>) => void
  submitBooking: () => Promise<void>

  // Requests management
  approveRequest: (id: string) => Promise<void>
  rejectRequest: (id: string) => Promise<void>
  removeRequest: (id: string) => Promise<void>
  editRequestExtras: (id: string, extraIds: string[]) => Promise<void>
  clearAll: () => Promise<void>

  // Schedule management
  toggleSlot: (slotId: string, current: boolean) => Promise<void>
  removeSlot: (slotId: string) => Promise<void>
  removeDaySlots: (barberId: string, date: string) => Promise<void>
  addSlot: (slot: TimeSlot) => Promise<void>
  addFullDay: (barberId: string, date: string, times: string[]) => Promise<void>
  loadData: () => Promise<void>
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<BookingRequest[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [authSession, setAuthSession] = useState<AuthSession | null>(null)
  const [currentScreen, setCurrentScreen] = useState<Screen>("home")
  const [history, setHistory] = useState<Screen[]>([])
  const [bookingDraft, setDraft] = useState<Partial<BookingDraft>>({
    additionalProductIds: [],
  })

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [reqs, slots] = await Promise.all([getRequests(), getTimeSlots()])
      console.debug("Loaded requests:", (reqs ?? []).length, "slots:", (slots ?? []).length)
      setRequests(reqs)
      setTimeSlots(slots)
    } catch (e) {
      console.error("Load error:", e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Auto-refresh: periodically reload data from the DB so the UI stays up-to-date.
  useEffect(() => {
    const interval = setInterval(() => {
      loadData().catch((e) => console.debug("Auto-refresh loadData error:", e))
    }, 30000) // 30s
    return () => clearInterval(interval)
  }, [loadData])

  // Debug helpers: expose DB inspection functions to the window for quick checks.
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.getDistinctBarberIds = async () => {
      const mod = await import("../lib/storage")
      return mod.getDistinctBarberIds()
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.getAvailableDates = async () => {
      const mod = await import("../lib/storage")
      return mod.getAvailableDates()
    }
    // also expose forceRefresh
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.forceRefreshFromDB = async () => {
      const mod = await import("../lib/storage")
      return mod.forceRefreshFromDB()
    }
    return () => {
      // @ts-ignore
      delete window.getDistinctBarberIds
      // @ts-ignore
      delete window.getAvailableDates
      // @ts-ignore
      delete window.forceRefreshFromDB
    }
  }, [])

  const navigate = useCallback((screen: Screen) => {
    setHistory((h) => [...h, currentScreen])
    setCurrentScreen(screen)
  }, [currentScreen])

  const goBack = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h
      const prev = h[h.length - 1]
      setCurrentScreen(prev)
      return h.slice(0, -1)
    })
  }, [])

  const setBookingDraft = useCallback((patch: Partial<BookingDraft>) => {
    setDraft((d) => ({ ...d, ...patch }))
  }, [])

  const login = useCallback((username: string, password: string): boolean => {
    if (username === "admin" && password === "admin") {
      setAuthSession({ type: "admin" })
      return true
    }
    const barber = SEED_BARBERS.find(
      (b) => b.username === username && b.password === password,
    )
    if (barber) {
      setAuthSession({ type: "barber", barberId: barber.id, barberName: barber.name })
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    setAuthSession(null)
    setCurrentScreen("home")
    setHistory([])
  }, [])

  const submitBooking = useCallback(async () => {
    const draft = bookingDraft
    if (
      !draft.clientName ||
      !draft.phoneDD ||
      !draft.phoneNumber ||
      !draft.email ||
      !draft.productId ||
      !draft.barberId ||
      !draft.slotId
    ) {
      throw new Error("Dados incompletos")
    }
    const req: BookingRequest = {
      id: `req-${Date.now()}`,
      clientName: draft.clientName,
      phoneDD: draft.phoneDD,
      phoneNumber: draft.phoneNumber,
      email: draft.email,
      productId: draft.productId,
      barberId: draft.barberId,
      slotId: draft.slotId,
      additionalProductIds: draft.additionalProductIds ?? [],
      status: "pending",
      createdAt: new Date().toISOString(),
    }
    await saveRequest(req)
    setRequests((prev) => [req, ...prev])
    setDraft({ additionalProductIds: [] })
  }, [bookingDraft])

  const approveRequest = useCallback(async (id: string) => {
    await updateRequestStatus(id, "approved")
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "approved" } : r)),
    )
  }, [])

  const rejectRequest = useCallback(async (id: string) => {
    await updateRequestStatus(id, "rejected")
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "rejected" } : r)),
    )
  }, [])

  const removeRequest = useCallback(async (id: string) => {
    await deleteRequest(id)
    setRequests((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const editRequestExtras = useCallback(async (id: string, extraIds: string[]) => {
    await updateRequestAdditionalProducts(id, extraIds)
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, additionalProductIds: extraIds } : r)),
    )
  }, [])

  const clearAll = useCallback(async () => {
    await clearDatabaseRecords()
    setRequests([])
    setTimeSlots([])
  }, [])

  const toggleSlot = useCallback(async (slotId: string, current: boolean) => {
    await toggleSlotActive(slotId, current)
    setTimeSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, isActive: !current } : s)),
    )
  }, [])

  const removeSlot = useCallback(async (slotId: string) => {
    await deleteTimeSlot(slotId)
    setTimeSlots((prev) => prev.filter((s) => s.id !== slotId))
  }, [])

  const removeDaySlots = useCallback(async (barberId: string, date: string) => {
    await deleteTimeSlotsByDate(barberId, date)
    setTimeSlots((prev) => prev.filter((s) => !(s.barberId === barberId && s.date === date)))
  }, [])

  const addSlot = useCallback(async (slot: TimeSlot) => {
    await addTimeSlot(slot)
    setTimeSlots((prev) => [...prev, slot])
  }, [])

  const addFullDay = useCallback(async (barberId: string, date: string, times: string[]) => {
    const newSlots: TimeSlot[] = times.map((time) => ({
      id: `slot-${barberId}-${date}-${time.replace(":", "")}`,
      barberId,
      date,
      time,
      isActive: true,
    }))
    await saveTimeSlots(newSlots)
    setTimeSlots((prev) => [...prev, ...newSlots])
  }, [])

  return (
    <AppContext.Provider
      value={{
        requests,
        timeSlots,
        isLoading,
        authSession,
        login,
        logout,
        currentScreen,
        navigate,
        goBack,
        bookingDraft,
        setBookingDraft,
        submitBooking,
        approveRequest,
        rejectRequest,
        removeRequest,
        editRequestExtras,
        clearAll,
        toggleSlot,
        removeSlot,
        removeDaySlots,
        addSlot,
        addFullDay,
        loadData,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used inside AppProvider")
  return ctx
}
