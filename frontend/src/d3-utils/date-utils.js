import {
  endOfMonth,
  format,
  startOfMonth,
  startOfWeek,
  endOfWeek,
} from "date-fns";

function prettifyDate(date) {
  return format(date, "PPPP");
}

// given the end date of current week
function getPreviousWeekDates(date) {
  const d = new Date(date.getTime());
  const d2 = new Date(date.getTime());
  d.setDate(d.getDate() - 13);
  d2.setDate(d2.getDate() - 7);
  return { start: d, end: d2 };
}

// given the end date of current week
function getNextWeekDates(date) {
  const d = new Date(date.getTime());
  const d2 = new Date(date.getTime());
  d.setDate(d.getDate() + 1);
  d2.setDate(d2.getDate() + 7);
  return { start: d, end: d2 };
}

function getWeekDates(date) {
  const startDate = startOfWeek(date, { weekStartsOn: 1 });
  startDate.setHours(12);
  return { start: startDate, end: endOfWeek(date, { weekStartsOn: 1 }) };
}

function getMonthDates(date) {
  const startDate = startOfMonth(date);
  startDate.setHours(12);
  return { start: startDate, end: endOfMonth(date) };
}

export {
  prettifyDate,
  getPreviousWeekDates,
  getNextWeekDates,
  getWeekDates,
  getMonthDates,
};
