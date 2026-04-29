"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/services/api';
import { User, MapPin, Star, ShieldCheck, Users, Calendar, MessageSquare } from 'lucide-react';

export default function Profile() {
  const params = useParams();
  const id = params.id as string;

  const [family, setFamily] = useState<any>(null);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!id) return;
      try {
        const [ feedbackData] = await Promise.all([
  
          api.getFeedbackForFamily(id) 
        ]);
        setFeedback(feedbackData);
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!family) {
    return (
      <div className="flex items-center justify-center h-[60vh] bg-white rounded-xl shadow border border-gray-100 p-12">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-500">This community member could not be located.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Profile Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
        <div className="px-6 sm:px-10 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-white">
              <div className="w-full h-full bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-blue-600" />
              </div>
            </div>
            
            {/* Trusted Badge */}
            {(family.completedInteractions >= 5) && (
              <div className="flex items-center text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-200 shadow-sm">
                <ShieldCheck className="w-4 h-4 mr-1.5" />
                <span className="text-sm font-semibold tracking-wide">Trusted Family</span>
              </div>
            )}
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{family.familyName}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1.5 text-gray-400" />
                {family.address || 'Location hidden'}
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1.5 text-gray-400" />
                Family of {family.size || 1}
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-t border-gray-100 pt-8">
            <div>
              <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-1">Community Score</p>
              <div className="flex items-center">
                <Star className="w-6 h-6 text-yellow-500 fill-current mr-2" />
                <span className="text-2xl font-bold text-gray-900">
                  {family.reputationScore?.toFixed(1) || '0.0'}
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-1">Tasks Completed</p>
              <div className="flex items-center">
                <ShieldCheck className="w-6 h-6 text-green-500 mr-2" />
                <span className="text-2xl font-bold text-gray-900">
                  {family.completedInteractions || 0}
                </span>
              </div>
            </div>
            
            <div className="hidden md:block">
              <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-1">Reviews Received</p>
              <div className="flex items-center">
                <MessageSquare className="w-6 h-6 text-blue-500 mr-2" />
                <span className="text-2xl font-bold text-gray-900">
                  {feedback.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 sm:px-10 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            Community Reviews
            <span className="ml-3 bg-gray-100 text-gray-600 py-0.5 px-2.5 rounded-full text-sm font-medium">
              {feedback.length}
            </span>
          </h2>
        </div>
        
        <div className="p-6 sm:px-10">
          {feedback.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-900 font-medium text-lg">No reviews yet.</p>
              <p className="text-gray-500 mt-1">Feedback will appear here once tasks are completed.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {feedback.map(item => (
                <div key={item.id} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 shadow-sm">
                        {/* Grabs the first letter of the reviewer's family name */}
                        {(item.reviewerFamily?.familyName || 'C')[0]}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900 block">
                          {item.reviewerFamily?.familyName || 'Community Member'}
                        </span>
                        {item.createdAt && (
                          <span className="text-xs text-gray-500 flex items-center mt-0.5">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex bg-white px-2 py-1 rounded shadow-sm border border-gray-100">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < item.rating ? 'text-yellow-400 fill-current' : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed mt-2 italic">
                    "{item.comment}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}