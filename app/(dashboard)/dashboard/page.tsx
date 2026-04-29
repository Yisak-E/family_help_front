"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { Users, FileText, CheckCircle, Clock, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActivities = async () => {
      if (!user) return;
      try {
        const data = await api.getMyActivities();
        setActivities(data);
      } catch (error) {
        console.error('Failed to load activities:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadActivities();
  }, [user]);

  const activeActivities = activities.filter(a => a.status === 'OPEN' || a.status === 'AVAILABLE');
  const completedActivities = activities.filter(a => a.status === 'COMPLETED');

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'OPEN':
      case 'AVAILABLE': return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED':
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
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
        <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{activities.length}</p>
          <p className="text-sm text-gray-600">Total Posts</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{activeActivities.length}</p>
          <p className="text-sm text-gray-600">Active / Pending</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{completedActivities.length}</p>
          <p className="text-sm text-gray-600">Completed</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{user?.reputationScore?.toFixed(1) || '0.0'}</p>
          <p className="text-sm text-gray-600">Reputation Score</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow border border-gray-100">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">My Recent Activity</h2>
          </div>
          <div className="p-6">
            {loading ? (
              <p className="text-gray-500 text-center py-8">Loading...</p>
            ) : activities.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No activities yet</p>
                <Link
                  href="/offers"
                  className="text-blue-600 hover:text-blue-700 font-medium underline underline-offset-4"
                >
                  Browse help offers
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.slice(0, 5).map(activity => (
                  <div key={`${activity.type}-${activity.id}`} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900">[{activity.type}] {activity.title || activity.category}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                  </div>
                ))}
                {activities.length > 5 && (
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

        <div className="bg-white rounded-lg shadow border border-gray-100">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6 space-y-3">
            <Link
              href="/offers"
              className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              Browse Help Offers
            </Link>
            <Link
              href="/help-requests"
              className="block w-full bg-purple-600 text-white text-center py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-sm"
            >
              Find Help Requests
            </Link>
            <Link
              href="/activities"
              className="block w-full bg-white text-blue-600 border border-blue-600 text-center py-3 rounded-lg hover:bg-blue-50 transition-colors font-medium"
            >
              View My Activities
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}