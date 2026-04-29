"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { Plus, Baby, BookOpen, Car, Heart, Home, Clock, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function CommunityFeed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterType, setFilterType] = useState<'ALL' | 'OFFER' | 'SEEK'>('ALL');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const data = await api.getPosts(); 
      setPosts(data);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'childcare': return <Baby className="w-5 h-5" />;
      case 'tutoring': return <BookOpen className="w-5 h-5" />;
      case 'transport': return <Car className="w-5 h-5" />;
      case 'elder-support': return <Heart className="w-5 h-5" />;
      case 'household': return <Home className="w-5 h-5" />;
      default: return <Heart className="w-5 h-5" />;
    }
  };

  const handleAcceptPost = async (post: any) => {
    if (!confirm(`Are you sure you want to accept this ${post.postType.toLowerCase()}?`)) return;
    try {
      await api.acceptTask(post.id);
      toast.success("Successfully accepted!");
      loadPosts(); 
    } catch (error) {
      toast.error("Failed to accept this post.");
    }
  };

  const filteredPosts = filterType === 'ALL' ? posts : posts.filter(p => p.postType === filterType);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Community Feed</h1>
          <p className="text-gray-600">See what your neighbors are offering and requesting.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all font-medium flex items-center shadow-md"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Post
        </button>
      </div>

      <div className="flex bg-gray-100 p-1 rounded-lg w-full max-w-md mx-auto sm:mx-0">
        <button onClick={() => setFilterType('ALL')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${filterType === 'ALL' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>Everything</button>
        <button onClick={() => setFilterType('OFFER')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${filterType === 'OFFER' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>Offers to Help</button>
        <button onClick={() => setFilterType('SEEK')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${filterType === 'SEEK' ? 'bg-white shadow text-purple-600' : 'text-gray-600 hover:text-gray-900'}`}>Requests for Help</button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading community feed...</div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <p className="text-gray-500 mb-4 text-lg">No posts in this category yet.</p>
          <button onClick={() => setShowCreateModal(true)} className="text-blue-600 hover:underline font-medium">Be the first to post!</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map(post => {
            const isOffer = post.postType === 'OFFER';
            const isMyPost = post.family?.familyName === user?.familyName;

            return (
              <div key={`post-${post.id}`} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col h-full">
                <div className="p-6 flex-grow">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${isOffer ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                      {isOffer ? 'I can help' : 'I need help'}
                    </div>
                    {post.status !== 'OPEN' && (
                       <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-bold">{post.status}</span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{post.description}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="bg-gray-100 p-1.5 rounded mr-2">{getCategoryIcon(post.category)}</span>
                      <span className="capitalize">{post.category}</span>
                    </div>
                    {isOffer && post.availability && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" /> Available: {post.availability}
                      </div>
                    )}
                    {!isOffer && post.urgency && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className={`w-4 h-4 mr-2 ${post.urgency === 'high' ? 'text-red-500' : 'text-gray-400'}`} />
                        Urgency: <span className="capitalize ml-1">{post.urgency}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-4 border-t border-gray-50 bg-gray-50/50 flex items-center justify-between rounded-b-xl">
                  <span className="text-sm font-semibold text-gray-900">{post.family?.familyName || 'Community'}</span>
                  <button
                    onClick={() => handleAcceptPost(post)}
                    disabled={isMyPost || post.status !== 'OPEN'}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isMyPost ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : isOffer ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {isMyPost ? 'Your Post' : (isOffer ? 'Request Help' : 'Offer Help')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreateModal && <CreatePostModal onClose={() => setShowCreateModal(false)} onSuccess={loadPosts} />}
    </div>
  );
}

function CreatePostModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [postType, setPostType] = useState<'OFFER' | 'SEEK'>('SEEK');
  const [formData, setFormData] = useState({ title: '', category: 'childcare', description: '', urgency: 'medium', neededBy: '', availability: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.createPost({
        postType, title: formData.title, category: formData.category, description: formData.description,
        urgency: postType === 'SEEK' ? formData.urgency : undefined,
        neededBy: postType === 'SEEK' && formData.neededBy ? new Date(formData.neededBy).toISOString() : undefined,
        availability: postType === 'OFFER' ? formData.availability : undefined
      });
      toast.success('Posted successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
          <h2 className="text-2xl font-bold text-gray-900">Create Post</h2>
          <div className="flex bg-gray-200 p-1 rounded-lg">
            <button type="button" onClick={() => setPostType('SEEK')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${postType === 'SEEK' ? 'bg-white shadow-sm text-purple-700' : 'text-gray-500 hover:text-gray-700'}`}>I Need Help</button>
            <button type="button" onClick={() => setPostType('OFFER')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${postType === 'OFFER' ? 'bg-white shadow-sm text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}>I Can Help</button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
            <input type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder={postType === 'SEEK' ? "e.g. Need emergency childcare on Friday" : "e.g. Available for math tutoring"} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option value="childcare">Childcare</option>
                <option value="tutoring">Tutoring</option>
                <option value="transport">Transport</option>
                <option value="elder-support">Elder Support</option>
                <option value="household">Household Help</option>
              </select>
            </div>
            {postType === 'SEEK' ? (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Needed By</label>
                <input type="date" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" min={new Date().toISOString().split('T')[0]} value={formData.neededBy} onChange={e => setFormData({...formData, neededBy: e.target.value})} />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Availability</label>
                <input type="text" required placeholder="e.g. Weekends, Evenings..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.availability} onChange={e => setFormData({...formData, availability: e.target.value})} />
              </div>
            )}
          </div>
          {postType === 'SEEK' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Urgency</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" value={formData.urgency} onChange={e => setFormData({...formData, urgency: e.target.value})}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea required rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Add details about what you need or what you are offering..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className={`px-6 py-2.5 text-white rounded-lg font-medium flex items-center shadow-sm ${postType === 'SEEK' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'} disabled:opacity-50`}>
              {loading ? 'Posting...' : <><Send className="w-4 h-4 mr-2" /> Post to Community</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}