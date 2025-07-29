import Link from "next/link";

export default function Contact() {
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
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-800 hover:text-gray-950 px-3 py-2 text-sm font-medium transition-colors">Home</Link>
              <Link href="/portal" className="bg-gradient-to-r from-blue-400 to-blue-300 text-gray-950 px-6 py-2 rounded-full text-sm font-medium hover:from-blue-300 hover:to-blue-200 transition-all shadow-lg">
                Portal
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Contact Content */}
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-6">
              Contact Us
            </h2>
            <p className="text-xl text-gray-800 max-w-3xl mx-auto">
              Get in touch with our team. We&apos;d love to hear from you and help you get involved with Paint It Forward.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-950 mb-6">Send us a message</h3>
              <form className="space-y-6">
                <div>
                  <label className="block text-gray-900 text-sm font-medium mb-2">Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-gray-200/80 border border-white/20 rounded-lg text-gray-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-gray-900 text-sm font-medium mb-2">Email</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-3 bg-gray-200/80 border border-white/20 rounded-lg text-gray-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-gray-900 text-sm font-medium mb-2">Message</label>
                  <textarea 
                    rows={5}
                    className="w-full px-4 py-3 bg-gray-200/80 border border-white/20 rounded-lg text-gray-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Tell us how we can help..."
                  ></textarea>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-400 to-blue-300 text-gray-950 px-6 py-3 rounded-lg font-semibold hover:from-blue-300 hover:to-blue-200 transition-all"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 border border-gray-200">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-300 to-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">📧</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-950 mb-4">Get in Touch</h3>
                  <p className="text-gray-800 mb-6">
                    Have questions about our mission, want to volunteer, or interested in supporting our cause? 
                    We&apos;d love to hear from you!
                  </p>
                  <div className="bg-gray-200/80 backdrop-blur-sm rounded-xl p-4">
                    <h4 className="text-lg font-semibold text-gray-950 mb-2">Email Us</h4>
                    <a 
                      href="mailto:pc104861@student.musd.org" 
                      className="text-blue-600 hover:text-blue-700 text-lg font-medium transition-colors"
                    >
                      pc104861@student.musd.org
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-gray-200/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h4 className="text-gray-950 font-semibold mb-4 text-center">Follow Our Mission</h4>
                <div className="text-center">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}