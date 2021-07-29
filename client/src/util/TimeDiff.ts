
// REQUIRES: d < now
export const beforeNowString = (d: Date): string => {
  const MILLIS_PER_MIN = 60000
  const MILLIS_PER_HOUR = MILLIS_PER_MIN * 60
  const MILLIS_PER_DAY = MILLIS_PER_HOUR * 24

  const now = new Date()
  const milliDiff = now.getTime() - d.getTime()

  const minsDiff = Math.floor(milliDiff / MILLIS_PER_MIN)
  console.log(now, d)
  if (minsDiff < 1) {
    return "Less than a minute ago"
  } else if (minsDiff < 60) {
    return `${minsDiff} minute${minsDiff > 1 ? "s" : ""} ago`
  }

  const hrsDiff = Math.floor(milliDiff / MILLIS_PER_HOUR)
  if (hrsDiff < 1) {
    return "Less than an hour ago"
  } else if (hrsDiff < 24) {
    return `${hrsDiff} hour${hrsDiff > 1 ? "s" : ""} ago`
  }

  const daysDiff = Math.floor(milliDiff / MILLIS_PER_DAY)
  return `${daysDiff} day${daysDiff > 1 ? "s" : ""} ago`
}