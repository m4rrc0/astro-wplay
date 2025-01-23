import assert from 'assert'
import rrule from 'rrule'
import { transformDateTime } from './dates'
import { stripDate, datePlus1Day, createPath } from '@utils'

const { RRule } = rrule

/**
 * Generate occurrences for a recurring event
 * @param {Object} event Base event
 * @param {Object} schedule Schedule with rrule
 * @param {Date} between.after Only return dates after this date
 * @param {Date} between.before Only return dates before this date
 * @returns {Object[]} Array of event occurrences
 */
export function generateOccurrences(event, eventSchedule, scheduleRuleSet) {
  let allSchedulesArray = [...eventSchedule]
  allSchedulesArray.reverse()

  const occurrences = event.isRecurring
    ? scheduleRuleSet.all().map(date => {
        const dateStr = stripDate(date).slice(0, -3)
        const dateSlug = dateStr.replace(':', 'h').toLowerCase()
        const slug = `${event.nameSlug}-${dateSlug}`
        const path = createPath({ type: 'event', slug })

        // Map an occurance to its corresponding eventSchedule.
        // eventSchedule of type unique take precedence in this case because we might want to overwrite an occurance to add more data
        let matchingSchedule = allSchedulesArray.find(schedule => {
          // First run looks for more precise eventSchedulePart
          if (schedule.type === 'recurring') return false

          let currentDateStr =
            schedule?.startDateStr || // in case of eventSchedule
            schedule?.time_start?.dateStr // in case of formattedSchedule

          return currentDateStr === dateStr
        })

        if (!matchingSchedule) {
          // Second run looks for a match in recurring eventSchedulePart
          matchingSchedule = allSchedulesArray.find(schedule => {
            // First run looks for more precise eventSchedulePart
            if (schedule.type !== 'recurring') return false

            return schedule.rrule.all().some(d => d.getTime() === date.getTime())
          })
        }

        const time_start = transformDateTime(date)
        let time_end = undefined
        if (matchingSchedule?.time_end) {
          time_end = matchingSchedule.time_end
        } else if (matchingSchedule?.type === 'recurring') {
          const occEndTime = matchingSchedule.endTime
          let occEndDate = undefined
          if (matchingSchedule.endTime < matchingSchedule.startTime) {
            const { string } = datePlus1Day(date)
            occEndDate = string.split('T')[0]
          } else {
            occEndDate = dateStr.split('T')[0]
          }

          const occEndDateTime = occEndDate + (occEndTime ? `T${occEndTime}` : '')
          time_end = transformDateTime(occEndDateTime)
        } else if (matchingSchedule?.type === 'unique') {
          time_end = transformDateTime(matchingSchedule.endDateStr)
        }

        return {
          date,
          dateStr,
          dateSlug,
          slug,
          path,
          time_start,
          time_end,
          isPast: matchingSchedule?.isPast,
        }
      })
    : null

  return occurrences
}

/**
 * Create a canonical version of an event
 * @param {Object} event Event to create canonical version from
 * @returns {Object} Canonical event
 */
export function createCanonicalEvent(event) {
  if (!event.isRecurring) return null

  return {
    ...event,
    ...event.canonical,
    isCanonical: true,
  }
}

/**
 * Extract canonical events from an array of events
 * @param {Object[]} events Array of events
 * @returns {Object[]} Array of canonical events
 */
export function extractCanonicalEvents(events = []) {
  const canonicalEventsMap = new Map()
  events.forEach(event => {
    const { isRecurring, canonical } = event
    if (!isRecurring) return
    if (canonicalEventsMap.has(canonical.path)) return

    const e = { ...event, ...canonical, isCanonical: true }
    canonicalEventsMap.set(canonical.path, e)
  })

  return Array.from(canonicalEventsMap.values())
}

/**
 * Flatten an array of events, expanding recurring events into occurrences
 * @param {Object[]} events Array of events to flatten
 * @returns {Object[]} Flattened array of events
 */
export function flattenEvents(eventsUnflat = [], { after, before }) {
  // TODO: use after and before
  // Chaeck that after and before are either nulish or a date with assert
  assert(!after || after instanceof Date, 'after must be undefined or a Date')
  assert(!before || before instanceof Date, 'before must be undefined or a Date')

  const afterStr = after && after.toISOString().substring(0, 10)
  const beforeStr = before && before.toISOString().substring(0, 10)

  let eventsFlatten = []

  eventsUnflat.forEach(event => {
    if (event.recurrence === 'unplanned') {
      return null
    } else if (event.recurrence === 'unique') {
      eventsFlatten.push(event)
    } else if (event.recurrence === 'multidays') {
      eventsFlatten.push(event)
    } else if (event.recurrence === 'recurring') {
      const occurrencesExpanded = event.occurrences?.map(occ => ({
        ...event,
        ...occ,
      }))
      eventsFlatten.push(...occurrencesExpanded)
    } else {
      console.error(`Unexpected recurrence type: ${event.recurrence} for event: ${event.name}`)
    }
  })

  let events = eventsFlatten.filter(event => {
    assert(!event.isCanonical, 'Canonical events cannot be flattened')
    assert(event.time_start, `Event instance of "${event.name}" has no Start Date`)

    const startStr = event?.time_start?.dateStr.substring(0, 10)
    const endStr = event?.time_end?.dateStr.substring(0, 10)

    // console.log({ startStr, endStr, afterStr, beforeStr })
    if (!endStr) {
      return (afterStr ? startStr > afterStr : true) && (beforeStr ? startStr < beforeStr : true)
    }
    return (afterStr ? endStr > afterStr : true) && (beforeStr ? startStr < beforeStr : true)
  })

  events.sort((prev, next) => {
    const a = prev?.time_start?.dateStr
    const b = next?.time_start?.dateStr
    if (a > b) return 1
    if (a < b) return -1
    return 0
  })
  // console.log(
  //   'Events after sorting: ',
  //   eventsFlatten.map(event => event.time_start?.dateStr)
  // )

  return events
}
