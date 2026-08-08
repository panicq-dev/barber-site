export interface Product {
  id: string
  name: string
  description: string
  price: number
  duration: number
}

export interface Barber {
  id: string
  name: string
  instagram: string
  priceMultiplier: number
  username: string
  password: string
}

export interface TimeSlot {
  id: string
  barberId: string
  date: string
  time: string
  isActive: boolean
}

export interface BookingRequest {
  id: string
  clientName: string
  phoneDD: string
  phoneNumber: string
  email: string
  productId: string
  barberId: string
  slotId: string
  additionalProductIds: string[]
  serviceName?: string
  serviceLabel?: string
  additionalServiceNames?: string[]
  status: "pending" | "approved" | "rejected"
  createdAt: string
}

export type BookingDraft = Omit<BookingRequest, "id" | "status" | "createdAt">

export type AuthSession =
  | { type: "admin" }
  | { type: "barber"; barberId: string; barberName: string }

export type Screen =
  | "home"
  | "client-info"
  | "barber-selection"
  | "product-selection"
  | "extra-products"
  | "time-slot-selection"
  | "confirmation"
  | "booking-success"
  | "admin-login"
  | "admin-requests"
  | "admin-schedule"
  | "barber-schedule"
