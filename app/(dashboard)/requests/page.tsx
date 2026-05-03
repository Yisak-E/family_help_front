'use client';
// app/requests/page.tsx
// Covers: GET /api/help/my-activity (pending requests), PATCH /api/applications/{id}/accept,
//         DELETE /api/applications/{id}/cancel, POST /api/feedback/submit/{postId}

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import {
  familiesApi, requestsApi, feedbackApi,
  HelpRequest, CreateFeedbackRequest,
} from '@/services/api';
import CategoryBadge from '@/components/CategoryBadge';
import StatusBadge from '@/components/StatusBadge';
import StarRating from '@/components/StarRating';

export default function RequestsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading]   = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError]       = useState('');

  // Feedback modal
  const [feedbackTarget, setFeedbackTarget] = useState<HelpRequest | null>(null);
  const [feedbackForm, setFeedbackForm] = useState<Omit<CreateFeedbackRequest, 'postId'>>({
    rating: 5, comment: '',
  });
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError]     = useState('');

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const history = await familiesApi.getHistory(user.familyId);
      // Map history entries to HelpRequest shape so we can use them
      const mapped = history.map((h): HelpRequest => ({
        id: String(h.id),
        requesterFamilyId: user.familyId,
        offerId: '',
        status: h.status,
        offerTitle: h.title,
        category: h.category,
        createdAt: h.createdAt,
        requesterFamilyName: user.familyName,
      }));
      setRequests(mapped);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) { router.replace('/login'); return; }
    if (user) load();
  }, [user, authLoading, router, load]);

  async function doAction(id: string, action: 'accept' | 'reject' | 'complete') {
    setActionLoading(id + action);
    setError('');
    try {
      if (action === 'accept')   await requestsApi.accept(id);
      if (action === 'reject')   await requestsApi.reject(id);
      if (action === 'complete') await requestsApi.complete(id);
      setSuccessMsg(`Request ${action}ed successfully.`);
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleFeedback() {
    if (!feedbackTarget || !user) return;
    setFeedbackError('');
    setFeedbackLoading(true);
    try {
      await feedbackApi.submit({
        postId: Number(feedbackTarget.id),
        rating: feedbackForm.rating,
        comment: feedbackForm.comment,
      });
      setFeedbackTarget(null);
      setFeedbackForm({ rating: 5, comment: '' });
      setSuccessMsg('Feedback submitted! ⭐');
    } catch (e: unknown) {
      setFeedbackError(e instanceof Error ? e.message : 'Failed to submit feedback');
    } finally {
      setFeedbackLoading(false);
    }
  }

  const pending   = requests.filter(r => r.status === 'PENDING');
  const active    = requests.filter(r => r.status === 'ACCEPTED');
  const past      = requests.filter(r => r.status === 'COMPLETED' || r.status === 'REJECTED');

  function Section({ title, items }: { title: string; items: HelpRequest[] }) {
    if (items.length === 0) return null;
    return (
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <div className="flex flex-col gap-3">
          {items.map(req => (
            <div key={req.id} className="card card-body">
              <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: 12 }}>
                <div className="flex gap-3 items-center" style={{ flexWrap: 'wrap' }}>
                  {req.category && <CategoryBadge category={req.category} />}
                  <div>
                    <p className="font-semibold">{req.offerTitle || `Request #${req.id.slice(0,8)}`}</p>
                    {req.requesterFamilyName && (
                      <p className="text-sm text-muted">👨‍👩‍👧 {req.requesterFamilyName}</p>
                    )}
                    {req.createdAt && (
                      <p className="text-sm text-muted">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 items-center" style={{ flexWrap: 'wrap' }}>
                  <StatusBadge status={req.status} />
                  {req.status === 'PENDING' && (
                    <>
                      <button
                        className="btn btn-primary btn-sm"
                        disabled={actionLoading === req.id + 'accept'}
                        onClick={() => doAction(req.id, 'accept')}
                      >
                        {actionLoading === req.id + 'accept' ? '…' : '✅ Accept'}
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        disabled={actionLoading === req.id + 'reject'}
                        onClick={() => doAction(req.id, 'reject')}
                      >
                        {actionLoading === req.id + 'reject' ? '…' : '❌ Reject'}
                      </button>
                    </>
                  )}
                  {req.status === 'ACCEPTED' && (
                    <button
                      className="btn btn-primary btn-sm"
                      disabled={actionLoading === req.id + 'complete'}
                      onClick={() => doAction(req.id, 'complete')}
                    >
                      {actionLoading === req.id + 'complete' ? '…' : '🎉 Mark Complete'}
                    </button>
                  )}
                  {req.status === 'COMPLETED' && (
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => setFeedbackTarget(req)}
                    >
                      ⭐ Leave Feedback
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page-header">
        <div className="container">
          <h1>📋 Help Requests</h1>
          <p>Manage incoming and outgoing help requests.</p>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px' }}>
        {successMsg && (
          <div className="alert alert-success mb-4">
            {successMsg}
            <button onClick={() => setSuccessMsg('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
          </div>
        )}
        {error && <div className="alert alert-error mb-4">{error}</div>}

        {loading ? (
          <div className="flex justify-center" style={{ padding: '60px 0' }}>
            <div className="spinner" />
          </div>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📭</div>
            <h3>No requests yet</h3>
            <p>Browse offers and request community help to get started.</p>
          </div>
        ) : (
          <>
            <Section title="⏳ Pending" items={pending} />
            <Section title="✅ Active" items={active} />
            <Section title="📁 Past" items={past} />
          </>
        )}
      </div>

      {/* Feedback Modal */}
      {feedbackTarget && (
        <div className="modal-overlay" onClick={() => setFeedbackTarget(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Leave Feedback</h2>
            <p className="text-sm text-muted mb-4">
              Rate your experience for: <strong>{feedbackTarget.offerTitle}</strong>
            </p>
            {feedbackError && <div className="alert alert-error mb-4">{feedbackError}</div>}
            <div className="form-group mb-4">
              <label className="form-label">Rating</label>
              <StarRating
                value={feedbackForm.rating}
                onChange={v => setFeedbackForm(f => ({ ...f, rating: v }))}
              />
            </div>
            <div className="form-group mb-4">
              <label className="form-label">Comment (optional)</label>
              <textarea
                className="form-textarea"
                placeholder="Share your experience..."
                value={feedbackForm.comment}
                onChange={e => setFeedbackForm(f => ({ ...f, comment: e.target.value }))}
              />
            </div>
            <div className="flex gap-3">
              <button className="btn btn-ghost btn-full" onClick={() => setFeedbackTarget(null)}>Cancel</button>
              <button className="btn btn-primary btn-full" onClick={handleFeedback} disabled={feedbackLoading}>
                {feedbackLoading ? 'Submitting…' : 'Submit Feedback'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
