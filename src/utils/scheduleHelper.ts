import { TIMETABLE_DATA, SUBJECT_METADATA } from '../components/schedule/scheduleData';
import { getSubjectCode } from './subjectMatcher';

export interface NextClassSuggestion {
  subjectCode: string;
  subjectName: string;
  dateStr: string; // YYYY-MM-DD
  formatted: string; // "Ter, 25/08"
  weekdayName: string; // "Terça-feira"
  timeRange: [string, string];
  isToday: boolean;
}

/**
 * Finds the next upcoming class date for a given subject based on the weekly timetable.
 */
export function getNextClassForSubject(
  subjectNameOrCode?: string | null
): NextClassSuggestion | null {
  if (!subjectNameOrCode) return null;

  // 1. Find matching subject code using robust matcher
  const matchedCode = getSubjectCode(subjectNameOrCode);
  if (!matchedCode || !SUBJECT_METADATA[matchedCode]) return null;

  const matchedName = SUBJECT_METADATA[matchedCode].name;

  // 2. Find all day-indexes (0 = Seg, 1 = Ter, 2 = Qua, 3 = Qui, 4 = Sex) where this subject occurs
  const classDays: { dayIndex: number; timeRange: [string, string] }[] = [];

  TIMETABLE_DATA.forEach((slot) => {
    if (!slot.isInterval && slot.dias) {
      slot.dias.forEach((dayCode, dayIdx) => {
        if (dayCode === matchedCode) {
          classDays.push({ dayIndex: dayIdx, timeRange: slot.horario });
        }
      });
    }
  });

  if (classDays.length === 0) return null;

  // 3. Scan forward from today up to 7 days ahead
  const today = new Date();
  const currentHourMinute = `${String(today.getHours()).padStart(2, '0')}:${String(
    today.getMinutes()
  ).padStart(2, '0')}`;

  const dayMap: Record<number, number> = {
    1: 0, // Seg -> dayIndex 0
    2: 1, // Ter -> dayIndex 1
    3: 2, // Qua -> dayIndex 2
    4: 3, // Qui -> dayIndex 3
    5: 4, // Sex -> dayIndex 4
  };

  // Check from today (+0) if class hasn't passed, up to +7 days ahead
  for (let offset = 0; offset <= 7; offset++) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + offset);

    const targetJsDay = targetDate.getDay();
    if (targetJsDay >= 1 && targetJsDay <= 5) {
      const timetableDayIdx = dayMap[targetJsDay];
      const match = classDays.find((cd) => cd.dayIndex === timetableDayIdx);

      if (match) {
        // If it's today (offset = 0), check if class already ended
        if (offset === 0) {
          if (currentHourMinute > match.timeRange[1]) {
            // Already ended today, continue searching next days
            continue;
          }
        }

        const dateStr = targetDate.toISOString().split('T')[0];
        const rawWeekday = targetDate.toLocaleDateString('pt-BR', { weekday: 'short' });
        const cleanWeekday =
          rawWeekday.replace('.', '').charAt(0).toUpperCase() +
          rawWeekday.replace('.', '').slice(1);
        const dayMonth = targetDate.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
        });
        const weekdayFullName = targetDate.toLocaleDateString('pt-BR', { weekday: 'long' });

        return {
          subjectCode: matchedCode,
          subjectName: matchedName,
          dateStr,
          formatted: `${cleanWeekday}, ${dayMonth}`,
          weekdayName: weekdayFullName.charAt(0).toUpperCase() + weekdayFullName.slice(1),
          timeRange: match.timeRange,
          isToday: offset === 0,
        };
      }
    }
  }

  return null;
}
