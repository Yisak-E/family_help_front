'use client';
// app/profile/page.tsx
// Covers: GET /api/families/{id}, PUT /api/families/{id}, GET /api/families/{id}/reputation

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import {
  familiesApi, FamilyProfile, ReputationResponse, UpdateProfileRequest,
} from '@/services/api';
import StarRating from '@/components/StarRating';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [profile, setProfile]         = useState<FamilyProfile | null>(null);
  const [reputation, setReputation]   = useState<ReputationResponse | null>(null);
  const [loading, setLoading]         = useState(true);
  const [editing, setEditing]         = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [successMsg, setSuccessMsg]   = useState('');
  const [error, setError]             = useState('');

  const [form, setForm] = useState<UpdateProfileRequest>({
    familyName: '',
    phoneNumber: '',
    address: '',
  });

  useEffect(() => {
    if (!authLoading && !user) { router.replace('/login'); return; }
    if (user) {
      Promise.all([
        familiesApi.getProfile(user.familyId),
        familiesApi.getReputation(user.familyId),
      ])
        .then(([p, r]) => {
          setProfile(p);
          setReputation(r);
          setForm({
            familyName: p.familyName,
            phoneNumber: p.phoneNumber ?? '',
            address: p.address ?? '',
          });
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError('');
    setSaveLoading(true);
    try {
      const updated = await familiesApi.updateProfile(user.familyId, {
        familyName: form.familyName || undefined,
        phoneNumber: form.phoneNumber || undefined,
        address: form.address || undefined,
      });
      setProfile(updated);
      setEditing(false);
      setSuccessMsg('Profile updated successfully!');
      localStorage.setItem('familyName', updated.familyName);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setSaveLoading(false);
    }
  }

  if (authLoading || loading) {
    return (
      <><Navbar />
        <div className="flex justify-center" style={{ padding: '80px 0' }}>
          <div className="spinner" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page-header">
        <div className="container">
          <h1>👤 Family Profile</h1>
          <p>Manage your account details and reputation.</p>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px', maxWidth: 800 }}>
        {successMsg && (
          <div className="alert alert-success mb-4">
            {successMsg}
            <button onClick={() => setSuccessMsg('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
          </div>
        )}
        {error && <div className="alert alert-error mb-4">{error}</div>}

        {/* Reputation card */}
        {reputation && (
          <div className="card mb-6" style={{ background: 'linear-gradient(135deg, var(--teal-800), var(--teal-600))', color: 'white' }}>
            <div className="card-body">
              <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: 4 }}>
                    Community Reputation
                  </h2>
                  <p style={{ opacity: .8, fontSize: '.9rem' }}>
                    Based on {reputation.totalFeedbacks} feedback{reputation.totalFeedbacks !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="text-center">
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', lineHeight: 1 }}>
                    {reputation.reputationScore.toFixed(1)}
                  </div>
                  <StarRating value={Math.round(reputation.averageRating)} />
                  <div style={{ fontSize: '.8rem', opacity: .7, marginTop: 4 }}>
                    avg {reputation.averageRating.toFixed(1)} / 5
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile details */}
        <div className="card">
          <div className="card-header flex justify-between items-center">
            <h2 className="text-xl font-semibold">Account Details</h2>
            {!editing && (
              <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>
                ✏️ Edit
              </button>
            )}
          </div>
          <div className="card-body">
            {!editing ? (
              <div className="flex flex-col gap-4">
                {[
                  { label: 'Family Name', value: profile?.familyName },
                  { label: 'Email', value: profile?.email },
                  { label: 'Phone', value: profile?.phoneNumber || '—' },
                  { label: 'Address', value: profile?.address || '—' },
                  { label: 'Member Since', value: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex" style={{ gap: 20, borderBottom: '1px solid var(--sand-100)', paddingBottom: 12 }}>
                    <span className="text-sm font-semibold" style={{ width: 140, color: 'var(--slate-600)', flexShrink: 0 }}>
                      {label}
                    </span>
                    <span className="text-sm">{value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <form onSubmit={handleSave} className="form-stack">
                <div className="form-group">
                  <label className="form-label">Family Name</label>
                  <input
                    className="form-input"
                    value={form.familyName}
                    onChange={e => setForm(f => ({ ...f, familyName: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    className="form-input"
                    placeholder="+971 50 123 4567"
                    value={form.phoneNumber}
                    onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Address / Neighbourhood</label>
                  <input
                    className="form-input"
                    placeholder="Al Reem Island, Abu Dhabi"
                    value={form.address}
                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  />
                </div>
                <div className="flex gap-3">
                  <button type="button" className="btn btn-ghost btn-full" onClick={() => setEditing(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-full" disabled={saveLoading}>
                    {saveLoading ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
