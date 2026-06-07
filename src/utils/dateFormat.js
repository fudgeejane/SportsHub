/**
 * Format a date string or Date object to "Feb. 12, 2004" format
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  if (!date) return ''
  
  try {
    const d = typeof date === 'string' ? new Date(date) : date
    if (isNaN(d.getTime())) return ''
    
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  } catch {
    return ''
  }
}

/**
 * Format a time string to "12:00 AM" format
 * @param {string} time - The time in HH:mm format
 * @returns {string} Formatted time string
 */
export function formatTime(time) {
  if (!time) return ''
  
  try {
    const [hours, minutes] = time.split(':').map(Number)
    const period = hours >= 12 ? 'PM' : 'AM'
    const hour12 = hours % 12 || 12
    
    return `${hour12}:${String(minutes).padStart(2, '0')} ${period}`
  } catch {
    return ''
  }
}

/**
 * Format a date and time to "Feb. 12, 2004 12:00 AM" format
 * @param {string|Date} date - The date to format
 * @param {string} time - The time in HH:mm format
 * @returns {string} Formatted datetime string
 */
export function formatDateTime(date, time) {
  const formattedDate = formatDate(date)
  const formattedTime = formatTime(time)
  
  if (!formattedDate && !formattedTime) return ''
  if (!formattedDate) return formattedTime
  if (!formattedTime) return formattedDate
  
  return `${formattedDate} ${formattedTime}`
}

/**
 * Format a Firestore timestamp to "Feb. 12, 2004 12:00 AM" format
 * @param {Object} timestamp - Firestore timestamp object
 * @returns {string} Formatted datetime string
 */
export function formatTimestamp(timestamp) {
  if (!timestamp || !timestamp.toDate) return ''
  
  try {
    const date = timestamp.toDate()
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  } catch {
    return ''
  }
}
