'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Sparkles, 
  LayoutDashboard, 
  ChevronRight, 
  Bell,
  MessageSquare,
  Zap,
  Layers,
  RefreshCcw,
  Link as LinkIcon,
  MousePointer2,
  Moon,
  BookOpen,
  Code
} from 'lucide-react'
import { 
  useScroll, 
  useTransform, 
  useSpring
} from 'framer-motion'
import { HeaderSignIn, HeroSignIn } from '@/components/HomeSignInButtons'
import { authClient } from '@/lib/auth-client'

const featuredRepos = [
  { name: 'gemini-cli', desc: 'An open-source AI agent that brings the power of Gemini directly into your terminal.', stars: '81.5k', icon: 'G' },
  { name: 'go', desc: 'The Go programming language', stars: '120.7k', icon: 'Go' },
  { name: 'flutter', desc: 'Flutter makes it easy and fast to build beautiful apps for mobile and beyond', stars: '173.1k', icon: 'F' },
  { name: 'kubernetes', desc: 'Production-Grade Container Scheduling and Management', stars: '118.4k', icon: 'K' },
  { name: 'react', desc: 'The library for web and native user interfaces.', stars: '240.3k', icon: 'R' },
  { name: 'python-sdk', desc: 'The official Python SDK for Model Context Protocol servers and clients', stars: '19.8k', icon: 'P' },
]

