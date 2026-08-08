import { supabase } from "./supabase"
import type { BookingRequest, TimeSlot } from "./types"
import { todayStr } from "./format"
import { DB_BARBER_ID_TO_LOCAL, LOCAL_BARBER_ID_TO_DB, SEED_PRODUCTS } from "./seed"

// Generic helper to retry Supabase queries a few times (exponential backoff)
async function fetchWithRetries<T>(fn: () => any, attempts = 4, baseDelay = 300): Promise<{ data: T | null; error: any }> {
  let lastErr: any = null
  for (let i = 0; i < attempts; i++) {
    try {
      // fn() may return a PostgrestFilterBuilder (thenable) or a Promise.
      const raw = await Promise.resolve(fn())
      // normalize: PostgREST returns { data, error }
      const data = raw && typeof raw === "object" && "data" in raw ? (raw.data as T | null) : (raw as T | null)
      const error = raw && typeof raw === "object" && "error" in raw ? (raw.error as any) : null
      if (error) {
        lastErr = error
      } else {
        return { data: data ?? null, error: null }
      }
    } catch (e) {
      lastErr = e
    }
    const delay = baseDelay * Math.pow(2, i)
    await new Promise((r) => setTimeout(r, delay))
  }
  return { data: null, error: lastErr }
}

// ─── Booking Requests ────────────────────────────────────────────────────────

export async function getRequests(): Promise<BookingRequest[]> {
  const { data, error } = await supabase
    .from("booking_requests")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []).map(mapRequest)
}

export async function saveRequest(req: BookingRequest): Promise<void> {
  const serviceName = SEED_PRODUCTS.find((p) => p.id === req.productId)?.name ?? req.productId
  const extraNames = req.additionalProductIds
    .map((id) => SEED_PRODUCTS.find((p) => p.id === id)?.name ?? id)
    .filter(Boolean)

  const serviceLabel = extraNames.length > 0 ? [serviceName, ...extraNames].join(" + ") : serviceName

  const baseRow = {
    id: req.id,
    client_name: req.clientName,
    phone_dd: req.phoneDD,
    phone_number: req.phoneNumber,
    email: req.email,
    product_id: req.productId,
    barber_id: LOCAL_BARBER_ID_TO_DB[req.barberId] ?? req.barberId,
    slot_id: req.slotId,
    additional_product_ids: req.additionalProductIds,
    status: req.status,
    created_at: req.createdAt,
  }

  const attempts = [
    { ...baseRow, service_name: serviceLabel, service_label: serviceLabel },
    { ...baseRow, service_name: serviceLabel },
    { ...baseRow, service_id: req.productId },
    baseRow,
  ]

  let lastError: unknown = null
  for (const row of attempts) {
    const { error } = await supabase.from("booking_requests").insert(row)
    if (!error) return
    lastError = error
  }

  throw lastError
}

export async function updateRequestStatus(
  id: string,
  status: "approved" | "rejected",
): Promise<void> {
  const { error } = await supabase
    .from("booking_requests")
    .update({ status })
    .eq("id", id)
  if (error) throw error
}

export async function updateRequestAdditionalProducts(
  id: string,
  additionalProductIds: string[],
): Promise<void> {
  const { error } = await supabase
    .from("booking_requests")
    .update({ additional_product_ids: additionalProductIds })
    .eq("id", id)
  if (error) throw error
}

export async function deleteRequest(id: string): Promise<void> {
  const { error } = await supabase
    .from("booking_requests")
    .delete()
    .eq("id", id)
  if (error) throw error
}

export async function clearDatabaseRecords(): Promise<void> {
  // Clear canonical tables. Also clear legacy `slots` table if present.
  await supabase.from("booking_requests").delete().neq("id", "")
  await supabase.from("timeslots").delete().neq("id", "")
  try {
    await supabase.from("slots").delete().neq("id", "")
  } catch (e) {
    // ignore if table doesn't exist or deletion not allowed
  }
}

// ─── Time Slots ──────────────────────────────────────────────────────────────

export async function getTimeSlots(): Promise<TimeSlot[]> {
  // Read canonical `timeslots` and legacy `slots` (best-effort), merge by id.
  const resTimes = await fetchWithRetries(() => supabase.from("timeslots").select("*").order("date", { ascending: true }))
  if (resTimes.error) throw resTimes.error
  const dataTimes = (resTimes.data ?? []) as Record<string, unknown>[]
  const resSlots = await fetchWithRetries(() => supabase.from("slots").select("*").order("date", { ascending: true }))
  const dataSlots = (resSlots.data ?? []) as Record<string, unknown>[]

  // Merge with preference for canonical `timeslots` rows when ids collide.
  const byId = new Map<string, Record<string, unknown>>()
  for (const r of dataSlots) {
    const id = (r as any).id as string
    if (!id) continue
    byId.set(id, r)
  }
  for (const r of dataTimes) {
    const id = (r as any).id as string
    if (!id) continue
    byId.set(id, r)
  }

  const slots = Array.from(byId.values()).map(mapSlot)
  slots.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
  return slots
}

