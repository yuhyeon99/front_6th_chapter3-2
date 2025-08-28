import { Event, EventForm } from '../types';

export function parseDateTime(date: string, time: string) {
  return new Date(`${date}T${time}`);
}

export function convertEventToDateRange({ date, startTime, endTime }: Event | EventForm) {
  return {
    start: parseDateTime(date, startTime),
    end: parseDateTime(date, endTime),
  };
}

export function isOverlapping(event1: Event | EventForm, event2: Event | EventForm) {
  const { start: start1, end: end1 } = convertEventToDateRange(event1);
  const { start: start2, end: end2 } = convertEventToDateRange(event2);

  return start1 < end2 && start2 < end1;
}

function generateRecurringEvents(event: Event | EventForm): EventForm[] {
  const instances: EventForm[] = [];
  if (event.repeat.type === 'none') {
    return instances;
  }

  const startDate = new Date(event.date);
  const endDate = new Date(startDate);
  endDate.setFullYear(startDate.getFullYear() + 1);

  let currentDate = new Date(startDate);

  if (event.repeat.type === 'weekly') {
    currentDate.setDate(currentDate.getDate() + 7);
    while (currentDate <= endDate) {
      instances.push({
        ...event,
        date: currentDate.toISOString().split('T')[0],
      });
      currentDate.setDate(currentDate.getDate() + 7);
    }
  }

  return instances;
}

export function findOverlappingEvents(newEvent: Event | EventForm, events: Event[]) {
  const recurringInstances = generateRecurringEvents(newEvent);

  const allInstances = [newEvent, ...recurringInstances];

  for (const instance of allInstances) {
    const overlapping = events.filter(
      (event) => event.id !== (instance as Event).id && isOverlapping(event, instance)
    );
    if (overlapping.length > 0) {
      return overlapping;
    }
  }

  return [];
}
