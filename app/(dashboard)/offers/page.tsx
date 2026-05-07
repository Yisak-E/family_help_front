'use client';
// app/offers/page.tsx
// Covers:  GET /api/help/posts, POST /api/help/posts, POST /api/applications/apply/{postId}

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import {
  helpApi, offersApi, applicationsApi,
  Offer, ServiceCategory, CreatePostRequest, PostApplication,
} from '@/services/api';
import CategoryBadge from '@/components/CategoryBadge';

const CATEGORIES: ServiceCategory[] = [
'SHOPPING', "CHILDCARE", 'TUTORING', 'TRANSPORTATION', 'ELDER_CARE', 'HOUSEHOLD',
];

const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  SHOPPING: 'Shopping',
  PETTING:'petting',
  CHILDCARE: 'Childcare',
  TUTORING: 'Tutoring',
  TRANSPORTATION: 'Transportation',
  ELDER_CARE: 'Elder Care',
  HOUSEHOLD: 'Household',
};

export default function OffersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [offers, setOffers]         = useState<Offer[]>([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState<ServiceCategory | ''>('');
  const [showCreate, setShowCreate] = useState(searchParams.get('create') === '1');
  const [showRequest, setShowRequest] = useState<Offer | null>(null);
  const [applicationStatusByOffer, setApplicationStatusByOffer] = useState<
    Record<string, { id: number; status: PostApplication['status'] } | undefined>
  >({});

  // Create offer form (maps to CreatePostRequest)
  const [offerForm, setOfferForm] = useState<CreatePostRequest>({
    postType: 'OFFER',
    category: 'CHILDCARE',
    title: '',
    description: '',
    urgency: '',
    neededBy: '',
    
  });
  const [offerError, setOfferError]   = useState('');
  const [offerLoading, setOfferLoading] = useState(false);

  // Request message
  const [requestMsg, setRequestMsg]     = useState('');
  const [requestError, setRequestError] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);
  const [cancelLoadingId, setCancelLoadingId] = useState<number | null>(null);
  const [postDeleteLoadingId, setPostDeleteLoadingId] = useState<number | null>(null);
  const [pageError, setPageError] = useState('');

  const [successMsg, setSuccessMsg] = useState('');

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await offersApi.list(filter || undefined);
      setOffers(data);

      if (user) {
        const statuses = await Promise.all(
          data.map(async (offer) => {
            const postId = Number(offer.id);
            if (Number.isNaN(postId)) return [offer.id, undefined] as const;

            try {
              const applications = await applicationsApi.getApplicationsForPost(postId);
              const mine = applications.find(app => String(app.applicantFamily?.id) === String(user.familyId));
              return [offer.id, mine ? { id: mine.id, status: mine.status } : undefined] as const;
            } catch {
              return [offer.id, undefined] as const;
            }
          })
        );

        setApplicationStatusByOffer(Object.fromEntries(statuses));
      } else {
        setApplicationStatusByOffer({});
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filter, user]);

  useEffect(() => {
    if (!authLoading && !user) { router.replace('/login'); return; }
    if (user) fetchOffers();
  }, [user, authLoading, router, fetchOffers]);

  async function handleCreateOffer(e: React.FormEvent) {
    e.preventDefault();
    setOfferError('');
    setOfferLoading(true);
    try {
      // Ensure neededBy is ISO before sending
      const payload: CreatePostRequest = {
        ...offerForm,
        neededBy: offerForm.neededBy ? new Date(offerForm.neededBy).toISOString() : undefined,
      };
      await offersApi.create(payload);
      setShowCreate(false);
      setOfferForm({ postType: 'OFFER', category: 'CHILDCARE', title: '', description: '', urgency: '', neededBy: '' });
      setSuccessMsg('Offer posted successfully! 🎉');
      fetchOffers();
    } catch (err: unknown) {
      setOfferError(err instanceof Error ? err.message : 'Failed to create offer');
    } finally {
      setOfferLoading(false);
    }
  }

  async function handleRequest() {
    if (!showRequest) return;
    setRequestError('');
    setRequestLoading(true);
    try {
      await applicationsApi.applyToPost(Number(showRequest.id), requestMsg || undefined);
      setShowRequest(null);
      setRequestMsg('');
      setSuccessMsg('Help request sent! ✅');
      fetchOffers();
    } catch (err: unknown) {
      setRequestError(err instanceof Error ? err.message : 'Failed to send request');
    } finally {
      setRequestLoading(false);
    }
  }

  async function handleCancelRequest(offerId: string) {
    const application = applicationStatusByOffer[offerId];
    if (!application) return;

    setPageError('');
    setCancelLoadingId(application.id);
    try {
      await applicationsApi.cancelApplication(application.id);
      setShowRequest(null);
      setRequestMsg('');
      setSuccessMsg('Request canceled successfully.');
      fetchOffers();
    } catch (err: unknown) {
      setPageError(err instanceof Error ? err.message : 'Failed to cancel request');
    } finally {
      setCancelLoadingId(null);
    }
  }

  async function handleDeleteOffer(postId: number) {
    setPageError('');
    setPostDeleteLoadingId(postId);
    try {
      await helpApi.deletePost(postId);
      setSuccessMsg('Post deleted successfully.');
      fetchOffers();
    } catch (err: unknown) {
      setPageError(err instanceof Error ? err.message : 'Failed to delete post');
    } finally {
      setPostDeleteLoadingId(null);
    }
  }

  function getApplicationBadgeStyle(status: PostApplication['status']) {
    switch (status) {
      case 'PENDING':
        return { background: '#fef3c7', color: '#92400e', borderColor: '#f59e0b' };
      case 'ACCEPTED':
      case 'IN_PROGRESS':
        return { background: '#dcfce7', color: '#166534', borderColor: '#22c55e' };
      case 'COMPLETED':
      case 'CLOSED':
        return { background: '#e0f2fe', color: '#075985', borderColor: '#38bdf8' };
      case 'REJECTED':
        return { background: '#fee2e2', color: '#991b1b', borderColor: '#ef4444' };
      default:
        return { background: '#f3f4f6', color: '#374151', borderColor: '#d1d5db' };
    }
  }

  return (
    <>
      <Navbar />

      <div className="page-header">
        <div className="container">
          <h1>🤝 Community Offers</h1>
          <p>Browse what your community is offering and post your own.</p>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px' }}>

        {successMsg && (
          <div className="alert alert-success mb-4">
            {successMsg}
            <button onClick={() => setSuccessMsg('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
          </div>
        )}
        {pageError && <div className="alert alert-error mb-4">{pageError}</div>}

        {/* Toolbar */}
        <div className="flex justify-between items-center mb-6" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
            <button
              onClick={() => setFilter('')}
              className={`btn btn-sm ${filter === '' ? 'btn-primary' : 'btn-outline'}`}
            >All</button>
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`btn btn-sm ${filter === c ? 'btn-primary' : 'btn-outline'}`}
              >{CATEGORY_LABELS[c]}</button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            + Post an Offer
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center" style={{ padding: '60px 0' }}>
            <div className="spinner" />
          </div>
        ) : offers.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📭</div>
            <h3>No offers found</h3>
            <p>Try a different category or be the first to post!</p>
          </div>
        ) : (
          <div className="grid-3">
            {offers.map(offer => (
              <div key={offer.id} className="card">
                <div className="card-body">
                  <div className="flex justify-between items-start mb-2" style={{ gap: 12 }}>
                    <CategoryBadge category={offer.category} />
                    {applicationStatusByOffer[offer.id] && (
                      <span
                        className="badge"
                        style={{
                          ...getApplicationBadgeStyle(applicationStatusByOffer[offer.id]!.status),
                          borderStyle: 'solid',
                          borderWidth: 1,
                        }}
                      >
                        {applicationStatusByOffer[offer.id]!.status === 'PENDING'
                          ? 'Request Pending'
                          : `Status: ${applicationStatusByOffer[offer.id]!.status}`}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg" style={{ marginBottom: 6 }}>{offer.title}</h3>
                  <p className="text-sm text-muted" style={{ marginBottom: 12 }}>{offer.description}</p>
                  {offer.family?.familyName && (
                    <p className="text-sm font-semibold" style={{ color: 'var(--teal-600)', marginBottom: 4 }}>
                      👨‍👩‍👧 {offer.family.familyName}
                    </p>
                  )}
                  {offer.urgency && (
                    <p className="text-sm text-muted">🕐 {offer.urgency}</p>
                  )}
                  <div className="divider" />
                  {String(offer.family?.id) === String(user?.familyId) ? (
                    <button
                      className="btn btn-danger btn-full btn-sm"
                      disabled={postDeleteLoadingId === Number(offer.id)}
                      onClick={() => handleDeleteOffer(Number(offer.id))}
                    >
                      {postDeleteLoadingId === Number(offer.id) ? 'Deleting…' : '🗑 Delete Post'}
                    </button>
                  ) : applicationStatusByOffer[offer.id]?.status === 'PENDING' ? (
                    <div className="flex flex-col gap-2">
                      <button
                        className="btn btn-full btn-sm btn-outline"
                        disabled
                        style={{
                          cursor: 'not-allowed',
                          opacity: 0.85,
                          borderColor: getApplicationBadgeStyle(applicationStatusByOffer[offer.id]!.status).borderColor,
                          color: getApplicationBadgeStyle(applicationStatusByOffer[offer.id]!.status).color,
                          background: getApplicationBadgeStyle(applicationStatusByOffer[offer.id]!.status).background,
                        }}
                      >
                        Request Pending
                      </button>
                      <button
                        className="btn btn-danger btn-full btn-sm"
                        disabled={cancelLoadingId === applicationStatusByOffer[offer.id]!.id}
                        onClick={() => handleCancelRequest(offer.id)}
                      >
                        {cancelLoadingId === applicationStatusByOffer[offer.id]!.id ? 'Canceling…' : 'Cancel Request'}
                      </button>
                    </div>
                  ) : applicationStatusByOffer[offer.id] ? (
                    <button
                      className="btn btn-full btn-sm btn-outline"
                      disabled
                      style={{
                        cursor: 'not-allowed',
                        opacity: 0.85,
                        borderColor: getApplicationBadgeStyle(applicationStatusByOffer[offer.id]!.status).borderColor,
                        color: getApplicationBadgeStyle(applicationStatusByOffer[offer.id]!.status).color,
                        background: getApplicationBadgeStyle(applicationStatusByOffer[offer.id]!.status).background,
                      }}
                    >
                      {`Applied: ${applicationStatusByOffer[offer.id]!.status}`}
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary btn-full btn-sm"
                      onClick={() => setShowRequest(offer)}
                    >
                      {offer.postType === 'SEEK' ? 'Offer the Help →' : 'Request This Offer →'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Offer Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Post a New Offer</h2>
            {offerError && <div className="alert alert-error mb-4">{offerError}</div>}
            <form onSubmit={handleCreateOffer} className="form-stack">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={offerForm.category}
                  onChange={e => setOfferForm(f => ({ ...f, category: e.target.value as ServiceCategory }))}
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  className="form-input"
                  placeholder="e.g. After-school pickup help"
                  value={offerForm.title}
                  onChange={e => setOfferForm(f => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  placeholder="Describe what you can offer..."
                  value={offerForm.description}
                  onChange={e => setOfferForm(f => ({ ...f, description: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Urgency (optional)</label>
                <input
                  className="form-input"
                  placeholder="e.g. Immediate, Within 24 hours"
                  value={offerForm.urgency}
                  onChange={e => setOfferForm(f => ({ ...f, urgency: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Needed By (optional)</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={offerForm.neededBy || ''}
                  onChange={e => setOfferForm(f => ({ ...f, neededBy: e.target.value }))}
                />
              </div>
              <div className="flex gap-3">
                <button type="button" className="btn btn-ghost btn-full" onClick={() => setShowCreate(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-full" disabled={offerLoading}>
                  {offerLoading ? 'Posting…' : 'Post Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send Request Modal */}
      {showRequest && (
        <div className="modal-overlay" onClick={() => setShowRequest(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Request Help</h2>
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-body">
                <CategoryBadge category={showRequest.category} />
                <h3 className="font-semibold mt-2">{showRequest.title}</h3>
                {showRequest.family?.familyName && <p className="text-sm text-muted">by {showRequest.family.familyName}</p>}
              </div>
            </div>
            {requestError && <div className="alert alert-error mb-4">{requestError}</div>}
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Message (optional)</label>
              <textarea
                className="form-textarea"
                placeholder="Tell them a bit about your situation or when you need help..."
                value={requestMsg}
                onChange={e => setRequestMsg(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <button className="btn btn-ghost btn-full" onClick={() => setShowRequest(null)}>
                Cancel
              </button>
              <button className="btn btn-primary btn-full" onClick={handleRequest} disabled={requestLoading}>
                {requestLoading ? 'Sending…' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
