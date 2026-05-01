'use client';
// app/feedback/page.tsx
// Covers: POST /api/feedback

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { feedbackApi } from '@/services/api';
import StarRating from '@/components/StarRating';

export default function FeedbackPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    toFamilyId: '',
    requestId: '',
    rating: 5,
    comment: '',
  });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await feedbackApi.submit({
        toFamilyId: form.toFamilyId,
        requestId: form.requestId,
        rating: form.rating,
        comment: form.comment || undefined,
      });
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <div className="page-header">
        <div className="container">
          <h1>⭐ Submit Feedback</h1>
          <p>Rate and review your experience with another family.</p>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px', maxWidth: 600 }}>
        {success ? (
          <div className="card card-body text-center" style={{ padding: '60px 40px' }}>
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: 8 }}>
              Feedback Submitted!
            </h2>
            <p className="text-muted mb-6">Thank you for helping build trust in the community.</p>
            <button className="btn btn-primary" onClick={() => { setSuccess(false); setForm({ toFamilyId: '', requestId: '', rating: 5, comment: '' }); }}>
              Submit Another
            </button>
          </div>
        ) : (
          <div className="card">
            <div className="card-body">
              {error && <div className="alert alert-error mb-4">{error}</div>}
              <form onSubmit={handleSubmit} className="form-stack">
                <div className="form-group">
                  <label className="form-label">Family ID (recipient) *</label>
                  <input
                    className="form-input"
                    placeholder="Paste the family's ID"
                    value={form.toFamilyId}
                    onChange={e => setForm(f => ({ ...f, toFamilyId: e.target.value }))}
                    required
                  />
                  <span className="form-error" style={{ color: 'var(--slate-600)', fontWeight: 400 }}>
                    You can find family IDs in your interaction history.
                  </span>
                </div>
                <div className="form-group">
                  <label className="form-label">Request ID *</label>
                  <input
                    className="form-input"
                    placeholder="Paste the request ID"
                    value={form.requestId}
                    onChange={e => setForm(f => ({ ...f, requestId: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Your Rating *</label>
                  <StarRating
                    value={form.rating}
                    onChange={v => setForm(f => ({ ...f, rating: v }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Comment (optional)</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Describe your experience with this family..."
                    value={form.comment}
                    onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                  {loading ? 'Submitting…' : '⭐ Submit Feedback'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
