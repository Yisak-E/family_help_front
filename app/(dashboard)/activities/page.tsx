"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { CheckCircle, XCircle, MessageSquare, Star } from 'lucide-react';
import { toast } from 'sonner';

export default function MyActivities() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'requests' | 'offers'>('requests');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    if (!user) return;
    try {
      const data = await api.getMyActivities(); // Connects to HelpController#getMyActivity
      setActivities(data);
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const myRequests = activities.filter(a => a.type === 'REQUEST');
  const myOffers = activities.filter(a => a.type === 'OFFER');

  const handleComplete = async (taskId: string) => {
    try {
      await api.completeTask(taskId);
      toast.success('Task marked as completed!');
      loadActivities();
    } catch (error) {
      toast.error('Failed to complete task');
    }
  };

  const handleCancel = async (taskId: string) => {
    try {
      await api.cancelTask(taskId);
      toast.success('Task canceled');
      loadActivities();
    } catch (error) {
      toast.error('Failed to cancel task');
    }
  };

  const handleFeedbackClick = (task: any) => {
    setSelectedTask(task);
    setShowFeedbackModal(true);
  };

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

  const displayList = tab === 'requests' ? myRequests : myOffers;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Activities</h1>
        <p className="text-gray-600">Track and manage the support you are providing and receiving</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setTab('requests')}
              className={`px-6 py-4 font-medium transition-colors ${
                tab === 'requests'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Requests ({myRequests.length})
            </button>
            <button
              onClick={() => setTab('offers')}
              className={`px-6 py-4 font-medium transition-colors ${
                tab === 'offers'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Offers ({myOffers.length})
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <p className="text-gray-500 text-center py-8">Loading activities...</p>
          ) : displayList.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No activities found in this section.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayList.map(activity => (
                <div key={activity.id} className="border rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {activity.title || activity.description}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2 capitalize">
                        Category: {activity.category}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-4 border-t pt-4">
                    <div className="flex gap-2">
                      {activity.status !== 'COMPLETED' && (
                        <>
                          <button
                            onClick={() => handleComplete(activity.id)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark Complete
                          </button>
                          <button
                            onClick={() => handleCancel(activity.id)}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancel
                          </button>
                        </>
                      )}

                      {activity.status === 'COMPLETED' && (
                        <button
                          onClick={() => handleFeedbackClick(activity)}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center"
                        >
                          <Star className="w-4 h-4 mr-2" />
                          Leave Feedback
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showFeedbackModal && selectedTask && (
        <FeedbackModal
          task={selectedTask}
          onClose={() => {
            setShowFeedbackModal(false);
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
}

function FeedbackModal({ task, onClose }: { task: any; onClose: () => void }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      // Connects to FeedbackController#submitFeedback with the new CreateFeedbackDto
      await api.createFeedback({
        taskId: task.id.toString(),
        reviewerFamilyName: user.familyName || '',
        rating,
        comment
      });
      toast.success('Feedback submitted successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Leave Feedback</h2>
          <p className="text-gray-600 mt-1">{task.title}</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(value => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className={`p-2 transition-colors ${
                    value <= rating ? 'text-yellow-500' : 'text-gray-300'
                  }`}
                >
                  <Star className="w-8 h-8 fill-current" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Share your experience..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-blue-400"
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}