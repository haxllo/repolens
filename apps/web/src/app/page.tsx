'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { 
  Search, 
  LayoutDashboard, 
  ChevronRight, 
  Layers,
  Globe,
  ShieldCheck,
  Cpu,
  Command,
  ArrowRight
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
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0])
  const heroY = useTransform(scrollY, [0, 300], [0, 50])

  return (
    <div className="min-h-screen bg-black text-white selection:bg-lime-400/30 overflow-x-hidden font-sans">
      
      {/* 3D Background Layer */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40 grayscale">
        <Hero3D />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-12 py-6 pointer-events-none transition-all duration-500">
        <div className="flex items-center gap-4 pointer-events-auto">
          <div className="w-8 h-8 bg-white flex items-center justify-center">
            <Layers className="w-5 h-5 text-black" />
          </div>
          <span className="font-black text-xl tracking-[0.2em] uppercase">
            RepoLens
          </span>
        </div>

        <div className="flex items-center gap-8 pointer-events-auto">
          {!isPending && (
            <>
              {session ? (
                <Link href="/dashboard">
                  <button className="flex items-center gap-2 px-6 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-lime-400 transition-colors">
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

      {/* Hero Section */}
      <section className="relative pt-64 pb-32 px-12 flex flex-col items-center text-center z-10 min-h-screen">
        <motion.div style={{ opacity: heroOpacity, y: heroY }} className="relative z-10 flex flex-col items-center w-full max-w-5xl">
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-12"
          >
            <span className="text-[10px] font-black text-lime-400 tracking-[0.4em] uppercase border-b border-lime-400/20 pb-2">
              Architectural Intelligence Core
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-7xl md:text-9xl font-black tracking-tighter mb-12 leading-[0.85] uppercase"
          >
            The Knowledge Layer <br />
            <span className="text-white/20">for Software.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto mb-16 text-xl text-white/40 leading-relaxed font-medium"
          >
            A high-performance diagnostic engine that transforms complex repositories into structured, navigable archives. 
            Real-time analysis. Zero clutter.
          </motion.p>

          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-3xl relative"
          >
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none z-10">
              <Search className="h-5 w-5 text-white/20" />
            </div>
            <input 
              type="text"
              placeholder="Query repository index..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full h-20 bg-black border border-white/10 hover:border-white/30 focus:border-lime-400/50 pl-16 pr-8 text-lg transition-all placeholder:text-white/10 outline-none font-mono"
            />
            <div className="absolute inset-y-0 right-4 flex items-center">
               <div className="px-3 py-1 bg-white/5 border border-white/10 text-[9px] font-mono text-white/20 uppercase tracking-widest">
                 Press Enter
               </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Feature Grid */}
        <div className="w-full max-w-7xl mx-auto mt-64 grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 border border-white/5 relative z-10">
          {[
            { 
              icon: Globe, 
              title: "Universal Parsing", 
              desc: "Deep AST understanding for TypeScript, Python, and Go architectures." 
            },
            { 
              icon: ShieldCheck, 
              title: "Isolated Runtime", 
              desc: "Secure sandboxed execution environment for snippet verification." 
            },
            { 
              icon: Cpu, 
              title: "Semantic Index", 
              desc: "Vector-embedded knowledge graph mapping intent and dependency." 
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-black p-12 hover:bg-white/[0.02] transition-colors group"
            >
              <feature.icon className="w-6 h-6 text-lime-400 mb-8" />
              <h3 className="text-xs font-black mb-4 text-white uppercase tracking-[0.2em]">{feature.title}</h3>
              <p className="text-white/30 text-sm leading-relaxed font-medium">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Repositories */}
      <section className="max-w-7xl mx-auto px-12 py-64 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 border-b border-white/5 pb-12">
          <div>
            <h2 className="text-5xl font-black uppercase tracking-tighter mb-4">Trending Archives</h2>
            <p className="text-white/30 text-sm font-medium uppercase tracking-widest">Public knowledge bases indexed by the community.</p>
          </div>
          <button className="flex items-center gap-3 text-white/40 hover:text-lime-400 transition-colors text-[10px] font-black uppercase tracking-[0.2em] mt-8 md:mt-0">
            Internal Registry <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 border border-white/5">
          {featuredRepos.map((repo, idx) => (
            <motion.div 
              key={repo.name}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="group p-10 bg-black hover:bg-white/[0.02] transition-all cursor-pointer relative"
            >
              <div className="flex justify-between items-start mb-12">
                <h3 className="font-black text-2xl uppercase tracking-tighter">{repo.name}</h3>
                <div className="text-[10px] font-mono text-white/20 group-hover:text-lime-400 transition-colors uppercase">
                  {repo.icon}
                </div>
              </div>
              <p className="text-sm text-white/30 leading-relaxed mb-12 h-12 overflow-hidden font-medium">{repo.desc}</p>
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-mono text-white/10 uppercase tracking-widest">
                  Stars: {repo.stars}
                </div>
                <div className="w-2 h-2 rounded-full bg-white/5 group-hover:bg-lime-400 transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-12 py-64 flex flex-col items-center text-center relative z-10 border-t border-white/5 bg-[#030303]">
        <div className="max-w-4xl">
          <h2 className="text-6xl md:text-8xl font-black mb-12 tracking-tighter uppercase leading-[0.9]">
            Optimize your <br />
            <span className="text-white/20">mental model.</span>
          </h2>
          <p className="text-white/40 text-lg mb-16 max-w-xl mx-auto font-medium">
            Join the elite engineering teams using RepoLens to archive and navigate software complexity.
          </p>
          
          {!isPending && (
            <div className="flex flex-col items-center gap-6">
              {session ? (
                 <Link href="/dashboard">
                   <button className="bg-white text-black px-12 py-5 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-lime-400 transition-all active:scale-95">
                     Enter Command Center
                   </button>
                 </Link>
              ) : (
                 <HeroSignIn />
              )}
              <span className="text-[9px] font-mono text-white/10 uppercase tracking-[0.4em]">v2.0 Architectural Core</span>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black py-20 px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-4">
            <div className="w-6 h-6 bg-white/10 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5 text-white/40" />
            </div>
            <span className="font-black text-xs uppercase tracking-[0.3em] text-white/40">RepoLens</span>
          </div>
          <div className="flex gap-12 text-[10px] text-white/20 font-black uppercase tracking-[0.2em]">
            <a href="#" className="hover:text-white transition-colors">Docs</a>
            <a href="#" className="hover:text-white transition-colors">Protocol</a>
            <a href="#" className="hover:text-white transition-colors">Archive</a>
            <a href="#" className="hover:text-white transition-colors">Terminal</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
