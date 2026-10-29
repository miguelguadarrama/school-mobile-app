
export const normalizeDate = (date: Date | string): string => {
  const d = new Date(date)
  return d.toISOString().split("T")[0]
}
export const getFormattedDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}
// Parses a DATE-only value (e.g. "2015-03-10T00:00:00.000Z") as a local calendar
// date, ignoring the time/timezone part so it doesn't shift a day in UTC-negative zones.
export const parseDateOnly = (value: Date | string): Date => {
  const iso = typeof value === "string" ? value : value.toISOString()
  const [year, month, day] = iso.split("T")[0].split("-").map(Number)
  return new Date(year, month - 1, day)
}
