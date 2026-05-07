'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import {
  helpApi, applicationsApi, feedbackApi,
  CommunityPost, PostApplication, SubmitFeedbackRequest, CreateHelpRequest,
} from '@/services/api';
import CategoryBadge from '@/components/CategoryBadge';
import StatusBadge from '@/components/StatusBadge';
import StarRating from '@/components/StarRating';

export default function RequestsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [userPosts, setUserPosts] = useState<CommunityPost[]>([]);
  const [applications, setApplications] = useState<PostApplication[]>([]);
  const [loading, setLoading]   = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [postDeleteLoadingId, setPostDeleteLoadingId] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError]       = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const [requestForm, setRequestForm] = useState<CreateHelpRequest>({
    postType: 'SEEK',
    title: '',
    category: 'CHILDCARE',
    description: '',
    urgency: '',
    neededBy: '',
    availability: '',
  });
  const [requestFormError, setRequestFormError] = useState('');
  const [requestFormLoading, setRequestFormLoading] = useState(false);

  // Feedback modal
  const [feedbackTarget, setFeedbackTarget] = useState<PostApplication | null>(null);
  const [feedbackForm, setFeedbackForm] = useState<Omit<SubmitFeedbackRequest, 'postId'>>({
    rating: 5, comment: '',
  });
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError]     = useState('');

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Get user's posts
      const posts = await helpApi.getMyActivity();
      setUserPosts(posts);
      
      // Get applications for each post (incoming applications only)
      const appResults = await Promise.allSettled(
        posts.map((post) => applicationsApi.getApplicationsForPost(post.id))
      );

      setApplications(
        appResults.flatMap((result) => (result.status === 'fulfilled' ? result.value : []))
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  async function handleDeletePost(postId: number) {
    setPostDeleteLoadingId(postId);
    setError('');
    try {
      await helpApi.deletePost(postId);
      setSuccessMsg('Post deleted successfully.');
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to delete post');
    } finally {
      setPostDeleteLoadingId(null);
    }
  }

  useEffect(() => {
    if (!authLoading && !user) { router.replace('/login'); return; }
    if (user) load();
  }, [user, authLoading, router, load]);

  async function doAction(id: number, action: 'accept' | 'reject' | 'complete') {
    setActionLoading(id);
    setError('');
    try {
      if (action === 'accept')   await applicationsApi.acceptApplication(id);
      if (action === 'reject')   await applicationsApi.cancelApplication(id);
      if (action === 'complete') await applicationsApi.acceptApplication(id);
      setSuccessMsg(`Application ${action}ed successfully.`);
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCreateRequest(e: React.FormEvent) {
    e.preventDefault();
    setRequestFormError('');
    setRequestFormLoading(true);

    try {
      const payload: CreateHelpRequest = {
        ...requestForm,
        postType: 'SEEK',
        neededBy: requestForm.neededBy ? new Date(requestForm.neededBy).toISOString() : undefined,
      };

      await helpApi.createRequest(payload);
      setShowCreate(false);
      setRequestForm({
        postType: 'SEEK',
        title: '',
        category: 'CHILDCARE',
        description: '',
        urgency: '',
        neededBy: '',
        availability: '',
      });
      setSuccessMsg('Request posted successfully! ✅');
      load();
    } catch (e: unknown) {
      setRequestFormError(e instanceof Error ? e.message : 'Failed to create request');
    } finally {
      setRequestFormLoading(false);
    }
  }

  async function handleFeedback() {
    if (!feedbackTarget || !user) return;
    setFeedbackError('');
    setFeedbackLoading(true);
    try {
      await feedbackApi.submitFeedback(
        feedbackTarget.post.id,
        feedbackForm.rating,
        feedbackForm.comment
      );
      setFeedbackTarget(null);
      setFeedbackForm({ rating: 5, comment: '' });
      setSuccessMsg('Feedback submitted! ⭐');
      load();
    } catch (e: unknown) {
      setFeedbackError(e instanceof Error ? e.message : 'Failed to submit feedback');
    } finally {
      setFeedbackLoading(false);
    }
  }

 
  const pending = applications.filter(r => r.status === 'PENDING');
  const active = applications.filter(r => r.status === 'ACCEPTED' || r.status === 'IN_PROGRESS');
  const past = applications.filter(r => r.status === 'COMPLETED' || r.status === 'CLOSED' || r.status === 'REJECTED');

  function MyPostsSection() {
    if (userPosts.length === 0) return null;

    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">📝 My Posts</h2>
        <div className="flex flex-col gap-3">
          {userPosts.map(post => (
            <div key={post.id} className="card card-body">
              <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: 12 }}>
                <div className="flex gap-3 items-center" style={{ flexWrap: 'wrap' }}>
                  {post.category && <CategoryBadge category={post.category} />}
                  <div>
                    <p className="font-semibold">{post.title}</p>
                    <p className="text-sm text-muted">
                      {post.postType === 'OFFER' ? 'You offered:' : 'You requested:'} {post.description}
                    </p>
                    <div className="flex gap-2 items-center mt-2" style={{ flexWrap: 'wrap' }}>
                      <StatusBadge status={post.status} />
                      {post.createdAt && (
                        <p className="text-sm text-muted">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  className="btn btn-danger btn-sm"
                  disabled={postDeleteLoadingId === post.id}
                  onClick={() => handleDeletePost(post.id)}
                >
                  {postDeleteLoadingId === post.id ? 'Deleting…' : '🗑 Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function Section({ title, items }: { title: string; items: PostApplication[] }) {
    if (items.length === 0) return null;
    return (
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <div className="flex flex-col gap-3">
          {items.map(app => (
            <div key={app.id} className="card card-body">
              <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: 12 }}>
                <div className="flex gap-3 items-center" style={{ flexWrap: 'wrap' }}>
                  {app.post?.category && <CategoryBadge category={app.post.category} />}
                  <div>
                    <p className="font-semibold">{app.post?.title}</p>
                    <p className="text-sm text-muted">
                      📝 {app.post?.postType === 'OFFER' ? 'You offered:' : 'You needed:'} {app.post?.description}
                    </p>
                    {app.applicantFamily?.familyName && (
                      <p className="text-sm text-muted">👨‍👩‍👧 From: {app.applicantFamily.familyName}</p>
                    )}
                    {app.applicationMessage && (
                      <p className="text-sm mt-2">💬 &quot;{app.applicationMessage}&quot;</p>
                    )}
                    {app.createdAt && (
                      <p className="text-sm text-muted">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 items-center" style={{ flexWrap: 'wrap' }}>
                  <StatusBadge status={app.status} />
                  {app.status === 'PENDING' && (
                    <>
                      <button
                        className="btn btn-primary btn-sm"
                        disabled={actionLoading === app.id}
                        onClick={() => doAction(app.id, 'accept')}
                      >
                        {actionLoading === app.id ? '…' : '✅ Accept'}
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        disabled={actionLoading === app.id}
                        onClick={() => doAction(app.id, 'reject')}
                      >
                        {actionLoading === app.id ? '…' : '❌ Reject'}
                      </button>
                    </>
                  )}
                  {(app.status === 'ACCEPTED' || app.status === 'IN_PROGRESS') && (
                    <button
                      className="btn btn-primary btn-sm"
                      disabled={actionLoading === app.id}
                      onClick={() => doAction(app.id, 'complete')}
                    >
                      {actionLoading === app.id ? '…' : '🎉 Mark Complete'}
                    </button>
                  )}
                  {(app.status === 'COMPLETED' || app.status === 'CLOSED') && (
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => setFeedbackTarget(app)}
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
          <h1>📋 Help Requests & Applications</h1>
          <p>Track applications received for your posts and manage your requests to others.</p>
          <div style={{ marginTop: 16 }}>
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
              + Post a Request
            </button>
          </div>
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
        ) : applications.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📭</div>
            <h3>No applications yet</h3>
            <p>Post offers or requests to get applications from the community.</p>
          </div>
        ) : (
          <>
            <MyPostsSection />
            {applications.length === 0 ? (
              <div className="empty-state">
                <div className="icon">📭</div>
                <h3>No applications yet</h3>
                <p>Your posts are listed above. Applications from the community will appear here.</p>
              </div>
            ) : (
              <>
                <Section title="⏳ Pending" items={pending} />
                <Section title="✅ Active" items={active} />
                <Section title="📁 Past" items={past} />
              </>
            )}
          </>
        )}
      </div>

      {/* Feedback Modal */}
      {feedbackTarget && (
        <div className="modal-overlay" onClick={() => setFeedbackTarget(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Leave Feedback</h2>
            <p className="text-sm text-muted mb-4">
              Rate your experience with: <strong>{feedbackTarget.applicantFamily?.familyName}</strong>
            </p>
            <p className="text-sm text-muted mb-4">
              For: <strong>{feedbackTarget.post?.title}</strong>
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

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Post a New Request</h2>
            {requestFormError && <div className="alert alert-error mb-4">{requestFormError}</div>}
            <form onSubmit={handleCreateRequest} className="form-stack">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={requestForm.category}
                  onChange={e => setRequestForm(f => ({ ...f, category: e.target.value }))}
                >
                  <option value="SHOPPING">Shopping</option>
                  <option value="CHILDCARE">Childcare</option>
                  <option value="TUTORING">Tutoring</option>
                  <option value="TRANSPORTATION">Transportation</option>
                  <option value="ELDER_CARE">Elder Care</option>
                  <option value="HOUSEHOLD">Household</option>
                  <option value="PETTING">Petting</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  className="form-input"
                  placeholder="e.g. Need school pickup support"
                  value={requestForm.title}
                  onChange={e => setRequestForm(f => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  placeholder="Describe what help you need..."
                  value={requestForm.description}
                  onChange={e => setRequestForm(f => ({ ...f, description: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Urgency (optional)</label>
                <input
                  className="form-input"
                  placeholder="e.g. Within 24 hours"
                  value={requestForm.urgency || ''}
                  onChange={e => setRequestForm(f => ({ ...f, urgency: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Needed By (optional)</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={requestForm.neededBy || ''}
                  onChange={e => setRequestForm(f => ({ ...f, neededBy: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Availability (optional)</label>
                <input
                  className="form-input"
                  placeholder="e.g. Weekdays after 3pm"
                  value={requestForm.availability || ''}
                  onChange={e => setRequestForm(f => ({ ...f, availability: e.target.value }))}
                />
              </div>
              <div className="flex gap-3">
                <button type="button" className="btn btn-ghost btn-full" onClick={() => setShowCreate(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-full" disabled={requestFormLoading}>
                  {requestFormLoading ? 'Posting…' : 'Post Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
