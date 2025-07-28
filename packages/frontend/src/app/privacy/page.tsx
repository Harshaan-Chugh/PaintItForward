import Link from "next/link";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center">
              <div className="w-10 h-10 rounded-xl mr-3 overflow-hidden">
                <img src="/logo.png" alt="Paint It Forward Logo" className="w-full h-full object-cover" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-300 to-blue-200 bg-clip-text text-transparent">
                Paint It Forward
              </h1>
            </Link>
            <Link href="/" className="text-gray-800 hover:text-gray-950 px-3 py-2 text-sm font-medium transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Header Section */}
      <div className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-6">
            Privacy Policy
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We value your privacy and are committed to protecting your personal information.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200">
            <div className="p-8 md:p-12">
              <div className="prose prose-lg max-w-none">
                
                {/* Introduction */}
                <div className="mb-8">
                  <p className="text-gray-700 text-lg leading-relaxed">
                    At Paint It Forward, we are committed to protecting your privacy and ensuring the security of your personal information. 
                    This Privacy Policy explains how we collect, use, and safeguard your data when you use our volunteer tracking platform.
                  </p>
                </div>

                {/* Information We Collect */}
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-300 to-blue-400 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white text-sm">📊</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Information We Collect</h3>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-6 mb-4">
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span><strong>Personal Information:</strong> Name and email address through Google Sign-In</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span><strong>Volunteer Data:</strong> Hours logged, activity descriptions, and dates</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span><strong>Usage Information:</strong> Basic analytics to improve our platform</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* How We Use Your Information */}
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-300 to-blue-400 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white text-sm">🔧</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">How We Use Your Information</h3>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-6 mb-4">
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span>Track and verify your volunteer hours</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span>Generate impact reports for our community</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span>Communicate about volunteer opportunities</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span>Improve our platform and services</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Data Protection */}
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-300 to-blue-400 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white text-sm">🔒</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Data Protection</h3>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-6 mb-4">
                    <p className="text-gray-700 leading-relaxed">
                      We implement industry-standard security measures to protect your personal information. 
                      Your data is stored securely and is never shared with third parties without your consent, 
                      except as required by law.
                    </p>
                  </div>
                </div>

                {/* Your Rights */}
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-300 to-blue-400 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white text-sm">⚖️</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Your Rights</h3>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-6 mb-4">
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span>Access and review your personal data</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span>Request corrections to your information</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span>Delete your account and associated data</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span>Opt out of communications at any time</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="border-t border-gray-200 pt-8">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Questions About This Policy?</h3>
                    <p className="text-gray-600 mb-6">
                      If you have any questions about this Privacy Policy or how we handle your data, 
                      please don&apos;t hesitate to reach out to us.
                    </p>
                    <Link 
                      href="/contact" 
                      className="inline-flex items-center bg-gradient-to-r from-blue-400 to-blue-300 text-white px-6 py-3 rounded-full font-semibold hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg"
                    >
                      Contact Us
                    </Link>
                  </div>
                </div>

                {/* Last Updated */}
                <div className="text-center mt-8 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}