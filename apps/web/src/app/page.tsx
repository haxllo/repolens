'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { 
  Search, 
  LayoutDashboard, 
  ChevronRight, 
  MessageSquare,
  Zap,
  Layers,
  MousePointer2,
  Moon,
  BookOpen,
  Code,
  Globe,
  ShieldCheck,
  Cpu
} from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { HeaderSignIn, HeroSignIn } from '@/components/HomeSignInButtons'
import Hero3D from '@/components/landing/Hero3D'

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
  
  // Refined Docking Search Bar
  // Move from hero position (480px) to navbar center
  const searchY = useTransform(scrollY, [0, 400], [0, -468]) 
  
  // Width transitions: Hero Width (700px) -> Navbar Width (500px)
  // Using pixel values for both ensures stable centering
  const searchWidth = useTransform(scrollY, [0, 400], ['700px', '500px'])
  
  // Height transitions: Tall hero input (64px) -> Sleek navbar input (44px)
  const searchHeight = useTransform(scrollY, [0, 400], ['64px', '44px'])
  const searchPadding = useTransform(scrollY, [0, 400], ['1rem', '0.5rem'])
  
  // Smooth physics
  const springConfig = { stiffness: 150, damping: 25, mass: 0.8 }
  const smoothSearchY = useSpring(searchY, springConfig)
  const smoothSearchWidth = useSpring(searchWidth, springConfig)
  const smoothSearchHeight = useSpring(searchHeight, springConfig)

  // Hero Content Fade
  const heroOpacity = useTransform(scrollY, [0, 200], [1, 0])
  const heroY = useTransform(scrollY, [0, 200], [0, 50])

  return (
    <div className="min-h-screen bg-[#050508] text-white selection:bg-indigo-500/30 overflow-x-hidden font-sans">
      
      {/* 3D Background Layer */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <Hero3D />
      </div>

      {/* Navbar Container */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-4 pointer-events-none transition-all duration-500">
        {/* Navbar Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xl border-b border-white/5 opacity-0 data-[scrolled=true]:opacity-100 transition-opacity duration-500" />

        {/* Brand */}
        <div className="flex items-center gap-3 pointer-events-auto backdrop-blur-sm px-4 py-2 rounded-full border border-white/5 bg-black/20 relative z-10">
          <div className="relative w-6 h-6 flex items-center justify-center">
            <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-50" />
            <Layers className="w-5 h-5 text-indigo-400 relative z-10" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            Code Wiki
          </span>
        </div>
        
        {/* The Docking Search Bar Container - Fixed Centering */}
        <motion.div 
          style={{ y: smoothSearchY }}
          className="absolute left-1/2 -translate-x-1/2 top-[480px] pointer-events-auto flex items-center justify-center z-50"
        >
          {/* Inner Input - Width Animates Here */}
          <motion.div 
            style={{ 
              width: smoothSearchWidth,
              height: smoothSearchHeight,
            }}
            className="relative group"
          >
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none z-10">
              <Search className="h-4 w-4 text-white/40 group-focus-within:text-indigo-400 transition-colors" />
            </div>
            <motion.input 
              type="text"
              placeholder="Find open source repos..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              style={{ padding: searchPadding }}
              className="w-full h-full bg-white/[0.03] hover:bg-white/[0.06] focus:bg-black/80 border border-white/10 hover:border-white/20 focus:border-indigo-500/50 rounded-full pl-12 pr-6 text-sm transition-all placeholder:text-white/20 backdrop-blur-xl shadow-2xl shadow-indigo-500/10 outline-none"
            />
          </motion.div>
        </motion.div>

        {/* Right Nav */}
        <div className="flex items-center gap-4 pointer-events-auto relative z-10">
          {!isPending && (
            <>
              {session ? (
                <Link href="/dashboard">
                  <button className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full transition-all text-sm font-medium backdrop-blur-md">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </button>
                </Link>
              ) : (
                <div className="flex items-center gap-4">
                  <HeaderSignIn />
                </div>
              )}
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6 flex flex-col items-center text-center z-10 min-h-[90vh]">
        <motion.div style={{ opacity: heroOpacity, y: heroY }} className="relative z-10">
          
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-md mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-xs font-medium text-indigo-300 tracking-wide uppercase">AI-Native Documentation</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 max-w-4xl mx-auto"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40">
              The Knowledge Layer
            </span>
            <br />
            <span className="text-indigo-500 inline-block mt-2">for Software.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-xl mx-auto mb-12 text-lg text-white/50 leading-relaxed"
          >
            Instantly transform any repository into a structured, queryable knowledge base. 
            Stop searching through files. Start asking questions.
          </motion.p>
        </motion.div>

        {/* Feature Grid (Floating Cards) */}
        <div className="w-full max-w-6xl mx-auto mt-32 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {[
            { 
              icon: Globe, 
              title: "Universal Parsing", 
              desc: "Understands TypeScript, Python, Go, and Rust out of the box." 
            },
            { 
              icon: ShieldCheck, 
              title: "Zero-Trust Analysis", 
              desc: "Sandboxed execution environment ensures your code never leaves the secure perimeter." 
            },
            { 
              icon: Cpu, 
              title: "Semantic Intelligence", 
              desc: "Vector-embedded knowledge graph connects definitions, usage, and architectural intent." 
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 + (i * 0.1) }}
              className="glass-card p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-500 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 group-hover:bg-indigo-500/20 transition-colors">
                <feature.icon className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white/90">{feature.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Repositories */}
      <section className="max-w-7xl mx-auto px-6 py-32 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-2">Trending Libraries</h2>
            <p className="text-white/40">Explore knowledge bases generated by the community.</p>
          </div>
          <button className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors text-sm font-medium mt-4 md:mt-0">
            View all repositories <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredRepos.map((repo, idx) => (
            <motion.div 
              key={repo.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="group p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:border-indigo-500/30 hover:bg-white/[0.04] transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-32 bg-indigo-500/5 blur-[80px] rounded-full translate-x-10 -translate-y-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <h3 className="font-bold text-xl">{repo.name}</h3>
                <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-xs font-bold text-white/40 group-hover:bg-indigo-500/20 group-hover:text-indigo-300 transition-all">
                  {repo.icon}
                </div>
              </div>
              <p className="text-sm text-white/40 leading-relaxed mb-8 h-12 overflow-hidden relative z-10">{repo.desc}</p>
              <div className="flex items-center gap-2 text-xs font-mono text-white/20 relative z-10">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                {repo.stars}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-32 flex flex-col items-center text-center relative z-10">
        <div className="w-full max-w-5xl bg-gradient-to-b from-indigo-900/20 to-transparent rounded-[2.5rem] border border-white/5 p-12 md:p-24 relative overflow-hidden">
          {/* Background Glows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              Ready to understand your code?
            </h2>
            <p className="text-white/50 text-lg mb-10 max-w-xl">
              Join thousands of developers using Code Wiki to document, analyze, and query their software architecture.
            </p>
            
            {!isPending && (
              <>
                {session ? (
                   <Link href="/dashboard">
                     <button className="flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-indigo-50 transition-all transform hover:scale-105 shadow-xl shadow-indigo-500/20">
                       <Zap className="w-4 h-4 fill-current" />
                       Go to Dashboard
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

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-8 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <Layers className="w-5 h-5" />
            <span className="font-semibold text-sm">Code Wiki</span>
          </div>
          <div className="flex gap-8 text-sm text-white/30 font-medium">
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
            <a href="#" className="hover:text-white transition-colors">API</a>
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  )
}