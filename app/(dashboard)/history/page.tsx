'use client';
// app/history/page.tsx
// Covers: GET /api/families/{id}/history

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { familiesApi, HistoryEntry } from '@/services/api';
import CategoryBadge from '@/components/CategoryBadge';
import StatusBadge from '@/components/StatusBadge';

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'OFFER' | 'SEEK'>('ALL');

  useEffect(() => {
    if (!authLoading && !user) { router.replace('/login'); return; }
    if (user) {
      familiesApi.getHistory(user.familyId)
        .then(setHistory)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  const filtered = typeFilter === 'ALL'
    ? history
    : history.filter(h => h.postType === typeFilter);

  const stats = {
    total:     history.length,
    offered:   history.filter(h => h.postType === 'OFFER').length,
    requested: history.filter(h => h.postType === 'SEEK').length,
    completed: history.filter(h => h.status === 'COMPLETED').length,
  };

  return (
    <>
      <Navbar />
      <div className="page-header">
        <div className="container">
          <h1>📜 Interaction History</h1>
          <p>Your full record of community offers and requests.</p>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px' }}>
        {/* Stats */}
        <div className="grid-3 mb-6" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {[
            { label: 'Total', value: stats.total, icon: '📋' },
            { label: 'Offered', value: stats.offered, icon: '🤝' },
            { label: 'Requested', value: stats.requested, icon: '🙏' },
            { label: 'Completed', value: stats.completed, icon: '🎉' },
          ].map(s => (
            <div key={s.label} className="card card-body text-center">
              <div style={{ fontSize: '1.6rem', marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--teal-600)' }}>
                {s.value}
              </div>
              <div className="text-sm text-muted">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {(['ALL', 'OFFER', 'SEEK'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`btn btn-sm ${typeFilter === t ? 'btn-primary' : 'btn-outline'}`}
            >
              {t === 'ALL' ? '📋 All' : t === 'OFFER' ? '🤝 Offered' : '🙏 Requested'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center" style={{ padding: '60px 0' }}>
            <div className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🕰️</div>
            <h3>No history yet</h3>
            <p>Start interacting with your community to build your history.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(entry => (
              <div key={entry.id} className="card card-body">
                <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: 12 }}>
                  <div className="flex gap-3 items-center" style={{ flexWrap: 'wrap' }}>
                    <span
                      className="badge"
                      style={{
                        background: entry.postType === 'OFFERED' ? '#dcfce7' : '#ede9fe',
                        color: entry.postType === 'OFFERED' ? '#166534' : '#6b21a8',
                      }}
                    >
                      {entry.postType === 'OFFER' ? '🤝 Offered' : '🙏 Requested'}
                    </span>
                    <CategoryBadge category={entry.category} />
                    <div>
                      <p className="font-semibold">{entry.title}</p>
                      {entry.family.familyName && (
                        <p className="text-sm text-muted">
                          with {entry.family.familyName}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3 items-center" style={{ flexWrap: 'wrap' }}>
                    <StatusBadge status={entry.status} />
                    <div className="text-sm text-muted text-center">
                      {entry.createdAt && (
                        <p>{new Date(entry.createdAt).toLocaleDateString()}</p>
                      )}
                     
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
