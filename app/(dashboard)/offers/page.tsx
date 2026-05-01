'use client';
// app/offers/page.tsx
// Covers:  GET /api/offers, POST /api/offers, POST /api/requests

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import {
  offersApi, requestsApi,
  Offer, ServiceCategory, CreateOfferRequest,
} from '@/services/api';
import CategoryBadge from '@/components/CategoryBadge';

const CATEGORIES: ServiceCategory[] = [
  'CHILDCARE', 'TUTORING', 'TRANSPORTATION', 'ELDER_CARE', 'HOUSEHOLD',
];

const CATEGORY_LABELS: Record<ServiceCategory, string> = {
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

  // Create offer form
  const [offerForm, setOfferForm] = useState<CreateOfferRequest>({
    postType: 'OFFER',
    category: 'CHILDCARE',
    title: '',
    description: '',
    urgency: '',

  });
  const [offerError, setOfferError]   = useState('');
  const [offerLoading, setOfferLoading] = useState(false);

  // Request message
  const [requestMsg, setRequestMsg]     = useState('');
  const [requestError, setRequestError] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);

  const [successMsg, setSuccessMsg] = useState('');

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await offersApi.list(filter || undefined);
      setOffers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (!authLoading && !user) { router.replace('/login'); return; }
    if (user) fetchOffers();
  }, [user, authLoading, router, fetchOffers]);

  async function handleCreateOffer(e: React.FormEvent) {
    e.preventDefault();
    setOfferError('');
    setOfferLoading(true);
    try {
      await offersApi.create(offerForm);
      setShowCreate(false);
      setOfferForm({ postType: 'OFFER', category: 'CHILDCARE', title: '', description: '', urgency: '' });
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
      await requestsApi.create({ offerId: showRequest.id, message: requestMsg || undefined });
      setShowRequest(null);
      setRequestMsg('');
      setSuccessMsg('Help request sent! ✅');
    } catch (err: unknown) {
      setRequestError(err instanceof Error ? err.message : 'Failed to send request');
    } finally {
      setRequestLoading(false);
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
                  <div className="flex justify-between items-center mb-2">
                    <CategoryBadge category={offer.category} />
                  </div>
                  <h3 className="font-semibold text-lg" style={{ marginBottom: 6 }}>{offer.title}</h3>
                  <p className="text-sm text-muted" style={{ marginBottom: 12 }}>{offer.description}</p>
                  {offer.familyName && (
                    <p className="text-sm font-semibold" style={{ color: 'var(--teal-600)', marginBottom: 4 }}>
                      👨‍👩‍👧 {offer.familyName}
                    </p>
                  )}
                  {offer.urgency && (
                    <p className="text-sm text-muted">🕐 {offer.urgency}</p>
                  )}
                  <div className="divider" />
                  {offer.familyId !== user?.familyId ? (
                    <button
                      className="btn btn-primary btn-full btn-sm"
                      onClick={() => setShowRequest(offer)}
                    >
                      Request This Help →
                    </button>
                  ) : (
                    <p className="text-sm text-muted text-center">✏️ Your offer</p>
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
                {showRequest.familyName && <p className="text-sm text-muted">by {showRequest.familyName}</p>}
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
