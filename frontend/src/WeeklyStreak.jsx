import React from 'react';

export default function WeeklyStreak({ streak }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date().getDay();

// JS:
// 0 = Sunday
// 1 = Monday
// ...
// 6 = Saturday

const currentDayIndex = today === 0 ? 6 : today - 1;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold">Weekly Progress</h2>
        <span className="text-sm text-gray-500">
          🔥 {streak} day{streak === 1 ? '' : 's'} streak
        </span>
      </div>

      <div className="flex justify-between items-center">
        {days.map((day, index) => {
          const active =
  index >= currentDayIndex - streak + 1 &&
  index <= currentDayIndex;

          return (
            <div
              key={day}
              className="flex flex-col items-center"
            >
              <div
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  font-semibold transition-all duration-300
                  ${
                    active
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                  }
                `}
              >
                {active ? '✓' : ''}
              </div>

              <span className="mt-2 text-sm text-gray-500">
                {day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}