export default function HomePage() {
  const { data: session, isPending } = authClient.useSession()
  const [searchValue, setSearchValue] = useState('')
  
  const { scrollY } = useScroll()
  
  // Search bar docking transforms
  const searchY = useTransform(scrollY, [0, 200], [0, -215])
  const searchScale = useTransform(scrollY, [0, 200], [1, 0.7])
  const searchWidth = useTransform(scrollY, [0, 200], ['100%', '40%'])
  const searchOpacity = useTransform(scrollY, [200, 250], [1, 1])
  
  // Hero content fades
  const heroOpacity = useTransform(scrollY, [0, 150], [1, 0])
  const heroScale = useTransform(scrollY, [0, 150], [1, 0.9])

  // Parallax for cards
  const cardsY = useTransform(scrollY, [0, 400], [0, -100])
  const cardsRotate = useTransform(scrollY, [0, 400], [12, 0])

  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 }
  const smoothSearchY = useSpring(searchY, springConfig)

  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-blue-500/30 overflow-x-hidden">
      {/* Navbar & Docked Search Area */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-6 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex gap-0.5">
            <div className="w-2 h-2 rounded-full bg-orange-400" />
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <div className="w-2 h-2 rounded-full bg-green-400" />
          </div>
          <span className="font-bold text-lg tracking-tight">Code Wiki</span>
        </div>
        
        {/* The Docking Search Bar */}
        <motion.div 
          style={{ 
            y: smoothSearchY, 
            scale: searchScale,
            width: searchWidth,
          }}
          className="absolute left-1/2 -translate-x-1/2 top-[248px] pointer-events-auto w-full max-w-2xl px-4 md:px-0"
        >
          <div className="relative group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-white/20 group-focus-within:text-blue-400 transition-colors" />
            </div>
            <input 
              type="text"
              placeholder="Find open source repos"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-full py-4 pl-12 pr-6 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all placeholder:text-white/20 backdrop-blur-md shadow-2xl"
            />
          </div>
        </motion.div>

        <div className="flex items-center gap-6 pointer-events-auto">
          <Moon className="w-4 h-4 text-white/40 cursor-pointer hover:text-white transition-colors" />
          {!isPending && (
            <>
              {session ? (
                <Link href="/dashboard">
                  <button className="flex items-center gap-2 px-4 py-2 text-white/70 hover:text-white transition-colors text-sm font-medium">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </button>
                </Link>
              ) : (
                <HeaderSignIn />
              )}
            </>
          )}
        </div>
      </nav>

      {/* Hero Content */}
      <section className="relative pt-40 pb-32 px-6 flex flex-col items-center text-center z-10">
        <motion.div style={{ opacity: heroOpacity, scale: heroScale }}>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-7xl md:text-8xl font-bold tracking-tighter mb-6"
          >
            Code Wiki
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-xl mx-auto mb-12"
          >
            <p className="text-blue-400/80 font-medium mb-1 text-lg">A new perspective on development for the agentic era.</p>
            <p className="text-white/40 text-lg">Gemini-generated documentation, always up-to-date.</p>
          </motion.div>
        </motion.div>

        {/* Height spacer for the absolute search bar's initial position */}
        <div className="h-24" />

        {/* Perspective Cards with Parallax */}
        <motion.div 
          style={{ y: cardsY, rotateX: cardsRotate }}
          className="mt-20 relative h-[400px] w-full max-w-5xl mx-auto flex justify-center items-center perspective-1000"
        >
          <div className="absolute inset-0 bg-blue-600/5 blur-[120px] rounded-full translate-y-20" />
          
          {/* Floating Wireframe Cube Placeholder */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-20 w-64 h-64 opacity-20 pointer-events-none">
            <div className="w-full h-full border border-blue-400/30 rotate-45 animate-pulse" />
            <div className="absolute inset-0 border border-blue-400/20 -rotate-12" />
          </div>

          <div className="relative flex gap-6">
            {[1, 2, 3, 4].map((i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (i * 0.1) }}
                className="w-48 h-64 bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-sm -rotate-y-12 shadow-2xl flex flex-col p-6"
                style={{ 
                  transform: `translateZ(${i * 30}px) translateY(${i * -15}px)`,
                }}
              >
                <div className="w-10 h-10 rounded-lg bg-white/5 mb-4 flex items-center justify-center">
                  {i === 1 && <BookOpen className="w-5 h-5 text-blue-400/60" />}
                  {i === 2 && <Code className="w-5 h-5 text-blue-400/60" />}
                  {i === 3 && <MessageSquare className="w-5 h-5 text-blue-400/60" />}
                  {i === 4 && <MousePointer2 className="w-5 h-5 text-blue-400/60" />}
                </div>
                <div className="h-2 w-full bg-white/5 rounded mb-2" />
                <div className="h-2 w-3/4 bg-white/5 rounded mb-2" />
                <div className="mt-auto h-2 w-1/2 bg-blue-400/20 rounded" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Featured Repositories - Reveal on Scroll */}
      <section className="max-w-6xl mx-auto px-6 py-20 relative">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold mb-12 tracking-tight">Featured Repositories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredRepos.map((repo, idx) => (
              <motion.div 
                key={repo.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:border-blue-500/30 hover:bg-white/[0.04] transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start mb-6">
                  <h3 className="font-bold text-xl">{repo.name}</h3>
                  <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-xs font-bold text-white/40">
                    {repo.icon}
                  </div>
                </div>
                <p className="text-sm text-white/40 leading-relaxed mb-8 h-12 overflow-hidden">{repo.desc}</p>
                <div className="flex items-center gap-2 text-xs font-mono text-white/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40" />
                  {repo.stars}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Try with Private Repos */}
      <section className="max-w-6xl mx-auto px-6 py-32 flex flex-col md:flex-row gap-12 items-center">
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
            <h2 className="text-2xl font-bold">Try it with your own private repository</h2>
            <span className="text-[10px] uppercase font-bold text-white/40">Coming Soon</span>
          </div>
          <p className="text-lg text-white/40 leading-relaxed">
            Stop documenting. Start understanding. Connect your repository and get a fully interactive Code Wiki that stays perfectly in sync with every change. No more stale docs. Ever.
          </p>
          <button className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-white/90 transition-all">
            <Bell className="w-4 h-4" />
            Notify me when available
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 relative h-[300px] w-full">
           <div className="absolute inset-0 bg-blue-500/5 blur-[80px] rounded-full" />
           <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-full max-w-sm p-6 rounded-2xl bg-white/[0.03] border border-white/10 font-mono text-xs text-blue-400/60 leading-relaxed">
               background-color: #020202;<br/>
               font-family: "Courier New", Courier, monospace;<br/>
               color: #a1adfb;<br/>
               margin: 0;
             </div>
           </div>
        </div>
      </section>

      {/* Core Features Pillars */}
      <section className="max-w-6xl mx-auto px-6 py-32 border-t border-white/5">
        <h2 className="text-4xl font-bold mb-4">Read your app for the first time</h2>
        <p className="text-white/40 mb-16">Code documentation that works for you, not the other way around.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-6">
              <MousePointer2 className="w-5 h-5 text-white/60" />
            </div>
            <h3 className="text-xl font-bold">Understand your code section by section</h3>
            <p className="text-white/40 text-sm leading-relaxed">
              Focus on the code you care about. Pick a section and dive deeper to see exactly how it works.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-6">
              <Zap className="w-5 h-5 text-white/60" />
            </div>
            <h3 className="text-xl font-bold">Generated automatically</h3>
            <p className="text-white/40 text-sm leading-relaxed">
              Our AI agent automatically generates and maintains a rich, interactive knowledge base from your code.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-6">
              <RefreshCcw className="w-5 h-5 text-white/60" />
            </div>
            <h3 className="text-xl font-bold">Always up-to-date</h3>
            <p className="text-white/40 text-sm leading-relaxed">
              Every time a pull request is merged, the relevant documentation is automatically updated.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-6">
              <LinkIcon className="w-5 h-5 text-white/60" />
            </div>
            <h3 className="text-xl font-bold">Linked back to your code</h3>
            <p className="text-white/40 text-sm leading-relaxed">
              Instantly jump from an architectural overview to the exact service, or from a function's description to its definition in the repository.
            </p>
          </div>
        </div>

        <div className="mt-20 p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-12">
          <div className="flex-1">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4">
              <Layers className="w-5 h-5 text-white/60" />
            </div>
            <h3 className="text-xl font-bold mb-2">Diagrams</h3>
            <p className="text-white/40 text-sm leading-relaxed">
              Instead of piecing together complex systems in your head, watch as your code is transformed into clear, intuitive visuals that bring your architecture to life.
            </p>
          </div>
          <div className="flex-1 h-32 bg-blue-500/5 rounded-2xl border border-white/5" />
        </div>
      </section>

      {/* Talk to your codebase */}
      <section className="max-w-6xl mx-auto px-6 py-32 border-t border-white/5">
        <h2 className="text-4xl font-bold mb-4">Talk to your codebase</h2>
        <p className="text-white/40 mb-12 max-w-lg">
          Ask questions about your architecture, find function definitions, and understand complex logic in natural language. It's like having an engineer on call, 24/7.
        </p>
        
        <div className="space-y-4">
          {[
            { icon: MessageSquare, text: 'Chat with your codebase' },
            { icon: Search, text: 'Find what you need instantly' },
            { icon: Zap, text: 'Low latency, high-quality' },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-4 group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all">
                <item.icon className="w-4 h-4 text-white/40 group-hover:text-white" />
              </div>
              <span className="font-bold text-white/60 group-hover:text-white transition-all">{item.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="px-6 py-32 flex flex-col items-center text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-16 tracking-tight">Add the missing dimensions to your software</h2>
        
        <div className="w-full max-w-5xl aspect-video bg-[#0a0a0a] rounded-3xl border border-white/10 p-4 shadow-3xl relative group overflow-hidden">
           <div className="absolute inset-0 bg-blue-600/5 group-hover:bg-blue-600/10 transition-all" />
           <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-48 h-48 bg-blue-500/20 blur-[60px] rounded-full animate-pulse" />
             <div className="relative w-40 h-40 bg-white/5 border border-white/10 rotate-12 flex items-center justify-center shadow-2xl">
                <Sparkles className="w-12 h-12 text-blue-400" />
             </div>
           </div>
           
           <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
             {!isPending && (
               <>
                 {session ? (
                   <Link href="/dashboard">
                     <button className="flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 px-8 py-4 rounded-full font-bold hover:bg-white/20 transition-all text-white">
                       <Sparkles className="w-4 h-4 text-blue-400" />
                       See Code Wiki in action
                       <ChevronRight className="w-4 h-4" />
                     </button>
                   </Link>
                 ) : (
                   <HeroSignIn />
                 )}
               </>
             )}
           </div>
        </div>
      </section>

      {/* Global Footer */}
      <footer className="px-8 py-12 border-t border-white/5 flex justify-between items-center text-[10px] text-white/20 font-bold uppercase tracking-widest">
        <div>Google for Developers</div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white">FAQ</a>
          <a href="#" className="hover:text-white">Feedback</a>
          <a href="#" className="hover:text-white">Terms</a>
          <a href="#" className="hover:text-white">Privacy</a>
        </div>
      </footer>
    </div>
  )
}
