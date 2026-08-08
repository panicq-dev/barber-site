export function formatPrice(value: number): string {
  return `R$ ${value.toFixed(2).replace(".", ",")}`
}

export function formatPhone(dd: string, number: string): string {
  return `(${dd}) ${number}`
}

export function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-")
  const months = [
    "jan", "fev", "mar", "abr", "mai", "jun",
    "jul", "ago", "set", "out", "nov", "dez",
  ]
  return `${d} ${months[parseInt(m) - 1]} ${y}`
}

export function formatDateLong(dateStr: string): string {
  const [y, m, d] = dateStr.split("-")
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ]
  return `${parseInt(d)} de ${months[parseInt(m) - 1]} de ${y}`
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidDD(dd: string): boolean {
  return /^\d{2}$/.test(dd)
}

export function isValidPhoneNumber(num: string): boolean {
  return /^\d{8,9}$/.test(num)
}

export function todayStr(): string {
  return new Date().toISOString().split("T")[0]
}

export function groupSlotsByDate(slots: import("./types").TimeSlot[]): Record<string, import("./types").TimeSlot[]> {
  return slots.reduce<Record<string, import("./types").TimeSlot[]>>((acc, s) => {
    acc[s.date] = acc[s.date] ? [...acc[s.date], s] : [s]
    return acc
  }, {})
}
