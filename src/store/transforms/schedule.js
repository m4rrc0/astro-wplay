import rrule from 'rrule'
import { setEndDate, setDateTimes } from './dates'

const { datetime, RRule, RRuleSet } = rrule

/**
 * Transform a raw schedule into our format
 * @param {Object} scheduleRaw Raw schedule from Directus
 * @returns {Object} Transformed schedule
 */
export function transformSchedulePart(scheduleRaw) {
  const {
    status,
    description,
    startDate,
    endDate: endDateRaw,
    startTime,
    endTime,
    repeatCount,
    frequency,
    interval,
    byDay,
    bySetPos,
    exceptDate,
    addDate,
    byMonthDay,
    byMonth,
  } = scheduleRaw

  const { startDatePlus1, endDate, moreThan24h, isPast } = setEndDate({
    startDate,
    endDate: endDateRaw,
    startTime,
    endTime,
  })

  let type = undefined // can be 'unique', 'recurring' or 'invalid'
  let rrule = undefined
  const [Y, M, D] = (startDate || '').split('-')
  const [h, m] = (startTime || '').split(':')

  // Define type
  if (!startDate || !startTime) type = 'invalid'
  else if (repeatCount > 1 && !frequency) type = 'invalid'
  else if ((repeatCount > 1 || endDate > startDatePlus1) && !!frequency) type = 'recurring'
  else type = 'unique'

  const { startDateTime, endDateTime, startDateStr, endDateStr } = setDateTimes({
    startDate,
    startTime,
    endDate,
    endTime,
  })

  if (type === 'recurring') {
    rrule = new RRule({
      freq: RRule[frequency.toUpperCase()],
      dtstart: datetime(Y, M, D, h, m),
      // dtstart: new Date(startDate),
      // TODO: what happens if both repeatCount and endDate are set ???
      count: repeatCount,
      ...(endDate && { until: new Date(endDate) }),
      interval,
      bysetpos: bySetPos,
      ...(byDay && {
        byweekday: byDay.map(day => RRule[day.slice(0, 2).toUpperCase()]),
      }),
      // Are the following useful?
      bymonthday: byMonthDay,
      bymonth: byMonth,
    })
  }

  return {
    ...scheduleRaw,
    type,
    rrule,
    endDate,
    moreThan24h,
    startDatePlus1,
    isPast,
    startDateTime,
    endDateTime,
    startDateStr,
    endDateStr,
  }
}

export function transformSchedules(schedulePartsRaw) {
  // let type = undefined
  const purgedScheduleParts = schedulePartsRaw?.filter(
    ({ status, type }) => type !== 'invalid' && (status || 'published') === 'published'
  )
  // if (purgedScheduleParts?.length < 1) type = "invalid"
  // else if (purgedScheduleParts?.length > 1) type = "recurring"
  // else if (purgedScheduleParts[0]?.type === "recurring") type = "recurring"
  // else if (purgedScheduleParts[0]?.type === "unique") type = "unique"
  // else {
  // 	console.error("Unexpected schedule type", purgedScheduleParts);
  // }

  const rRuleSet = new RRuleSet()

  // Populate RuleSet with scheduleParts
  purgedScheduleParts?.forEach(
    ({
      status,
      type,
      rrule,
      // description,
      startDate,
      endDate,
      startTime,
      endTime,
      repeatCount,
      frequency, // yearly, monthly, weekly
      interval,
      byDay,
      bySetPos,
      exceptDate,
      addDate,
      // Are the following useful?
      byMonthDay,
      byMonth, // [int]
      // byMonthWeek,
    }) => {
      const [Y, M, D] = (startDate || '').split('-')
      const [h, m] = (startTime || '').split(':')

      // console.log({ startDate, startTime, exceptDate, byMonth })

      // Recurring events
      if (type === 'recurring') {
        // Main recurrance definition
        rRuleSet.rrule(rrule)

        // Exceptions: Exclude dates
        for (const { date } of exceptDate || []) {
          const [eY, eM, eD] = date.split('-')
          rRuleSet.exdate(datetime(eY, eM, eD, h, m))
        }
        // Exceptions: Add dates manualy
        for (const { date } of addDate || []) {
          const [aY, aM, aD] = date.split('-')
          rRuleSet.rdate(datetime(aY, aM, aD, h, m))
        }
        // Event spanning multiple days has no frequency but multiple schedules with unique dates+times
      } else if (type === 'unique') {
        rRuleSet.rdate(datetime(Y, M, D, h, m))
      }
    }
  )

  // TODO:
  // - prepare useful properties (list them here next)
  // const instances = rRuleSet.all()

  return {
    rRuleSet,
    schedule: purgedScheduleParts,
  }
}
