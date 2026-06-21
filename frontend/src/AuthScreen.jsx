import React, { useState } from 'react';
import { useAuth } from './AuthContext.jsx';

export default function AuthScreen() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await signup(name, email, password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-1">🔥 Progress</h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-6 text-sm">
          {mode === 'login' ? 'Welcome back' : 'Start your streak today'}
        </p>

        <form onSubmit={submit} className="space-y-3">
          {mode === 'signup' && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            minLength={6}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-500"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
            className="text-brand-600 dark:text-brand-500 font-medium hover:underline"
          >
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  );
}
