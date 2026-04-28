"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { HelpOffer } from '@/services/mockData';
import { Plus, Baby, BookOpen, Car, Heart, Home, Send } from 'lucide-react';
import { toast } from 'sonner';

// Copy the exact content of your Offers component here, 
// replacing just the imports at the top.
export default function Offers() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<HelpOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<HelpOffer | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      const data = await api.getOffers();
      setOffers(data);
    } catch (error) {
      console.error('Failed to load offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'childcare': return <Baby className="w-5 h-5" />;
      case 'tutoring': return <BookOpen className="w-5 h-5" />;
      case 'transport': return <Car className="w-5 h-5" />;
      case 'elder-support': return <Heart className="w-5 h-5" />;
      case 'household': return <Home className="w-5 h-5" />;
      default: return <Heart className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'childcare': return 'bg-pink-100 text-pink-700';
      case 'tutoring': return 'bg-blue-100 text-blue-700';
      case 'transport': return 'bg-green-100 text-green-700';
      case 'elder-support': return 'bg-purple-100 text-purple-700';
      case 'household': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredOffers = filterType === 'all'
    ? offers
    : offers.filter(o => o.type === filterType);

  const handleRequestClick = (offer: HelpOffer) => {
    setSelectedOffer(offer);
    setShowRequestModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Help Offers</h1>
          <p className="text-gray-600">Browse available support from families in your community</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Offer
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
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

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading offers...</p>
        </div>
      ) : filteredOffers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 mb-4">No offers available in this category</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Be the first to create one!
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOffers.map(offer => (
            <div key={offer.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${getTypeColor(offer.type)}`}>
                    {getTypeIcon(offer.type)}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(offer.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{offer.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{offer.description}</p>

                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">Availability:</p>
                  <p className="text-sm text-gray-700">{offer.availability}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{offer.familyName}</p>
                  </div>
                  <button
                    onClick={() => handleRequestClick(offer)}
                    disabled={offer.familyId === user?.id}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {offer.familyId === user?.id ? 'Your Offer' : 'Request Help'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && <CreateOfferModal onClose={() => setShowCreateModal(false)} onSuccess={loadOffers} />}
      {showRequestModal && selectedOffer && (
        <RequestHelpModal
          offer={selectedOffer}
          onClose={() => {
            setShowRequestModal(false);
            setSelectedOffer(null);
          }}
        />
      )}
    </div>
  );
}

function CreateOfferModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    type: 'childcare' as HelpOffer['type'],
    title: '',
    description: '',
    availability: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await api.createOffer({
        ...formData,
        familyId: user.id,
        familyName: user.familyName
      });
      toast.success('Help offer created successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to create offer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Create Help Offer</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type of Help</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as HelpOffer['type'] }))}
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
              placeholder="Brief title for your offer"
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
              placeholder="Describe what help you can provide"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
            <input
              type="text"
              value={formData.availability}
              onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value }))}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Weekdays 3-6 PM"
            />
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
              {loading ? 'Creating...' : 'Create Offer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RequestHelpModal({ offer, onClose }: { offer: HelpOffer; onClose: () => void }) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await api.createRequest({
        requesterId: user.id,
        requesterName: user.familyName,
        offerId: offer.id,
        offerTitle: offer.title,
        providerId: offer.familyId,
        providerName: offer.familyName,
        message
      });
      toast.success('Request sent successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Request Help</h2>
          <p className="text-gray-600 mt-1">{offer.title}</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Explain your needs and when you need help..."
            />
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
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-blue-400 flex items-center"
            >
              {loading ? 'Sending...' : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}