import React from 'react';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

// Renders a GitHub-style contribution graph: columns are weeks, rows are
// weekdays (Sun=0 ... Sat=6). Darker green = more of that day's tasks done.
export default function Heatmap({ history, days = 90 }) {
  const byDate = Object.fromEntries(history.map((h) => [h.task_date.slice(0, 10), h]));

  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - (days - 1));
  // Walk back to the most recent Sunday so the grid's first column is a full week.
  start.setDate(start.getDate() - start.getDay());

  const weeks = [];
  let cursor = new Date(start);
  while (cursor <= today) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const key = cursor.toISOString().slice(0, 10);
      if (cursor > today) {
        week.push(null); // future day, render as empty space
      } else {
        const entry = byDate[key];
        const ratio = entry && Number(entry.total) > 0 ? Number(entry.done) / Number(entry.total) : null;
        week.push({ key, ratio, month: cursor.getMonth(), isFirstOfMonth: cursor.getDate() <= 7 });
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  const colorFor = (cell) => {
    if (!cell) return 'bg-transparent';
    if (cell.ratio === null) return 'bg-gray-100 dark:bg-gray-800';
    if (cell.ratio === 0) return 'bg-red-200 dark:bg-red-900/50';
    if (cell.ratio < 1) return 'bg-brand-200 dark:bg-brand-900/60';
    return 'bg-brand-500 dark:bg-brand-500';
  };

  // Figure out which week-column should carry each month's label (only label it once).
  const monthLabelForWeek = weeks.map((week, i) => {
    const firstRealDay = week.find((c) => c);
    if (!firstRealDay) return null;
    const prevWeek = weeks[i - 1];
    const prevMonth = prevWeek ? prevWeek.find((c) => c)?.month : null;
    return firstRealDay.month !== prevMonth ? MONTH_NAMES[firstRealDay.month] : null;
  });

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
        Last {days} days
      </h2>
      <div className="flex gap-1 text-xs">
        {/* Weekday labels */}
        <div className="flex flex-col gap-1 mr-1 pt-4">
          {DAY_LABELS.map((label, i) => (
            <span key={i} className="h-3.5 leading-3.5 text-gray-400 dark:text-gray-500">{label}</span>
          ))}
        </div>

        <div className="flex flex-col">
          {/* Month labels */}
          <div className="flex gap-1 mb-1 h-3">
            {weeks.map((_, i) => (
              <span key={i} className="w-3.5 text-gray-400 dark:text-gray-500 whitespace-nowrap">
                {monthLabelForWeek[i] || ''}
              </span>
            ))}
          </div>
          {/* The grid itself, week columns left-to-right */}
          <div className="flex gap-1">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((cell, di) => (
                  <div
                    key={di}
                    title={cell ? cell.key : ''}
                    className={`w-3.5 h-3.5 rounded-sm ${colorFor(cell)}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
