import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-violet-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-300/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-violet-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-20">
        {/* Hero Section */}
        <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom duration-1000">
          {/* Logo/Icon */}
          <div className="flex justify-center">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-cyan-500 via-blue-500 to-violet-600 shadow-2xl animate-glow">
              <span className="text-8xl">🧘</span>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-7xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-violet-600 bg-clip-text text-transparent drop-shadow-sm">
              CareSync
            </h1>
            <p className="text-3xl text-slate-600 font-medium max-w-3xl mx-auto">
              Your AI-powered wellness companion for healthcare heroes 💙
            </p>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              Track your mood, manage burnout, coordinate with your team, and thrive in demanding schedules
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-6 justify-center items-center flex-wrap pt-8 animate-in slide-in-from-bottom duration-1000 delay-300">
            <Link
              href="/login"
              className="group px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-xl font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3"
            >
              <span>Get Started</span>
              <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link
              href="/signup"
              className="px-10 py-5 bg-white/80 backdrop-blur-sm hover:bg-white text-cyan-600 text-xl font-bold rounded-2xl shadow-lg hover:shadow-xl border-2 border-cyan-200 hover:border-cyan-300 transform hover:scale-105 transition-all duration-300"
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom duration-1000 delay-500">
          {/* Feature 1 */}
          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-cyan-100">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📊</div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Mood Tracking</h3>
            <p className="text-slate-600">Daily check-ins with AI-powered insights to monitor your emotional wellness</p>
          </div>

          {/* Feature 2 */}
          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-violet-100">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🔥</div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Burnout Prevention</h3>
            <p className="text-slate-600">Advanced analytics to detect burnout early with personalized recommendations</p>
          </div>

          {/* Feature 3 */}
          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-blue-100">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">👥</div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Team Sync Circles</h3>
            <p className="text-slate-600">Coordinate schedules, share shifts, and support your healthcare team</p>
          </div>

          {/* Feature 4 */}
          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-emerald-100">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📅</div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Smart Scheduler</h3>
            <p className="text-slate-600">Intelligent scheduling with AI assistant for shifts, tasks, and habits</p>
          </div>

          {/* Feature 5 */}
          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-amber-100">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🎯</div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Habit Tracking</h3>
            <p className="text-slate-600">Build healthy routines with gamified progress and achievement badges</p>
          </div>

          {/* Feature 6 */}
          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-pink-100">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🤖</div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">AI Assistant</h3>
            <p className="text-slate-600">Natural language commands for logging, scheduling, and wellness tips</p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-24 bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-600 rounded-3xl p-12 shadow-2xl animate-in fade-in slide-in-from-bottom duration-1000 delay-700">
          <div className="grid md:grid-cols-3 gap-8 text-center text-white">
            <div>
              <div className="text-6xl font-bold mb-2">11</div>
              <div className="text-xl opacity-90">Core Features</div>
            </div>
            <div>
              <div className="text-6xl font-bold mb-2">100%</div>
              <div className="text-xl opacity-90">Built for Healthcare Workers</div>
            </div>
            <div>
              <div className="text-6xl font-bold mb-2">24/7</div>
              <div className="text-xl opacity-90">AI-Powered Support</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-12 text-slate-600">
        <p className="text-lg">
          Built with 💙 for healthcare heroes everywhere
        </p>
        <p className="text-sm mt-2 opacity-70">
          © 2025 CareSync. Stay well, stay balanced.
        </p>
      </footer>
    </div>
  );
}
