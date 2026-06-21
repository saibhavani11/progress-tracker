import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth, API_URL } from './AuthContext.jsx';
import AuthScreen from './AuthScreen.jsx';
import WeeklyStreak from './WeeklyStreak.jsx';
import { enablePushNotifications } from './push.js';

function authedFetch(token) {
  return (path, options = {}) =>
    fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
}

function Tracker() {
  const { user, token, logout } = useAuth();
  const fetchApi = authedFetch(token);

  const [dark, setDark] = useState(() => localStorage.getItem('dark') === 'true');
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [streak, setStreak] = useState(0);
  const [history, setHistory] = useState([]);
  const [notifStatus, setNotifStatus] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  const handleEnableNotifications = async () => {
    try {
      await enablePushNotifications(token);
      setNotifStatus('granted');
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('dark', dark);
  }, [dark]);

  const loadAll = async () => {
    const [tasksRes, streakRes, historyRes] = await Promise.all([
      fetchApi('/tasks').then((r) => r.json()),
      fetchApi('/tasks/streak').then((r) => r.json()),
      fetchApi('/tasks/history').then((r) => r.json()),
    ]);
    setTasks(tasksRes);
    setStreak(streakRes.streak);
    setHistory(historyRes);
  };

  useEffect(() => { loadAll(); }, []);

  const addTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await fetchApi('/tasks', { method: 'POST', body: JSON.stringify({ title }) });
    setTitle('');
    loadAll();
  };

  const toggle = async (id) => {
    await fetchApi(`/tasks/${id}/toggle`, { method: 'PATCH' });
    loadAll();
  };

  const remove = async (id) => {
    await fetchApi(`/tasks/${id}`, { method: 'DELETE' });
    loadAll();
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPct = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;
  const pendingCount = tasks.length - completedCount;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="max-w-2xl mx-auto px-4 pt-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hey {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Let's keep the streak alive.</p>
        </div>
        <div className="flex items-center gap-3">
          {notifStatus === 'default' && (
            <button
              onClick={handleEnableNotifications}
              className="text-sm px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white"
            >
              🔔 Enable reminders
            </button>
          )}
          {notifStatus === 'granted' && (
            <span className="text-sm text-gray-400">🔔 Reminders on</span>
          )}
          <button
            onClick={() => setDark(!dark)}
            className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600"
          >
            {dark ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button onClick={logout} className="text-sm text-gray-500 hover:text-red-500">
            Log out
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {tasks.length === 0 ? (
          // Calm, focused "plan your day" screen instead of an empty dashboard.
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 text-center">
            <p className="text-2xl mb-2">☀️</p>
            <h2 className="text-xl font-semibold mb-1">What's on your mind today?</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">
              Add it before the day takes over.
            </p>
            <form onSubmit={addTask} className="flex gap-2 max-w-sm mx-auto">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Finish DSA practice"
                autoFocus
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-medium">
                Add
              </button>
            </form>
          </div>
        ) : (
          <>


          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4">
    <p className="text-sm text-gray-500">Total</p>
    <p className="text-2xl font-bold">{tasks.length}</p>
  </div>

  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4">
    <p className="text-sm text-gray-500">Done</p>
    <p className="text-2xl font-bold text-green-500">{completedCount}</p>
  </div>

  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4">
    <p className="text-sm text-gray-500">Pending</p>
    <p className="text-2xl font-bold text-yellow-500">{pendingCount}</p>
  </div>

  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4">
    <p className="text-sm text-gray-500">Success</p>
    <p className="text-2xl font-bold text-blue-500">{progressPct}%</p>
  </div>
</div>
          
        {/* Streak + progress card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Current streak</p>
            <p className="text-3xl font-bold">🔥 {streak} <span className="text-base font-normal">day{streak === 1 ? '' : 's'}</span></p>
          </div>
          <div className="w-32">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 text-right">{progressPct}% today</p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-brand-500 h-2 rounded-full transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Heatmap card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5">
  <WeeklyStreak streak={streak} />
</div>

        {/* Task list card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5">
          <form onSubmit={addTask} className="flex gap-2 mb-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add another task"
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-medium">
              Add
            </button>
          </form>

          <ul className="space-y-2">
            {tasks.map((t) => (
              <li
                key={t.id}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 group"
              >
                <input
                  type="checkbox"
                  checked={t.completed}
                  onChange={() => toggle(t.id)}
                  className="w-5 h-5 accent-brand-600"
                />
                <span className={`flex-1 ${t.completed ? 'line-through text-gray-400' : ''}`}>
                  {t.title}
                </span>
                <button
                  onClick={() => remove(t.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
        </>
        )}
      </main>
    </div>
  );
}

function Root() {
  const { token } = useAuth();
  return token ? <Tracker /> : <AuthScreen />;
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}
