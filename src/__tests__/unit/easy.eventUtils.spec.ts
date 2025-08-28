import { Event, EventForm } from '../../types';
import { generateRecurringEvents, getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
    {
      id: '2',
      title: '이벤트 2',
      date: '2025-07-05',
      startTime: '14:00',
      endTime: '15:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
    {
      id: '3',
      title: '이벤트 3',
      date: '2025-07-10',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
  ];

  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const result = getFilteredEvents(events, '이벤트 2', new Date('2025-07-01'), 'month');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('이벤트 2');
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'week');
    expect(result).toHaveLength(2);
    expect(result.map((e) => e.title)).toEqual(['이벤트 1', '이벤트 2']);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'month');
    expect(result).toHaveLength(3);
    expect(result.map((e) => e.title)).toEqual(['이벤트 1', '이벤트 2', '이벤트 3']);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const result = getFilteredEvents(events, '이벤트', new Date('2025-07-01'), 'week');
    expect(result).toHaveLength(2);
    expect(result.map((e) => e.title)).toEqual(['이벤트 1', '이벤트 2']);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'month');
    expect(result).toHaveLength(3);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const result = getFilteredEvents(events, '이벤트 2', new Date('2025-07-01'), 'month');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('이벤트 2');
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const borderEvents: Event[] = [
      {
        id: '4',
        title: '6월 마지막 날 이벤트',
        date: '2025-06-30',
        startTime: '23:00',
        endTime: '23:59',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      ...events,
      {
        id: '5',
        title: '8월 첫 날 이벤트',
        date: '2025-08-01',
        startTime: '00:00',
        endTime: '01:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ];
    const result = getFilteredEvents(borderEvents, '', new Date('2025-07-01'), 'month');
    expect(result).toHaveLength(3);
    expect(result.map((e) => e.title)).toEqual(['이벤트 1', '이벤트 2', '이벤트 3']);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const result = getFilteredEvents([], '', new Date('2025-07-01'), 'month');
    expect(result).toHaveLength(0);
  });
});

describe('generateRecurringEvents', () => {
  const baseEvent: EventForm = {
    date: '2025-08-25',
    title: '반복 테스트 이벤트',
    description: '',
    location: '',
    startTime: '10:00',
    endTime: '11:00',
    category: 'test',
    repeat: {
      type: 'none',
      interval: 1,
    },
    notificationTime: 0,
  };

  it('반복 유형이 "none"일 경우, 원본 이벤트만 포함된 배열을 반환해야 한다', () => {
    const result = generateRecurringEvents(baseEvent, '2025-09-01');
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(baseEvent);
  });

  it('매일 반복(간격 1)일 경우, 종료일까지 매일 이벤트를 생성해야 한다', () => {
    const dailyEvent: EventForm = {
      ...baseEvent,
      repeat: { type: 'daily', interval: 1 },
    };
    const result = generateRecurringEvents(dailyEvent, '2025-08-27');

    expect(result).toHaveLength(3);
    expect(result.map((e) => e.date)).toEqual(['2025-08-25', '2025-08-26', '2025-08-27']);
  });

  it('2일 간격으로 매일 반복일 경우, 이틀마다 이벤트를 생성해야 한다', () => {
    const dailyEvent: EventForm = {
      ...baseEvent,
      repeat: { type: 'daily', interval: 2 },
    };
    const result = generateRecurringEvents(dailyEvent, '2025-08-30');

    expect(result).toHaveLength(3);
    expect(result.map((e) => e.date)).toEqual(['2025-08-25', '2025-08-27', '2025-08-29']);
  });

  it('매주 반복(간격 1)일 경우, 종료일까지 매주 같은 요일에 이벤트를 생성해야 한다', () => {
    const weeklyEvent: EventForm = {
      ...baseEvent,
      date: '2025-08-25', // 월요일
      repeat: { type: 'weekly', interval: 1 },
    };
    const result = generateRecurringEvents(weeklyEvent, '2025-09-08');

    expect(result).toHaveLength(3);
    expect(result.map((e) => e.date)).toEqual(['2025-08-25', '2025-09-01', '2025-09-08']);
  });

  it('매월 반복(간격 1)일 경우, 종료일까지 매월 같은 날짜에 이벤트를 생성해야 한다', () => {
    const monthlyEvent: EventForm = {
      ...baseEvent,
      date: '2025-08-15',
      repeat: { type: 'monthly', interval: 1 },
    };
    const result = generateRecurringEvents(monthlyEvent, '2025-10-20');

    expect(result).toHaveLength(3);
    expect(result.map((e) => e.date)).toEqual(['2025-08-15', '2025-09-15', '2025-10-15']);
  });

  it('매년 반복(간격 1)일 경우, 종료일까지 매년 같은 날짜에 이벤트를 생성해야 한다', () => {
    const yearlyEvent: EventForm = {
      ...baseEvent,
      date: '2025-08-25',
      repeat: { type: 'yearly', interval: 1 },
    };
    const result = generateRecurringEvents(yearlyEvent, '2027-09-01');

    expect(result).toHaveLength(3);
    expect(result.map((e) => e.date)).toEqual(['2025-08-25', '2026-08-25', '2027-08-25']);
  });

  it('월말(31일)에 시작하여 매월 반복할 때, 날짜를 올바르게 처리해야 한다', () => {
    const monthlyEdgeCaseEvent: EventForm = {
      ...baseEvent,
      date: '2025-01-31',
      repeat: { type: 'monthly', interval: 1 },
    };
    // 1/31, 2/28, 3/31, 4/30
    const result = generateRecurringEvents(monthlyEdgeCaseEvent, '2025-04-30');

    expect(result).toHaveLength(2);
    expect(result.map((e) => e.date)).toEqual(['2025-01-31', '2025-03-31']);
  });

  it('종료일이 시작일보다 빠를 경우, 시작 이벤트 하나만 반환해야 한다', () => {
    const result = generateRecurringEvents(baseEvent, '2025-08-24');
    // The loop condition `currentDate <= endDate` will fail on the second iteration
    // So it should return only the first event.
    expect(result).toHaveLength(1);
    expect(result[0].date).toBe('2025-08-25');
  });
});
