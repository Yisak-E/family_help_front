import Link from 'next/link';
import { Users, Heart, Shield, TrendingUp } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            FamilyHelp UAE
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Building stronger communities through family support and mutual help
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/register"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium border-2 border-blue-600"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Users className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Community Support</h3>
            <p className="text-gray-600 text-sm">
              Connect with families in your area who can help or need assistance
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <Heart className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Multiple Services</h3>
            <p className="text-gray-600 text-sm">
              Childcare, tutoring, transport, elder support, and household help
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <Shield className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Trust & Safety</h3>
            <p className="text-gray-600 text-sm">
              Secure platform with reputation tracking and verified feedback
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <TrendingUp className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Build Reputation</h3>
            <p className="text-gray-600 text-sm">
              Earn trust through positive interactions and helpful contributions
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Create Profile</h3>
              <p className="text-gray-600 text-sm">
                Register your family and tell us what help you can offer or need
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Give & Request Help</h3>
              <p className="text-gray-600 text-sm">
                Browse help offers, post what you need, and connect with families
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Build Trust</h3>
              <p className="text-gray-600 text-sm">
                Complete support tasks and exchange feedback to build community trust
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}