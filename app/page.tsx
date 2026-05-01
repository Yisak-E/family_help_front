'use client';
// app/login/page.tsx

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      {/* Sidebar */}
      <div className="auth-sidebar">
        <h1>Welcome back to FamilyHelp<span style={{color:'#fbbf24'}}>UAE</span></h1>
        <p>Connect with your community. Offer a hand, ask for one. Together, families thrive.</p>
        <div className="auth-feature">
          <span className="icon">🤝</span>
          <div className="auth-feature-text">
            <h4>Community-First</h4>
            <p>Trusted families helping each other with real everyday needs.</p>
          </div>
        </div>
        <div className="auth-feature">
          <span className="icon">🔒</span>
          <div className="auth-feature-text">
            <h4>Secure &amp; Private</h4>
            <p>JWT-protected sessions. Your data stays yours.</p>
          </div>
        </div>
        <div className="auth-feature">
          <span className="icon">⭐</span>
          <div className="auth-feature-text">
            <h4>Reputation System</h4>
            <p>Build trust through verified community interactions.</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="auth-form-side">
        <div className="auth-form-box">
          <h2>Sign In</h2>
          <p className="subtitle">Enter your family account credentials</p>

          {error && <div className="alert alert-error mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="form-stack">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="family@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="auth-link">
            Don&apos;t have an account?{' '}
            <Link href="/register">Create one — it&apos;s free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
