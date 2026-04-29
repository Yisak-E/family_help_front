"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { CheckCircle, XCircle, MessageSquare, Star, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface Post {
  postId: number;
  rating: number;
  comment: string;
}

export default function MyActivities() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'requests' | 'offers'>('requests');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    loadActivities();
  }, [user]);

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

  // 1. DATA COMPATIBILITY: Filter by the new postType entity
  const myRequests = activities.filter(a => a.postType === 'SEEK');
  const myOffers = activities.filter(a => a.postType === 'OFFER');

  // 2. DATA COMPATIBILITY: Safely passing the Post ID to the backend
  const handleComplete = async (postId: number) => {
    try {
      await api.completeTask(postId);
      toast.success('Task marked as completed!');
      loadActivities();
    } catch (error) {
      toast.error('Failed to complete task');
    }
  };

  const handleCancel = async (postId: number) => {
    try {
      await api.cancelTask(postId);
      toast.success('Task canceled');
      loadActivities();
    } catch (error) {
      toast.error('Failed to cancel task');
    }
  };

  const handleFeedbackClick = (post: Post) => {
    setSelectedPost(post);
    setShowFeedbackModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'OPEN': return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED':
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const displayList = tab === 'requests' ? myRequests : myOffers;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Activities</h1>
        <p className="text-gray-600">Track the support you are providing and receiving</p>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-100">
        <div className="border-b flex">
          <button onClick={() => setTab('requests')} className={`px-6 py-4 font-medium ${tab === 'requests' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}>
            My Requests ({myRequests.length})
          </button>
          <button onClick={() => setTab('offers')} className={`px-6 py-4 font-medium ${tab === 'offers' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}>
            My Offers ({myOffers.length})
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <p className="text-gray-500 text-center py-8">Loading activities...</p>
          ) : displayList.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No activities found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayList.map(activity => (
                <div key={`activity-${activity.id}`} className="border rounded-xl p-6 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{activity.title}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className="capitalize bg-gray-100 px-2 py-1 rounded-md">{activity.category}</span>
                    {activity.urgency && <span className="text-red-600 font-medium capitalize">{activity.urgency} Priority</span>}
                    {activity.createdAt && <span className="text-gray-400">{new Date(activity.createdAt).toLocaleDateString()}</span>}
                  </div>
                  
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border">{activity.description}</p>

                  <div className="flex justify-end mt-4 pt-4 border-t gap-3">
                    {activity.status !== 'COMPLETED' && (
                      <>
                        <button onClick={() => handleCancel(activity.id)} className="bg-white border text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium flex items-center">
                          <XCircle className="w-4 h-4 mr-2" /> Cancel
                        </button>
                        <button onClick={() => handleComplete(activity.id)} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2" /> Mark Complete
                        </button>
                      </>
                    )}
                    {activity.status === 'COMPLETED' && (
                      <button onClick={() => handleFeedbackClick(activity)} className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 text-sm font-medium flex items-center">
                        <Star className="w-4 h-4 mr-2" /> Leave Feedback
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showFeedbackModal && selectedPost && (
        <FeedbackModal post={selectedPost} onClose={() => { setShowFeedbackModal(false); setSelectedPost(null); }} onSuccess={loadActivities} />
      )}
    </div>
  );
}

function FeedbackModal({ post, onClose, onSuccess }: { post: Post; onClose: () => void; onSuccess: () => void }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 3. DATA COMPATIBILITY: Send postId instead of taskId
      await api.createFeedback({
        postId: post.postId, 
        rating,
        comment
      });
      toast.success('Feedback submitted successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
        <div className="bg-blue-600 p-6 text-white rounded-t-xl">
          <h2 className="text-2xl font-bold">Leave Feedback</h2>
          <p className="text-blue-100 mt-1">{post.comment}</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="text-center">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Rating</label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map(v => (
                <button key={v} type="button" onClick={() => setRating(v)} className={`p-2 hover:scale-110 ${v <= rating ? 'text-yellow-400' : 'text-gray-200'}`}>
                  <Star className="w-10 h-10 fill-current drop-shadow-sm" />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Write a Review</label>
            <textarea value={comment} onChange={e => setComment(e.target.value)} required rows={4} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50" />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-2 border rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}