"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { HelpRequest } from '@/services/mockData';
import { CheckCircle, XCircle, MessageSquare, Star } from 'lucide-react';
import { toast } from 'sonner';

export default function MyActivities() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'received' | 'sent'>('received');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<HelpRequest | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

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

  const receivedRequests = requests.filter(r => r.providerId === user?.id);
  const sentRequests = requests.filter(r => r.requesterId === user?.id);

  const handleAccept = async (requestId: string) => {
    try {
      await api.acceptRequest(requestId);
      toast.success('Request accepted!');
      loadRequests();
    } catch (error) {
      toast.error('Failed to accept request');
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await api.rejectRequest(requestId);
      toast.success('Request rejected');
      loadRequests();
    } catch (error) {
      toast.error('Failed to reject request');
    }
  };

  const handleComplete = async (requestId: string) => {
    try {
      await api.completeRequest(requestId);
      toast.success('Request marked as completed!');
      loadRequests();
    } catch (error) {
      toast.error('Failed to complete request');
    }
  };

  const handleFeedbackClick = (request: HelpRequest) => {
    setSelectedRequest(request);
    setShowFeedbackModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const displayRequests = tab === 'received' ? receivedRequests : sentRequests;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Activities</h1>
        <p className="text-gray-600">Manage all your interactions - requests sent, offers received, and more</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setTab('received')}
              className={`px-6 py-4 font-medium transition-colors ${
                tab === 'received'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Requests I Received ({receivedRequests.length})
            </button>
            <button
              onClick={() => setTab('sent')}
              className={`px-6 py-4 font-medium transition-colors ${
                tab === 'sent'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Requests I Sent ({sentRequests.length})
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <p className="text-gray-500 text-center py-8">Loading activities...</p>
          ) : displayRequests.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {tab === 'received'
                  ? 'No requests received yet. Check the Help Offers and Help Requests pages!'
                  : 'No requests sent yet. Browse available help to get started!'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayRequests.map(request => (
                <div key={request.id} className="border rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {request.offerTitle}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {tab === 'received'
                          ? `From: ${request.requesterName}`
                          : `To: ${request.providerName}`}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-700">{request.message}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      <span>Created: {new Date(request.createdAt).toLocaleDateString()}</span>
                      {request.updatedAt !== request.createdAt && (
                        <span className="ml-4">
                          Updated: {new Date(request.updatedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {tab === 'received' && request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAccept(request.id)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Accept
                          </button>
                          <button
                            onClick={() => handleReject(request.id)}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </button>
                        </>
                      )}

                      {request.status === 'accepted' && (
                        <button
                          onClick={() => handleComplete(request.id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark Complete
                        </button>
                      )}

                      {request.status === 'completed' && (
                        <button
                          onClick={() => handleFeedbackClick(request)}
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

      {showFeedbackModal && selectedRequest && (
        <FeedbackModal
          request={selectedRequest}
          onClose={() => {
            setShowFeedbackModal(false);
            setSelectedRequest(null);
          }}
        />
      )}
    </div>
  );
}

function FeedbackModal({ request, onClose }: { request: HelpRequest; onClose: () => void }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const toFamilyId = request.requesterId === user.id ? request.providerId : request.requesterId;
    const toFamilyName = request.requesterId === user.id ? request.providerName : request.requesterName;

    setLoading(true);
    try {
      await api.createFeedback({
        fromFamilyId: user.id,
        fromFamilyName: user.familyName,
        toFamilyId,
        toFamilyName,
        requestId: request.id,
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
          <p className="text-gray-600 mt-1">{request.offerTitle}</p>
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