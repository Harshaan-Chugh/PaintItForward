import Link from "next/link";

export default function Projects() {
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
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent mb-6">
              Our Projects
            </h2>
            <p className="text-xl text-white/70">See the amazing transformations happening in communities everywhere</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Sunset Elementary Makeover", location: "Portland, OR", status: "Completed" },
              { title: "Community Center Refresh", location: "Austin, TX", status: "In Progress" },
              { title: "Senior Housing Project", location: "Denver, CO", status: "Completed" },
              { title: "Youth Center Transformation", location: "Seattle, WA", status: "Planned" },
              { title: "Neighborhood Beautification", location: "Phoenix, AZ", status: "In Progress" },
              { title: "School Mural Project", location: "San Diego, CA", status: "Completed" }
            ].map((project, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-48 rounded-xl mb-4 flex items-center justify-center">
                  <span className="text-gray-600">Project Photo</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
                <p className="text-white/70 mb-4">{project.location}</p>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  project.status === 'Completed' ? 'bg-green-500/20 text-green-400' :
                  project.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {project.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}