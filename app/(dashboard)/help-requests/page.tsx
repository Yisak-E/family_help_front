"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { Plus, Baby, BookOpen, Car, Heart, Home, AlertCircle, Calendar, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function HelpRequestsPage() {
  const { user } = useAuth();
  const [helpRequests, setHelpRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterUrgency, setFilterUrgency] = useState<string>('all');

  useEffect(() => {
    loadHelpRequests();
  }, []);

  const loadHelpRequests = async () => {
    try {
      const data = await api.getHelpRequests();
      setHelpRequests(data);
    } catch (error) {
      console.error('Failed to load help requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'childcare': return <Baby className="w-5 h-5" />;
      case 'tutoring': return <BookOpen className="w-5 h-5" />;
      case 'transport': return <Car className="w-5 h-5" />;
      case 'elder-support': return <Heart className="w-5 h-5" />;
      case 'household': return <Home className="w-5 h-5" />;
      default: return <Heart className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'childcare': return 'bg-pink-100 text-pink-700';
      case 'tutoring': return 'bg-blue-100 text-blue-700';
      case 'transport': return 'bg-green-100 text-green-700';
      case 'elder-support': return 'bg-purple-100 text-purple-700';
      case 'household': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  let filteredRequests = helpRequests;
  if (filterType !== 'all') {
    filteredRequests = filteredRequests.filter(r => r.type === filterType);
  }
  if (filterUrgency !== 'all') {
    filteredRequests = filteredRequests.filter(r => r.urgency === filterUrgency);
  }

  const handleOfferClick = (request: any) => {
    setSelectedRequest(request);
    setShowOfferModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Help Requests</h1>
          <p className="text-gray-600">Find families who need assistance and offer your help</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Post Request
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Filter by Type</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {['childcare', 'tutoring', 'transport', 'elder-support', 'household'].map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                    filterType === type ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading help requests...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center border border-gray-100">
          <p className="text-gray-500 mb-4 text-lg">No help requests available right now.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="text-blue-600 hover:text-blue-700 font-medium underline underline-offset-4"
          >
            Be the first to post a request!
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map(request => (
            <div key={request.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-100">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${getTypeColor(request.type)}`}>
                    {getTypeIcon(request.type)}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(request.urgency)}`}>
                    {request.urgency} priority
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{request.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">{request.description}</p>

                <div className="flex items-center justify-between pt-4 border-t mt-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{request.familyName}</p>
                  </div>
                  <button
                    onClick={() => handleOfferClick(request)}
                    // Prevent users from offering help to their own request
                    disabled={request.familyName === user?.familyName || request.status !== 'OPEN'}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {request.familyName === user?.familyName ? 'Your Request' : 'Offer Help'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && <CreateRequestModal onClose={() => setShowCreateModal(false)} onSuccess={loadHelpRequests} />}
      {showOfferModal && selectedRequest && (
        <OfferHelpModal
          request={selectedRequest}
          onClose={() => {
            setShowOfferModal(false);
            setSelectedRequest(null);
          }}
        />
      )}
    </div>
  );
}

function CreateRequestModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    type: 'childcare',
    title: '',
    description: '',
    urgency: 'medium',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      // Clean, secure payload matched exactly to CreateRequestDto.java
      await api.createHelpRequest({
        familyName: user.familyName || '',
        title: formData.title,
        category: formData.type,
        details: formData.description,
        urgent: formData.urgency,
        status: 'OPEN'
      });
      toast.success('Help request posted successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to post request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Post Help Request</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type of Help Needed</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="childcare">Childcare</option>
              <option value="tutoring">Tutoring</option>
              <option value="transport">Transport</option>
              <option value="elder-support">Elder Support</option>
              <option value="household">Household Help</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Brief title for your request"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Describe what help you need in detail"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Urgency</label>
            <select
              value={formData.urgency}
              onChange={(e) => setFormData(prev => ({ ...prev, urgency: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
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
              {loading ? 'Posting...' : 'Post Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function OfferHelpModal({ request, onClose }: { request: any; onClose: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Connects directly to the highly secure TaskController#acceptTask endpoint
      await api.acceptTask(request.id);
      
      toast.success('Your offer to help has been sent!');
      onClose();
    } catch (error) {
      toast.error('Failed to send offer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Offer Help</h2>
          <p className="text-gray-600 mt-1">{request.title}</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-700 mb-2"><strong>Family:</strong> {request.familyName}</p>
            <p className="text-sm text-gray-700 mb-2"><strong>Details:</strong> {request.description}</p>
            <p className="text-sm text-gray-700"><strong>Priority:</strong> <span className="capitalize">{request.urgency}</span></p>
          </div>
          
          <p className="text-gray-700 text-sm">
            Clicking send will notify the {request.familyName} that you are available to help.
          </p>

          <div className="flex justify-end gap-3 pt-4">
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
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-blue-400 flex items-center shadow-sm"
            >
              {loading ? 'Sending...' : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Offer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}