'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Layers, 
  Globe,
  ShieldCheck,
  Cpu,
  ArrowRight,
  Terminal,
  Code2,
  GitFork,
  Activity,
  Zap,
  Box
} from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { HeaderSignIn, HeroSignIn } from '@/components/HomeSignInButtons'
import Hero3D from '@/components/landing/Hero3D'
import { HUDCard } from '@/components/ui/HUDCard'

const featuredRepos = [
  { name: 'gemini-cli', desc: 'Neural infrastructure for terminal-based intelligence protocols.', stars: '81.5k', icon: Terminal, tag: 'AI_CORE' },
  { name: 'react-kernel', desc: 'Atomic state synchronization for massive distributed interfaces.', stars: '240.3k', icon: Code2, tag: 'UX_SYSTEM' },
  { name: 'k8s-arch', desc: 'Cluster orchestration mapping and automated lifecycle indexing.', stars: '118.4k', icon: Globe, tag: 'INFRA' },
]

export default function HomePage() {
  const { data: session, isPending } = authClient.useSession()
  const [searchValue, setSearchValue] = useState('')
  
  const { scrollY } = useScroll()
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0])
  const heroScale = useTransform(scrollY, [0, 400], [1, 1.1])

  return (
    <div className="min-h-screen bg-black text-white selection:bg-lime-400/30 overflow-x-hidden font-sans">
      
      {/* 3D Background Layer - Greyscale & High Contrast */}
      <motion.div 
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="fixed inset-0 pointer-events-none z-0 grayscale contrast-125 brightness-50"
      >
        <Hero3D />
      </motion.div>

      {/* Premium Texture Overlay */}
      <div className="fixed inset-0 z-[1] bg-grid-pattern opacity-40 pointer-events-none" />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-24 flex items-center justify-between px-12 border-b border-white/10 bg-black/60 backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <div className="w-10 h-10 bg-white flex items-center justify-center group cursor-pointer hover:bg-lime-400 transition-colors duration-500">
            <Layers className="w-6 h-6 text-black" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-[0.4em] uppercase">RepoLens</span>
            <span className="text-[8px] font-mono text-white/30 tracking-[0.5em] uppercase pl-1">Architectural_Engine</span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-12">
           <div className="flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.4em] text-white/30">
              <a href="#capabilities" className="hover:text-white transition-all hover:tracking-[0.5em]">Capabilities</a>
              <a href="#registry" className="hover:text-white transition-all hover:tracking-[0.5em]">Registry</a>
              <a href="#vault" className="hover:text-white transition-all hover:tracking-[0.5em]">Access</a>
           </div>

          <div className="h-10 w-px bg-white/10 mx-4" />

          {!isPending && (
            <div className="flex items-center gap-6">
              {session ? (
                <Link href="/dashboard">
                  <button className="px-8 py-3 bg-white text-black text-[11px] font-black uppercase tracking-[0.4em] hover:bg-lime-400 transition-all shadow-[0_10px_30px_-10px_rgba(255,255,255,0.2)]">
                    Console_Access
                  </button>
                </Link>
              ) : (
                <HeaderSignIn />
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-12 z-10">
        <div className="max-w-7xl w-full flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12 inline-flex items-center gap-6 px-6 py-2 bg-white/[0.03] border border-white/10 backdrop-blur-md"
          >
            <Zap className="w-4 h-4 text-lime-400 animate-pulse" />
            <span className="text-[10px] font-black text-white tracking-[0.6em] uppercase">
              Operational_v2.0_Core
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
            className="text-7xl md:text-[10rem] font-black tracking-tighter mb-16 leading-[0.8] uppercase"
          >
            Synthesize <br />
            <span className="text-white/10 italic">Intelligence.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="max-w-2xl mx-auto mb-20 text-xl md:text-2xl text-white/40 leading-relaxed font-mono font-light tracking-tight"
          >
            A high-performance diagnostic layer that transforms complex repository architectures into structured, actionable intelligence.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col items-center gap-12 w-full max-w-3xl"
          >
            <div className="relative w-full group">
                <div className="absolute -inset-1 bg-lime-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl" />
                <div className="relative flex items-center bg-black/80 backdrop-blur-2xl border border-white/20 group-hover:border-lime-400 transition-all duration-500">
                    <div className="pl-8 pr-6 text-white/20 group-hover:text-lime-400 transition-colors">
                        <Search className="h-6 w-6" />
                    </div>
                    <input 
                        type="text"
                        placeholder="ENTER_REPOSITORY_PROTOCOL_URL..."
                        className="w-full h-20 bg-transparent text-lg text-white font-mono placeholder:text-white/5 outline-none tracking-widest uppercase"
                    />
                    <div className="pr-6">
                        <button className="px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-lime-400 transition-all">
                            Scan
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex gap-16 text-[9px] font-mono text-white/20 uppercase tracking-[0.4em]">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-lime-400" />
                    Neural_Handshake
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-lime-400" />
                    AST_Extraction
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-lime-400" />
                    Semantic_Mapping
                </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section id="capabilities" className="relative py-48 px-12 z-10 border-t border-white/10 bg-[#020202]">
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col mb-32">
                <span className="text-[11px] font-black text-lime-400 tracking-[0.8em] uppercase mb-6">Protocols</span>
                <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter">System_Capabilities</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
                { 
                icon: Globe, 
                title: "Global Analysis", 
                desc: "Universal AST parsing for high-fidelity architectural understanding across all major languages.",
                code: "PARSE_01"
                },
                { 
                icon: ShieldCheck, 
                title: "Safe Execution", 
                desc: "Isolated Docker runtime protocols for secure logic verification and dynamic analysis.",
                code: "SANDBOX_02"
                },
                { 
                icon: Cpu, 
                title: "Neural Memory", 
                desc: "Deep vector-embedded knowledge graph mapping intent and dependency structures.",
                code: "VECTOR_03"
                }
            ].map((feature, i) => (
                <HUDCard key={i} className="border-white/5 bg-black hover:bg-white/[0.01] transition-all" title={feature.code}>
                    <feature.icon className="w-10 h-10 text-lime-400 mb-10" />
                    <h3 className="text-2xl font-black mb-6 text-white uppercase tracking-tight">{feature.title}</h3>
                    <p className="text-white/30 text-base leading-relaxed font-mono mb-12 h-24 overflow-hidden">{feature.desc}</p>
                    <div className="flex items-center justify-between text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">
                        <span>Status: Operational</span>
                        <Activity className="w-3 h-3" />
                    </div>
                </HUDCard>
            ))}
            </div>
        </div>
      </section>

      {/* Registry Section */}
      <section id="registry" className="relative py-48 px-12 z-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-32 gap-12">
                <div>
                    <span className="text-[11px] font-black text-lime-400 tracking-[0.8em] uppercase mb-6">Archive</span>
                    <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter">Public_Registry</h2>
                </div>
                <button className="flex items-center gap-6 px-10 py-5 border border-white/10 hover:border-lime-400 text-white hover:text-lime-400 transition-all text-[11px] font-black uppercase tracking-[0.4em] group">
                    View_All_Archives <ArrowRight className="w-5 h-5 group-hover:translate-x-3 transition-transform duration-500" />
                </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {featuredRepos.map((repo, idx) => (
                <HUDCard key={idx} className="group cursor-pointer bg-white/[0.01] border-white/5" noPadding>
                    <div className="p-10 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-12">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-mono text-lime-400/50 uppercase tracking-widest mb-2">{repo.tag}</span>
                                <h3 className="font-black text-3xl uppercase tracking-tighter group-hover:text-lime-400 transition-colors">{repo.name}</h3>
                            </div>
                            <repo.icon className="w-6 h-6 text-white/10 group-hover:text-white transition-colors" />
                        </div>
                        <p className="text-base text-white/30 leading-relaxed mb-12 font-mono h-20 overflow-hidden border-l-2 border-white/5 pl-6">{repo.desc}</p>
                        
                        <div className="mt-auto pt-8 border-t border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <GitFork className="w-4 h-4 text-white/10" />
                                <span className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">Stars: {repo.stars}</span>
                            </div>
                            <div className="w-2 h-2 rounded-none bg-white/20 group-hover:bg-lime-400 transition-all duration-700 group-hover:scale-150 group-hover:rotate-45" />
                        </div>
                    </div>
                </HUDCard>
            ))}
            </div>
        </div>
      </section>

      {/* Access Section */}
      <section id="vault" className="relative py-64 px-12 z-10 bg-[#030303] border-t border-white/10">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="w-24 h-24 border border-white/10 flex items-center justify-center mb-16 relative group"
          >
             <div className="absolute inset-[-20px] border border-white/5 rotate-45 group-hover:rotate-90 transition-transform duration-1000" />
             <ShieldCheck className="w-10 h-10 text-white group-hover:text-lime-400 transition-colors" />
          </motion.div>
            
          <h2 className="text-6xl md:text-[8rem] font-black mb-16 tracking-tighter uppercase leading-[0.85] relative">
            Secure <br />
            <span className="text-white/10 italic">Intelligence.</span>
          </h2>
          <p className="text-white/30 text-xl md:text-2xl mb-24 max-w-2xl mx-auto font-mono font-light tracking-tight">
            Join elite architectural teams indexing the future of software complexity. Secure, isolated, neural.
          </p>
          
          {!isPending && (
            <div className="flex flex-col items-center gap-10">
              {session ? (
                 <Link href="/dashboard">
                   <button className="bg-white text-black px-16 py-6 text-[12px] font-black uppercase tracking-[0.5em] hover:bg-lime-400 hover:shadow-[0_0_50px_-10px_#a3e635] transition-all active:scale-95">
                     Enter_Command_Center
                   </button>
                 </Link>
              ) : (
                 <HeroSignIn />
              )}
              <div className="flex items-center gap-8 text-[9px] font-mono text-white/20 uppercase tracking-[0.5em]">
                <span>Build: 2.2.0</span>
                <div className="w-1 h-1 bg-white/20" />
                <span>Status: Verified</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black py-32 px-12 z-20 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-24">
          <div className="col-span-2">
            <div className="flex items-center gap-6 mb-12">
                <div className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center">
                    <Layers className="w-5 h-5 text-white" />
                </div>
                <span className="font-black text-2xl uppercase tracking-[0.4em] text-white">RepoLens</span>
            </div>
            <p className="text-white/20 text-sm font-mono max-w-sm leading-relaxed mb-12 uppercase tracking-widest">
                The Interactive Architectural Operating System for modern software engineering teams.
            </p>
            <div className="flex gap-8">
                <div className="w-10 h-10 border border-white/5 flex items-center justify-center hover:border-white/20 transition-colors cursor-pointer"><Box className="w-4 h-4 text-white/20" /></div>
                <div className="w-10 h-10 border border-white/5 flex items-center justify-center hover:border-white/20 transition-colors cursor-pointer"><Activity className="w-4 h-4 text-white/20" /></div>
                <div className="w-10 h-10 border border-white/5 flex items-center justify-center hover:border-white/20 transition-colors cursor-pointer"><Zap className="w-4 h-4 text-white/20" /></div>
            </div>
          </div>
          
          <div className="flex flex-col gap-8">
            <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Navigation</span>
            <div className="flex flex-col gap-4 text-[11px] font-mono text-white/30 uppercase tracking-widest">
                <a href="#" className="hover:text-lime-400 transition-colors">Documentation</a>
                <a href="#" className="hover:text-lime-400 transition-colors">Protocol_List</a>
                <a href="#" className="hover:text-lime-400 transition-colors">Core_Archive</a>
                <a href="#" className="hover:text-lime-400 transition-colors">Systems_Map</a>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Protocol</span>
            <div className="flex flex-col gap-4 text-[11px] font-mono text-white/30 uppercase tracking-widest">
                <a href="#" className="hover:text-lime-400 transition-colors">Security</a>
                <a href="#" className="hover:text-lime-400 transition-colors">API_Reference</a>
                <a href="#" className="hover:text-lime-400 transition-colors">Handshake_V2</a>
                <a href="#" className="hover:text-lime-400 transition-colors">Neural_Sync</a>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-32 pt-12 border-t border-white/5 flex justify-between items-center">
            <span className="text-[9px] font-mono text-white/10 uppercase tracking-[0.5em]">© 2026 ARCHITECTURAL_ARCHIVE_VAULT</span>
            <span className="text-[9px] font-mono text-white/10 uppercase tracking-[0.5em]">SHARP_GEOMETRY_ACTIVE</span>
        </div>
      </footer>
    </div>
  )
}
