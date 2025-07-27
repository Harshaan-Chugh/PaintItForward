import Link from "next/link";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <nav className="fixed w-full z-50 bg-white/10 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center">
              <div className="w-10 h-10 rounded-xl mr-3 overflow-hidden">
                <img src="/logo.png" alt="Paint It Forward Logo" className="w-full h-full object-cover" />
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
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent mb-8 text-center">
            Privacy Policy
          </h2>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="text-white/80 space-y-6">
              <p>Your privacy is important to us. This policy outlines how we collect, use, and protect your information.</p>
              <h3 className="text-xl font-bold text-white">Information We Collect</h3>
              <p>We collect only the information necessary to provide our volunteer tracking services.</p>
              <h3 className="text-xl font-bold text-white">How We Use Your Information</h3>
              <p>Your information is used solely for volunteer hour tracking and community impact reporting.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}