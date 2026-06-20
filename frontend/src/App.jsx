import React, { useEffect, useState } from 'react';

// Point this at your backend. In docker-compose this becomes the service name.
const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [streak, setStreak] = useState(0);

  const loadTasks = () => {
    fetch(`${API}/tasks`).then(r => r.json()).then(setTasks);
  };

  const loadStreak = () => {
    fetch(`${API}/tasks/streak`).then(r => r.json()).then(d => setStreak(d.streak));
  };

  useEffect(() => {
    loadTasks();
    loadStreak();
  }, []);

  const addTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await fetch(`${API}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    setTitle('');
    loadTasks();
  };

  const toggle = async (id) => {
    await fetch(`${API}/tasks/${id}/toggle`, { method: 'PATCH' });
    loadTasks();
    loadStreak();
  };

  return (
    <div style={{ maxWidth: 480, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Today's Progress</h1>
      <p>🔥 Current streak: <strong>{streak}</strong> day(s)</p>

      <form onSubmit={addTask} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task for today"
          style={{ flex: 1, padding: 8 }}
        />
        <button type="submit">Add</button>
      </form>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {tasks.map((t) => (
          <li key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 6 }}>
            <input type="checkbox" checked={t.completed} onChange={() => toggle(t.id)} />
            <span style={{ textDecoration: t.completed ? 'line-through' : 'none' }}>
              {t.title}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
