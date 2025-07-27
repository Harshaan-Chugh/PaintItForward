import Link from "next/link";

export default function Donate() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/10 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Paint It Forward
              </h1>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-white/80 hover:text-white px-3 py-2 text-sm font-medium transition-colors">Home</Link>
              <Link href="/portal" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg">
                Portal
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Donate Content */}
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent mb-6">
              Support Our Mission
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Your donation helps us provide paint, supplies, and resources to transform communities across the nation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Donation Options */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">$25</h3>
              <p className="text-white/80 mb-6">Provides paint for one room transformation</p>
              <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-full font-semibold hover:from-green-600 hover:to-emerald-700 transition-all">
                Donate $25
              </button>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-blue-400/50 text-center ring-2 ring-blue-400/50">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🏠</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">$75</h3>
              <p className="text-white/80 mb-6">Covers supplies for an entire home makeover</p>
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm mb-4">Most Popular</div>
              <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:from-blue-600 hover:to-purple-700 transition-all">
                Donate $75
              </button>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🌟</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">$150</h3>
              <p className="text-white/80 mb-6">Sponsors a complete neighborhood project</p>
              <button className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-6 py-3 rounded-full font-semibold hover:from-yellow-600 hover:to-orange-700 transition-all">
                Donate $150
              </button>
            </div>
          </div>

          {/* Custom Amount */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center">
            <h3 className="text-2xl font-bold text-white mb-6">Custom Amount</h3>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <div className="flex-1">
                <input 
                  type="number" 
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all">
                Donate
              </button>
            </div>
          </div>

          {/* Impact Info */}
          <div className="mt-16 grid md:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h4 className="text-xl font-bold text-white mb-4">Where Your Money Goes</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/80">Paint & Supplies</span>
                  <span className="text-white font-semibold">70%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">Community Programs</span>
                  <span className="text-white font-semibold">20%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">Operations</span>
                  <span className="text-white font-semibold">10%</span>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h4 className="text-xl font-bold text-white mb-4">Other Ways to Help</h4>
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="text-lg mr-3">🎨</span>
                  <span className="text-white/80">Donate paint supplies</span>
                </div>
                <div className="flex items-center">
                  <span className="text-lg mr-3">🔧</span>
                  <span className="text-white/80">Provide tools & equipment</span>
                </div>
                <div className="flex items-center">
                  <span className="text-lg mr-3">⏰</span>
                  <span className="text-white/80">Volunteer your time</span>
                </div>
                <div className="flex items-center">
                  <span className="text-lg mr-3">📢</span>
                  <span className="text-white/80">Spread the word</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}