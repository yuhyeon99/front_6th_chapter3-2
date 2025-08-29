import { Event, EventForm } from '../types';
import { formatDate, getWeekDates, isDateInRange } from './dateUtils';

function filterEventsByDateRange(events: Event[], start: Date, end: Date): Event[] {
  return events.filter((event) => {
    const eventDate = new Date(event.date);
    return isDateInRange(eventDate, start, end);
  });
}

function containsTerm(target: string, term: string) {
  return target.toLowerCase().includes(term.toLowerCase());
}

function searchEvents(events: Event[], term: string) {
  return events.filter(
    ({ title, description, location }) =>
      containsTerm(title, term) || containsTerm(description, term) || containsTerm(location, term)
  );
}

function filterEventsByDateRangeAtWeek(events: Event[], currentDate: Date) {
  const weekDates = getWeekDates(currentDate);
  return filterEventsByDateRange(events, weekDates[0], weekDates[6]);
}

function filterEventsByDateRangeAtMonth(events: Event[], currentDate: Date) {
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );
  return filterEventsByDateRange(events, monthStart, monthEnd);
}

export function getFilteredEvents(
  events: Event[],
  searchTerm: string,
  currentDate: Date,
  view: 'week' | 'month'
): Event[] {
  const searchedEvents = searchEvents(events, searchTerm);

  if (view === 'week') {
    return filterEventsByDateRangeAtWeek(searchedEvents, currentDate);
  }

  if (view === 'month') {
    return filterEventsByDateRangeAtMonth(searchedEvents, currentDate);
  }

  return searchedEvents;
}

export function generateRecurringEvents(event: EventForm, repeatEndDate: string) {
  const recurringEvents: EventForm[] = [];
  const { repeat } = event;

  if (repeat.type === 'none') {
    return [event];
  }

  const startDate = new Date(event.date);
  const originalDay = startDate.getDate();
  const originalMonth = startDate.getMonth();

  // Always add the initial event
  recurringEvents.push({ ...event, date: formatDate(startDate) });

  let endDate: Date | null = null;
  if (repeatEndDate) {
    const parsedEndDate = new Date(repeatEndDate);
    if (!isNaN(parsedEndDate.getTime())) { // Check if it's a valid date
      endDate = parsedEndDate;
    }
  }

  // If no valid end date, or end date is before start date, only return the initial event
  if (!endDate || startDate > endDate) {
    return recurringEvents; // Contains only the initial event
  }

  let currentDate = new Date(startDate);

  // Advance currentDate to the next instance
  switch (repeat.type) {
    case 'daily':
      currentDate.setDate(currentDate.getDate() + repeat.interval);
      break;
    case 'weekly':
      currentDate.setDate(currentDate.getDate() + 7 * repeat.interval);
      break;
    case 'monthly': {
      let foundNextDate = false;
      let tempDate = new Date(currentDate);
      while (!foundNextDate) {
        const nextMonth = tempDate.getMonth() + repeat.interval;
        const nextYear = tempDate.getFullYear();
        const newDate = new Date(nextYear, nextMonth, originalDay);

        if (newDate.getMonth() === (nextMonth % 12)) {
          currentDate = newDate;
          foundNextDate = true;
        } else {
          tempDate = new Date(nextYear, nextMonth, 1);
        }
      }
      break;
    }
    case 'yearly': {
      let foundNextDate = false;
      let yearToTry = currentDate.getFullYear();
      while (!foundNextDate) {
        yearToTry += repeat.interval;
        const newDate = new Date(yearToTry, originalMonth, originalDay);

        if (newDate.getMonth() === originalMonth) {
          currentDate = newDate;
          foundNextDate = true;
        }
      }
      break;
    }
    default:
      // Should not happen if repeat.type is validated
      currentDate = new Date(endDate.getTime() + 1); // Break the loop
      break;
  }

  // Now, loop to generate subsequent events
  while (currentDate <= endDate) {
    recurringEvents.push({ ...event, date: formatDate(currentDate) });

    switch (repeat.type) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + repeat.interval);
        break;
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + 7 * repeat.interval);
        break;
      case 'monthly': {
        let foundNextDate = false;
        let tempDate = new Date(currentDate);
        while (!foundNextDate) {
          const nextMonth = tempDate.getMonth() + repeat.interval;
          const nextYear = tempDate.getFullYear();
          const newDate = new Date(nextYear, nextMonth, originalDay);

          if (newDate.getMonth() === (nextMonth % 12)) {
            currentDate = newDate;
            foundNextDate = true;
          } else {
            tempDate = new Date(nextYear, nextMonth, 1);
          }
        }
        break;
      }
      case 'yearly': {
        let foundNextDate = false;
        let yearToTry = currentDate.getFullYear();
        while (!foundNextDate) {
          yearToTry += repeat.interval;
          const newDate = new Date(yearToTry, originalMonth, originalDay);

          if (newDate.getMonth() === originalMonth) {
            currentDate = newDate;
            foundNextDate = true;
          }
        }
        break;
      }
      default:
        currentDate = new Date(endDate.getTime() + 1);
        break;
    }
  }

  return recurringEvents;
}
