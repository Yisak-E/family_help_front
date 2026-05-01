'use client';
// app/register/page.tsx

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    role: '',
    familyName: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    familySize: 1,
  });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) =>
    setForm(f => ({ ...f, [field]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    setLoading(true);
    try {
      await register({
        familyName: form.familyName,
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        role: form.role,
        familySize: form.familySize,
        address: form.address || undefined,
      });
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      {/* Sidebar */}
      <div className="auth-sidebar">
        <h1>Join <span style={{color:'#fbbf24'}}>FamilyHelpUAE</span></h1>
        <p>
          Register your family today and start giving and receiving support
          within a trusted local community network.
        </p>
        <div className="auth-feature">
          <span className="icon">👶</span>
          <div className="auth-feature-text">
            <h4>Childcare</h4><p>Trusted families helping watch over little ones.</p>
          </div>
        </div>
        <div className="auth-feature">
          <span className="icon">📚</span>
          <div className="auth-feature-text">
            <h4>Tutoring</h4><p>Share knowledge, support learning journeys.</p>
          </div>
        </div>
        <div className="auth-feature">
          <span className="icon">🚗</span>
          <div className="auth-feature-text">
            <h4>Transportation</h4><p>Lift-sharing and school runs made easy.</p>
          </div>
        </div>
        <div className="auth-feature">
          <span className="icon">💛</span>
          <div className="auth-feature-text">
            <h4>Elder Care</h4><p>Support and companionship for older family members.</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="auth-form-side">
        <div className="auth-form-box">
          <h2>Create Account</h2>
          <p className="subtitle">Set up your family profile in seconds</p>

          {error && <div className="alert alert-error mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="form-stack">

            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="John"
                value={form.firstName}
                onChange={e => update('firstName', e.target.value)}
                required
              />
            </div>

              <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Johnson"
                value={form.lastName}
                onChange={e => update('lastName', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Family Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="The Johnson Family"
                value={form.familyName}
                onChange={e => update('familyName', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Family Size *</label>
              <input
                type="number"
                className="form-input"
                placeholder="4"
                value={form.familySize}
                onChange={e => update('familySize', e.target.value)}
                min={1}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-input"
                placeholder="family@example.com"
                value={form.email}
                onChange={e => update('email', e.target.value)}
                required
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => update('password', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={e => update('confirmPassword', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Role *</label>
              <select
                className="form-input"
                value={form.role}
                onChange={e => update('role', e.target.value)}
                required
              >
                <option value="">Select a role</option>
                <option value="PARENT">Parent</option>
                <option value="CHILD">Child</option>
                <option value="GRANDPARENT">Grandparent</option>
                <option value="OTHER">Other</option>
          
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Address / Neighbourhood</label>
              <input
                type="text"
                className="form-input"
                placeholder="Al Reem Island, Abu Dhabi"
                value={form.address}
                onChange={e => update('address', e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
            >
              {loading ? 'Creating account…' : 'Create Family Account'}
            </button>
          </form>

          <p className="auth-link">
            Already have an account? <Link href="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
