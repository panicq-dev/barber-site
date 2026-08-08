import type { Barber, Product } from "./types"

export const SEED_BARBERS: Barber[] = [
  {
    id: "b1",
    name: "Gomes",
    instagram: "@gomes",
    priceMultiplier: 1.0,
    username: "gomes",
    password: "gomes123",
  },
  {
    id: "b2",
    name: "Guilherme",
    instagram: "@guilherme",
    priceMultiplier: 1.0,
    username: "guilherme",
    password: "guilherme123",
  },
  {
    id: "b3",
    name: "Fernando",
    instagram: "@fernando",
    priceMultiplier: 1.0,
    username: "fernando",
    password: "fernando123",
  },
]

export const SEED_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Corte",
    description: "Corte",
    price: 45,
    duration: 30,
  },
  {
    id: "p2",
    name: "Penteado",
    description: "Penteado",
    price: 60,
    duration: 40,
  },
  {
    id: "p3",
    name: "Barba",
    description: "Barba",
    price: 35,
    duration: 25,
  },
  {
    id: "p4",
    name: "Selagem",
    description: "Selagem",
    price: 50,
    duration: 35,
  },
  {
    id: "p5",
    name: "Sombrancelha",
    description: "Sombrancelha",
    price: 25,
    duration: 20,
  },
  {
    id: "p6",
    name: "Botox",
    description: "Botox",
    price: 40,
    duration: 30,
  },
]

// Adicionais são escolhidos entre os mesmos produtos (mesma tabela)
export const ADDITIONAL_PRODUCTS: Product[] = SEED_PRODUCTS

export const ADDITIONAL_PRODUCT_OPTIONS: Record<string, string[]> = {
  // Corte
  p1: ["p2", "p3", "p4", "p5"],
  // Penteado
  p2: ["p1", "p3", "p4", "p5"],
  // Barba
  p3: ["p1", "p2", "p4", "p5", "p6"],
  // Selagem
  p4: ["p1", "p2", "p3", "p5", "p6"],
  // Sombrancelha
  p5: ["p1"],
  // Botox - nenhum adicional
  p6: [],
}

export const PRESET_TIMES = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
]

// Map known DB barber IDs to friendly names when the DB uses different IDs than local seeds.
export const DB_BARBER_NAME_MAP: Record<string, string> = {
  "barber-1": "Gomes",
  "barber-2": "Guilherme",
  "barber-3": "Fernando",
}

export const DB_BARBER_ID_TO_LOCAL: Record<string, string> = {
  "barber-1": "b1",
  "barber-2": "b2",
  "barber-3": "b3",
}

export const LOCAL_BARBER_ID_TO_DB: Record<string, string> = {
  b1: "barber-1",
  b2: "barber-2",
  b3: "barber-3",
}