export async function addTimeSlot(slot: TimeSlot): Promise<void> {
  const row = {
    id: slot.id,
    barber_id: slot.barberId,
    date: slot.date,
    time: slot.time,
    is_active: slot.isActive,
  }
  const { error } = await supabase.from("timeslots").insert(row)
  if (error) throw error

  // Mirror to legacy `slots` table if present (best-effort).
  try {
    await supabase.from("slots").insert(row)
  } catch (e) {
    // ignore failures for missing table or permissions
  }
}

export async function saveTimeSlots(slots: TimeSlot[]): Promise<void> {
  const rows = slots.map((s) => ({
    id: s.id,
    barber_id: s.barberId,
    date: s.date,
    time: s.time,
    is_active: s.isActive,
  }))
  // Ensure upsert uses `id` as conflict column for predictable behavior.
  const { error } = await supabase.from("timeslots").upsert(rows, { onConflict: "id" })
  if (error) throw error

  // Mirror to legacy `slots` table (best-effort) so other app sees changes.
  try {
    await supabase.from("slots").upsert(rows, { onConflict: "id" })
  } catch (e) {
    // ignore if table missing
  }
}

export async function toggleSlotActive(slotId: string, current: boolean): Promise<void> {
  const { error } = await supabase
    .from("timeslots")
    .update({ is_active: !current })
    .eq("id", slotId)
  if (error) throw error
  // Mirror change to legacy `slots` table
  try {
    await supabase.from("slots").update({ is_active: !current }).eq("id", slotId)
  } catch (e) {
    // ignore
  }
}

export async function deleteTimeSlot(slotId: string): Promise<void> {
  const { error } = await supabase.from("timeslots").delete().eq("id", slotId)
  if (error) throw error
  try {
    await supabase.from("slots").delete().eq("id", slotId)
  } catch (e) {
    // ignore
  }
}

export async function deleteTimeSlotsByDate(barberId: string, date: string): Promise<void> {
  const { error } = await supabase
    .from("timeslots")
    .delete()
    .eq("barber_id", barberId)
    .eq("date", date)
  if (error) throw error
  try {
    await supabase.from("slots").delete().eq("barber_id", barberId).eq("date", date)
  } catch (e) {
    // ignore
  }
}

/**
 * Return unique available dates (YYYY-MM-DD) that have active timeslots.
 * It reads both `timeslots` and legacy `slots` (best-effort), deduplicates
 * and returns a sorted array of date strings. By default it returns dates
 * from today onwards; pass `includePast = true` to include past dates.
 */
export async function getAvailableDates(includePast = false): Promise<string[]> {
  const today = todayStr()

  // Query canonical timeslots (with retries)
  const resA = await fetchWithRetries(() => supabase.from("timeslots").select("date").eq("is_active", true))
  if (resA.error) {
    // if timeslots fail, continue to try legacy slots
  }
  // legacy slots (best-effort)
  const resB = await fetchWithRetries(() => supabase.from("slots").select("date"))

  const dataA = (resA.data ?? []) as any[]
  const dataB = (resB.data ?? []) as any[]

  const datesSet = new Set<string>()
  for (const r of [...dataA, ...dataB]) {
    const raw = (r as any).date
    if (!raw) continue
    const d = typeof raw === "string" ? raw.split("T")[0] : raw instanceof Date ? raw.toISOString().split("T")[0] : raw.toString().split("T")[0]
    if (!includePast && d < today) continue
    datesSet.add(d)
  }

  const dates = Array.from(datesSet)
  dates.sort()
  return dates
}

// One-time helper: migrate rows from legacy `slots` table into canonical `timeslots`.
// This will upsert rows by `id` into `timeslots` and return the number migrated.
export async function migrateSlotsToTimeslots(): Promise<number> {
  // fetch from `slots` if it exists
  const res = await fetchWithRetries(() => supabase.from("slots").select("*"))
  const legacyRows = res.data
  const legacyRowsArray = Array.isArray(legacyRows) ? legacyRows : []
  if (legacyRowsArray.length === 0) return 0
  const rows = legacyRowsArray.map((r: any) => ({
    id: (r as any).id,
    barber_id: (r as any).barber_id,
    date: (r as any).date,
    time: (r as any).time,
    is_active: (r as any).is_active ?? true,
  }))
  if (rows.length === 0) return 0
  const { error } = await supabase.from("timeslots").upsert(rows, { onConflict: "id" })
  if (error) throw error
  return rows.length
}

