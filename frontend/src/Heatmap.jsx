import React from 'react';

// Renders the last N days as small colored squares, like GitHub's
// contribution graph. Darker green = a higher fraction of that day's
// tasks were completed.
export default function Heatmap({ history, days = 90 }) {
  const byDate = Object.fromEntries(history.map((h) => [h.task_date.slice(0, 10), h]));

  const cells = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const entry = byDate[key];
    const ratio = entry && Number(entry.total) > 0 ? Number(entry.done) / Number(entry.total) : null;
    cells.push({ key, ratio });
  }

  const colorFor = (ratio) => {
    if (ratio === null) return 'bg-gray-100 dark:bg-gray-800';
    if (ratio === 0) return 'bg-red-200 dark:bg-red-900/50';
    if (ratio < 1) return 'bg-brand-200 dark:bg-brand-900/60';
    return 'bg-brand-500 dark:bg-brand-500';
  };

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
        Last {days} days
      </h2>
      <div className="grid grid-cols-13 gap-1" style={{ gridTemplateColumns: 'repeat(13, minmax(0, 1fr))' }}>
        {cells.map((c) => (
          <div
            key={c.key}
            title={c.key}
            className={`w-3.5 h-3.5 rounded-sm ${colorFor(c.ratio)}`}
          />
        ))}
      </div>
    </div>
  );
}
