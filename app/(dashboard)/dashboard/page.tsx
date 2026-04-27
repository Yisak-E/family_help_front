"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { HelpRequest } from '@/services/mockData';
import { Users, FileText, CheckCircle, Clock, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRequests = async () => {
      if (!user) return;
      try {
        const data = await api.getMyRequests(user.id);
        setRequests(data);
      } catch (error) {
        console.error('Failed to load requests:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadRequests();
  }, [user]);

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const completedRequests = requests.filter(r => r.status === 'completed');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.familyName}!
        </h1>
        <p className="text-gray-600">Here's what's happening in your community</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
          <p className="text-sm text-gray-600">Total Interactions</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{pendingRequests.length}</p>
          <p className="text-sm text-gray-600">Pending Requests</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{completedRequests.length}</p>
          <p className="text-sm text-gray-600">Completed</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{user?.reputationScore?.toFixed(1)}</p>
          <p className="text-sm text-gray-600">Reputation Score</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Recent Requests</h2>
          </div>
          <div className="p-6">
            {loading ? (
              <p className="text-gray-500 text-center py-8">Loading...</p>
            ) : requests.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No requests yet</p>
                <Link
                  href="/offers"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Browse help offers
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.slice(0, 5).map(request => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{request.offerTitle}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{request.message}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {request.requesterId === user?.id ? `To: ${request.providerName}` : `From: ${request.requesterName}`}
                      </span>
                      <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
                {requests.length > 5 && (
                  <Link
                    href="/activities"
                    className="block text-center text-blue-600 hover:text-blue-700 font-medium py-2"
                  >
                    View all activities
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6 space-y-3">
            <Link
              href="/offers"
              className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Browse Help Offers
            </Link>
            <Link
              href="/help-requests"
              className="block w-full bg-purple-600 text-white text-center py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Find Help Requests
            </Link>
            <Link
              href="/activities"
              className="block w-full bg-white text-blue-600 border-2 border-blue-600 text-center py-3 rounded-lg hover:bg-blue-50 transition-colors font-medium"
            >
              View My Activities
            </Link>
            <Link
              href="/history"
              className="block w-full bg-gray-100 text-gray-700 text-center py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              View History
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}