/**
 * Force refresh: attempt migration of legacy slots, then return fresh slots and dates.
 */
export async function forceRefreshFromDB(): Promise<{ slots: TimeSlot[]; dates: string[] }> {
  try {
    await migrateSlotsToTimeslots()
  } catch (e) {
    // ignore migration failures — continue to fetch
  }
  const slots = await getTimeSlots()
  const dates = await getAvailableDates()
  return { slots, dates }
}

/**
 * Diagnostic helper: return distinct barber_id values present in timeslots and slots.
 */
export async function getDistinctBarberIds(): Promise<string[]> {
  const resA = await fetchWithRetries(() => supabase.from("timeslots").select("barber_id"))
  const resB = await fetchWithRetries(() => supabase.from("slots").select("barber_id"))
  const dataA = (resA.data ?? []) as any[]
  const dataB = (resB.data ?? []) as any[]
  const set = new Set<string>()
  for (const r of [...dataA, ...dataB]) {
    const rawId = (r as any).barber_id
    if (!rawId) continue
    set.add(DB_BARBER_ID_TO_LOCAL[rawId] ?? rawId)
  }
  return Array.from(set)
}

// ─── Mappers ─────────────────────────────────────────────────────────────────

function mapRequest(row: Record<string, unknown>): BookingRequest {
  const rawBarberId = (row.barber_id as string) ?? ""
  const productIdFromColumn = (row.product_id as string) ?? (row.service_id as string) ?? ""
  const serviceName = (row.service_name as string) ?? (row.service_label as string) ?? ""
  const resolvedProductId =
    productIdFromColumn ||
    (serviceName ? SEED_PRODUCTS.find((p) => p.name.toLowerCase() === serviceName.toLowerCase())?.id ?? "" : "")

  const additionalProductIds = Array.isArray(row.additional_product_ids)
    ? (row.additional_product_ids as string[]).filter(Boolean)
    : []
  const additionalServiceNames = Array.isArray(row.additional_service_names)
    ? (row.additional_service_names as string[]).filter(Boolean)
    : []

  return {
    id: row.id as string,
    clientName: row.client_name as string,
    phoneDD: row.phone_dd as string,
    phoneNumber: row.phone_number as string,
    email: row.email as string,
    productId: resolvedProductId,
    barberId: DB_BARBER_ID_TO_LOCAL[rawBarberId] ?? rawBarberId,
    slotId: row.slot_id as string,
    additionalProductIds,
    serviceName: serviceName || SEED_PRODUCTS.find((p) => p.id === resolvedProductId)?.name || "",
    serviceLabel: serviceName || SEED_PRODUCTS.find((p) => p.id === resolvedProductId)?.name || "",
    additionalServiceNames,
    status: row.status as "pending" | "approved" | "rejected",
    createdAt: row.created_at as string,
  }
}

function mapSlot(row: Record<string, unknown>): TimeSlot {
  // Normalize date to `YYYY-MM-DD` and time to `HH:MM` to ensure
  // consistent grouping and display across DB formats.
  const rawDate = (row.date as any) ?? ""
  let dateStr = ""
  if (typeof rawDate === "string") {
    dateStr = rawDate.split("T")[0]
  } else if (rawDate instanceof Date) {
    dateStr = rawDate.toISOString().split("T")[0]
  } else if (rawDate && typeof rawDate.toString === "function") {
    dateStr = rawDate.toString().split("T")[0]
  }

  const rawTime = (row.time as any) ?? ""
  let timeStr = ""
  if (typeof rawTime === "string") {
    // accept both `HH:MM` and `HH:MM:SS`
    timeStr = rawTime.length >= 5 ? rawTime.slice(0, 5) : rawTime
  } else if (rawTime instanceof Date) {
    timeStr = rawTime.toISOString().split("T")[1].slice(0, 5)
  } else if (rawTime && typeof rawTime.toString === "function") {
    const t = rawTime.toString()
    timeStr = t.length >= 5 ? t.slice(0, 5) : t
  }

  const isActiveRaw = (row.is_active as any)
  const isActive = isActiveRaw === true || isActiveRaw === "t" || isActiveRaw === "true"
  const rawBarberId = (row.barber_id as string) ?? ""
  const barberId = DB_BARBER_ID_TO_LOCAL[rawBarberId] ?? rawBarberId

  return {
    id: row.id as string,
    barberId,
    date: dateStr,
    time: timeStr,
    isActive,
  }
}
