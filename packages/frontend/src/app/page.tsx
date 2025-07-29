'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";

export default function Home() {
  const messages = [
    "🎨 Transform communities through art",
    "🏡 Brightening seniors' days with artwork", 
    "💝 Donating art to retirement communities",
    "✨ Creating joy through artistic expression",
    "🤝 Connecting generations through creativity",
    "🌟 Spreading happiness with handmade art"
  ];

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [totalVolunteerHours, setTotalVolunteerHours] = useState('1,523');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only run on client to avoid hydration mismatch
    setIsClient(true);
    setCurrentMessageIndex(Math.floor(Math.random() * messages.length));
    fetchTotalHours();
  }, [messages.length]);

  const fetchTotalHours = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      console.log('API URL:', apiUrl);
      
      if (!apiUrl) {
        console.warn('API URL not configured, using default hours');
        setLoading(false);
        return;
      }

      console.log('Fetching from:', `${apiUrl}/hours/total`);
      const response = await fetch(`${apiUrl}/hours/total`);
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
        const totalHours = parseFloat(data.totalHours || 0);
        setTotalVolunteerHours(totalHours.toLocaleString());
      } else {
        console.warn('Failed to fetch total hours, using default. Status:', response.status);
      }
    } catch (error) {
      console.warn('Error fetching total hours:', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-xl mr-3 overflow-hidden">
                <img src="/logo.png" alt="Paint It Forward Logo" className="w-full h-full object-cover" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-300 to-blue-200 bg-clip-text text-transparent">
                Paint It Forward
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#mission" className="text-gray-800 hover:text-gray-950 px-3 py-2 text-sm font-medium transition-colors">Mission</a>
              <a href="#impact" className="text-gray-800 hover:text-gray-950 px-3 py-2 text-sm font-medium transition-colors">Impact</a>
              <Link href="/admin" className="text-gray-800 hover:text-gray-950 px-3 py-2 text-sm font-medium transition-colors">Admin</Link>
              <Link href="/portal" className="bg-gradient-to-r from-blue-400 to-blue-300 text-gray-950 px-6 py-2 rounded-full text-sm font-medium hover:from-blue-300 hover:to-blue-200 transition-all shadow-lg">
                Log Hours
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        <div className="max-w-7xl mx-auto text-center relative">
          <div className="inline-flex items-center bg-white/90 backdrop-blur-sm rounded-full px-6 py-2 mb-8">
            <span className="text-sm text-gray-700 transition-all duration-500">
              {isClient ? messages[currentMessageIndex] : messages[0]}
            </span>
          </div>
          <h2 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-950 bg-clip-text text-transparent">
              Making Communities
            </span>
            <br />
            <span className="animate-gradient-x bg-gradient-slow">Beautiful</span>{" "}
            <span className="text-black">Together</span>
          </h2>
          <p className="text-xl text-gray-800 mb-12 max-w-4xl mx-auto leading-relaxed">
            Join our mission to create beautiful artwork and donate it to seniors and retirement communities. 
            Track your volunteer hours, see your impact, and bring joy to those who need it most.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/portal" className="bg-gradient-to-r from-blue-400 to-blue-300 text-gray-950 px-8 py-4 rounded-full text-lg font-semibold hover:from-blue-300 hover:to-blue-200 transition-all shadow-xl transform hover:scale-105">
              Start Logging Hours
            </Link>
            <a href="#mission" className="border-2 border-blue-300 text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all backdrop-blur-sm">
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-6">
              Our Mission
            </h3>
            <p className="text-xl text-gray-800 max-w-4xl mx-auto leading-relaxed">
              Paint It Forward brings volunteers together to create beautiful artwork and donate it to 
              seniors and retirement communities, spreading joy and meaningful connections across generations.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group text-center p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-200 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl">🏠</span>
              </div>
              <h4 className="text-xl font-semibold mb-4 text-gray-950">Create Art</h4>
              <p className="text-gray-800 leading-relaxed">Volunteer to create beautiful paintings and artwork that brightens lives.</p>
            </div>
            <div className="group text-center p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl">🤝</span>
              </div>
              <h4 className="text-xl font-semibold mb-4 text-gray-950">Serve Seniors</h4>
              <p className="text-gray-800 leading-relaxed">Donate artwork to retirement communities and brighten seniors&apos; everyday spaces.</p>
            </div>
            <div className="group text-center p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl">💝</span>
              </div>
              <h4 className="text-xl font-semibold mb-4 text-gray-950">Spread Joy</h4>
              <p className="text-gray-800 leading-relaxed">Boost emotions and mental well-being of seniors through the gift of art.</p>
            </div>
          </div>
        </div>
      </section>


      {/* Impact Stats */}
      <section id="impact" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%20fill-rule%3D%22evenodd%22%3E%3Cpath%20d%3D%22M20%2020c0-11.046-8.954-20-20-20v20h20z%22/%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold text-gray-950 mb-6">Our Impact</h3>
            <p className="text-xl text-gray-800">See the difference we&apos;re making together:</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-2xl bg-white/90 backdrop-blur-lg border border-gray-200">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-300 to-blue-200 bg-clip-text text-transparent mb-2">20+</div>
              <div className="text-gray-700 text-lg">Artworks Created</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-white/90 backdrop-blur-lg border border-gray-200">
              <div className="text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                {loading ? '...' : totalVolunteerHours}
              </div>
              <div className="text-gray-700 text-lg">Volunteer Hours</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-white/90 backdrop-blur-lg border border-gray-200">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-200 to-blue-300 bg-clip-text text-transparent mb-2">3</div>
              <div className="text-gray-700 text-lg">Communities Served</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-white/90 backdrop-blur-lg border border-gray-200">
              <div className="text-5xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2">25+</div>
              <div className="text-gray-700 text-lg">Seniors Served</div>
            </div>
          </div>
        </div>
      </section>


      {/* Call to Action */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h3 className="text-4xl md:text-5xl font-bold text-gray-950 mb-6">Ready to Make a Difference?</h3>
          <p className="text-xl text-gray-700 mb-12 max-w-3xl mx-auto">Join our community of students creating art for seniors and earn volunteer hours.</p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/contact" className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all shadow-xl transform hover:scale-105">
              Get Started
            </Link>
            <Link href="/contact" className="border-2 border-gray-600 text-gray-800 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all backdrop-blur-sm">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-100 to-gray-200 text-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-xl mr-3 overflow-hidden">
                  <img src="/logo.png" alt="Paint It Forward Logo" className="w-full h-full object-cover" />
                </div>
                <h4 className="text-2xl font-bold bg-gradient-to-r from-blue-300 to-blue-200 bg-clip-text text-transparent">
                  Paint It Forward
                </h4>
              </div>
              <p className="text-gray-800 mb-6 max-w-md">Brightening seniors&apos; lives, one artwork at a time. Join our mission to create and donate beautiful art to retirement communities.</p>
              <div>
                <a 
                  href="https://www.instagram.com/mhs_paintitforward/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-gradient-to-r from-pink-300 to-pink-200 text-white px-4 py-2 rounded-full text-sm font-medium hover:from-pink-400 hover:to-pink-300 transition-all"
                >
                  Follow Us on Instagram!
                </a>
              </div>
            </div>
            <div>
              <h5 className="text-lg font-semibold mb-4 text-gray-800">Quick Links</h5>
              <div className="space-y-3">
                <Link href="/about" className="block text-gray-800 hover:text-gray-800 transition-colors">About Us</Link>
                <Link href="/portal" className="block text-gray-400 hover:text-gray-950 transition-colors">Member Portal</Link>
              </div>
            </div>
            <div>
              <h5 className="text-lg font-semibold mb-4 text-gray-800">Support</h5>
              <div className="space-y-3">
                <Link href="/contact" className="block text-gray-400 hover:text-gray-950 transition-colors">Contact</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-400 pt-8 text-center">
            <p className="text-gray-800">© 2025 Paint It Forward. All rights reserved. Made with ❤️ for communities everywhere.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
