import { toTzDate, stripDate, datePlus1Day } from '@utils'

/**
 * Calculate end date and related metadata for an event
 * @param {Object} params - Parameters
 * @param {string} params.startDate - Start date
 * @param {string} params.endDate - End date
 * @param {string} params.startTime - Start time
 * @param {string} params.endTime - End time
 * @returns {Object} End date and metadata
 */
export function setEndDate({ startDate, endDate: endDateRaw, startTime, endTime }) {
  if (!startDate) return {}

  // const startDateAsDate = new Date(startDate)
  // const startDateAsDatePlus1 = new Date(startDate)
  // startDateAsDatePlus1.setDate(startDateAsDatePlus1.getDate() + 1)
  // const startDatePlus1 = startDateAsDatePlus1.toISOString().split("T")[0]
  let { string: startDatePlus1 } = datePlus1Day(startDate)
  startDatePlus1 = startDatePlus1.split('T')[0]

  let endDate = endDateRaw
  let moreThan24h = false

  if (!endDate) {
    // Define endDate
    if (!endTime) endDate = endDateRaw
    else if (endTime <= startTime) endDate = startDatePlus1
    else if (endTime > startTime) endDate = startDate
  } else if (endDate == startDatePlus1 && (endTime > startTime || !endTime || !startTime)) {
    moreThan24h = true
  } else if (endDate > startDatePlus1) {
    moreThan24h = true
  }

  const today = new Date().toISOString().split('T')[0]
  const isPast = (endDate || startDate) < today

  return { startDatePlus1, endDate, moreThan24h, isPast }
}

/**
 * Format date and time strings for an event
 * @param {Object} params - Parameters
 * @param {string} params.startDate - Start date
 * @param {string} params.startTime - Start time
 * @param {string} params.endDate - End date
 * @param {string} params.endTime - End time
 * @returns {Object} Formatted date and time strings
 */
export function setDateTimes({ startDate, startTime, endDate, endTime }) {
  const startDateTime = startDate && startDate + (startTime ? `T${startTime}` : '')
  const endDateTime = endDate && endDate + (endTime ? `T${endTime}` : '')

  const startDateStr = stripDate(startDateTime)?.slice(0, -3)
  const endDateStr = stripDate(endDateTime)?.slice(0, -3)

  return {
    startDateTime,
    endDateTime,
    startDateStr,
    endDateStr,
  }
}

/**
 * Transform a datetime string into a localized object
 * @param {string} dateRaw - Datetime string
 * @returns {Object} Localized datetime object
 */
export function transformDateTime(dateRaw) {
  if (!dateRaw) return dateRaw

  const date = toTzDate(dateRaw)

  const dateOptions = {
    timeZone: 'UTC',
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
  const timeOptions = { timeZone: 'UTC', hour: '2-digit', minute: '2-digit' }

  // date = new Date(dateRaw)
  const dateStr = stripDate(date).slice(0, -3)
  const hasTime = dateStr?.length > 10

  return {
    // dateTimeRaw: dateRaw,
    dateTimeRaw: dateStr,
    dateStr,
    hasTime,
    fr: {
      date: date.toLocaleString('fr', dateOptions),
      ...(hasTime
        ? {
            time: date.toLocaleString('fr', timeOptions),
            hours: date.toLocaleString('fr', {
              timeZone: 'UTC',
              hour: '2-digit',
            }),
            minutes: date.toLocaleString('fr', {
              timeZone: 'UTC',
              minute: '2-digit',
            }),
          }
        : {}),
      weekday: date.toLocaleString('fr', { timeZone: 'UTC', weekday: 'short' }),
      day: date.toLocaleString('fr', { timeZone: 'UTC', day: 'numeric' }),
      month: date.toLocaleString('fr', { timeZone: 'UTC', month: 'short' }),
      monthShort: date.toLocaleString('fr', {
        timeZone: 'UTC',
        month: 'short',
      }),
      monthLong: date.toLocaleString('fr', { timeZone: 'UTC', month: 'long' }),
      year: date.toLocaleString('fr', { timeZone: 'UTC', year: 'numeric' }),
    },
  }
}
