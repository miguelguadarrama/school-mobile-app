
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