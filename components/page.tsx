'use client';
// app/dashboard/page.tsx

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { familiesApi, offersApi, LeaderboardResponse, Offer, rewardsApi } from '@/services/api';
import CategoryBadge from '@/components/CategoryBadge';
import StarRating from '@/components/StarRating';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [reputation, setReputation] = useState<LeaderboardResponse | null>(null);
  const [recentOffers, setRecentOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
      return;
    }
    if (user) {
      Promise.all([
        rewardsApi.getMine(user.familyId),
        offersApi.list(),
      ])
        .then(([rep, offers]) => {
          setReputation(rep);
          setRecentOffers(offers.slice(0, 6));
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <Navbar />

      {/* Hero welcome */}
      <div className="page-header">
        <div className="container">
          <h1>Welcome, {user.familyName} 👋</h1>
          <p>Your community support hub — offer help, request it, build trust.</p>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px' }}>

        {/* Stats row */}
        <div className="grid-3 mb-6">
          <div className="card card-body text-center">
            <div style={{ fontSize: '2rem', marginBottom: 6 }}>⭐</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--teal-600)' }}>
              {reputation?.trustScore?.toFixed(1) ?? '–'}
            </div>
            <div className="text-sm text-muted">Trust Score</div>
          </div>
          <div className="card card-body text-center">
            <div style={{ fontSize: '2rem', marginBottom: 6 }}>💬</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--teal-600)' }}>
              {reputation?.completedInteractions ?? 0}
            </div>
            <div className="text-sm text-muted">Completed Interactions</div>
          </div>
          <div className="card card-body text-center">
            <div style={{ fontSize: '2rem', marginBottom: 6 }}>📊</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--teal-600)' }}>
              {reputation ? (reputation.trustScore > 0 ? (reputation.trustScore / 2).toFixed(1) : '–') : '–'}
            </div>
            <div className="text-sm text-muted">Derived Rating</div>
            {reputation && <StarRating value={Math.round((reputation.trustScore || 0) / 2)} />}
          </div>
        </div>

        {/* Quick actions */}
        <div className="card mb-6">
          <div className="card-header">
            <h2 className="text-xl font-semibold">Quick Actions</h2>
          </div>
          <div className="card-body">
            <div className="flex gap-3" style={{ flexWrap: 'wrap' }}>
              <Link href="/offers?create=1" className="btn btn-primary">
                🤝 Post an Offer
              </Link>
              <Link href="/offers" className="btn btn-outline">
                🔍 Browse Offers
              </Link>
              <Link href="/requests" className="btn btn-outline">
                📋 View My Requests
              </Link>
              <Link href="/history" className="btn btn-ghost">
                📜 Interaction History
              </Link>
            </div>
          </div>
        </div>

        {/* Recent community offers */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Community Offers</h2>
          <Link href="/offers" className="btn btn-ghost btn-sm">View all →</Link>
        </div>

        {recentOffers.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🏘️</div>
            <h3>No offers yet</h3>
            <p>Be the first to post a community offer!</p>
          </div>
        ) : (
          <div className="grid-3">
            {recentOffers.map(offer => (
              <div key={offer.id} className="card">
                <div className="card-body">
                  <div className="flex justify-between items-center mb-2">
                    <CategoryBadge category={offer.category} />
                  </div>
                  <h3 className="font-semibold" style={{ marginBottom: 4 }}>{offer.title}</h3>
                  <p className="text-sm text-muted" style={{ marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {offer.description}
                  </p>
                  {offer.familyName && (
                    <p className="text-sm text-muted">by {offer.familyName}</p>
                  )}
                  {offer.availability && (
                    <p className="text-sm" style={{ color: 'var(--teal-600)', marginTop: 4 }}>
                      🕐 {offer.availability}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
