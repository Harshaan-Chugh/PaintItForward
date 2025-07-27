import Link from "next/link";

export default function Volunteer() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
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
            <Link href="/" className="text-white/80 hover:text-white px-3 py-2 text-sm font-medium transition-colors">Back to Home</Link>
          </div>
        </div>
      </nav>
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent mb-8">
            Become a Volunteer
          </h2>
          <p className="text-xl text-white/70 mb-12">
            Join our community of changemakers and help transform neighborhoods one brush stroke at a time.
          </p>
          <Link href="/portal" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-xl transform hover:scale-105">
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}