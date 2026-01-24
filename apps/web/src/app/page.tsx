'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { Zap, Shield, BarChart3, Github, Sparkles, GitBranch, Eye, LayoutDashboard } from 'lucide-react'
import { HeaderSignIn, HeroSignIn } from '@/components/HomeSignInButtons'
import { authClient } from '@/lib/auth-client'

const features = [
  { icon: Shield, title: 'Secure Analysis', desc: 'All repositories analyzed in isolated sandboxes with no code execution. Your code stays safe.' },
  { icon: BarChart3, title: 'Deep Insights', desc: 'Risk scoring, dependency graphs, complexity metrics, and tech debt detection all in one place.' },
  { icon: Sparkles, title: 'AI-Powered', desc: 'Natural language explanations based on deterministic analysis. Understand code like never before.' },
]

export default function HomePage() {
  const { data: session, isPending } = authClient.useSession()
  const featuresRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: featuresRef,
    offset: ["start end", "end end"]
  })

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern bg-[size:60px_60px] opacity-30" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-lime-400/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-lime-400/3 rounded-full blur-[100px]" />
      
      {/* Navigation */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 border-b border-white/[0.06]"
      >
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-lime-400 flex items-center justify-center">
              <Zap className="h-5 w-5 text-black" />
            </div>
            <span className="font-semibold text-lg text-white">RepoLens</span>
          </div>
          <div className="flex items-center gap-4">
            {!isPending && (
              <>
                {session ? (
                  <>
                    <Link href="/dashboard">
                      <button className="flex items-center gap-2 px-4 py-2 text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors text-sm font-medium">
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </button>
                    </Link>
                    <button 
                      onClick={() => authClient.signOut({
                        fetchOptions: {
                          onSuccess: () => {
                            window.location.reload()
                          }
                        }
                      })}
                      className="px-4 py-2 text-white/40 hover:text-red-400 transition-colors text-sm font-medium"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <HeaderSignIn />
                )}
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-6">
        <div className="max-w-5xl mx-auto min-h-[calc(100vh-80px)] flex flex-col justify-center">
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-center mb-8"
          >
            <div className="glass px-4 py-2 flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-lime-400" />
              <span className="text-white/70">AI-Powered Code Analysis</span>
            </div>
          </motion.div>
          
          {/* Headline */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center space-y-6 mb-12"
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] text-white">
              Understand Any Repository
              <br />
              <span className="text-lime-400">in Minutes, Not Days</span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
              RepoLens combines static analysis with AI-powered explanations to give you a complete
              understanding of any codebase through interactive visualizations.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex justify-center"
          >
            {!isPending && (
              <>
                {session ? (
                  <Link href="/dashboard">
                    <button className="group relative h-12 px-8 text-base font-semibold overflow-hidden bg-lime-400 text-black transition-all duration-300 hover:bg-lime-500 rounded-lg flex items-center gap-2">
                      Go to Dashboard
                      <LayoutDashboard className="w-5 h-5" />
                    </button>
                  </Link>
                ) : (
                  <HeroSignIn />
                )}
              </>
            )}
          </motion.div>
        </div>

        {/* Feature Cards Section - Sticky Scroll */}
        <div ref={featuresRef} style={{ height: '150vh' }}>
          <div className="sticky top-0 h-screen flex items-center justify-center">
            <div className="max-w-5xl mx-auto w-full">
              <div className="text-center mb-12">
                <p className="text-lime-400 text-sm font-medium mb-3 tracking-wide uppercase">Features</p>
                <h2 className="text-3xl md:text-4xl font-bold text-white">Everything You Need</h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {features.map((feature, i) => {
                  const start = 0.3 + (i * 0.15)
                  const end = start + 0.12
                  return (
                    <FeatureCard 
                      key={feature.title}
                      feature={feature}
                      scrollYProgress={scrollYProgress}
                      start={start}
                      end={end}
                    />
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="max-w-5xl mx-auto min-h-screen flex flex-col justify-center py-32 border-t border-white/[0.06]">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <p className="text-lime-400 text-sm font-medium mb-3 tracking-wide uppercase">How it works</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">From URL to Insights</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Github, step: '01', title: 'Paste Repository URL', desc: 'Enter any public GitHub repository URL to begin analysis' },
              { icon: GitBranch, step: '02', title: 'Automatic Analysis', desc: 'We parse AST, detect patterns, and compute metrics automatically' },
              { icon: Eye, step: '03', title: 'Explore Results', desc: 'Interactive visualizations and AI explanations at your fingertips' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 80 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.8 }}
                transition={{ duration: 0.7, delay: i * 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                className="text-center"
              >
                <div className="w-14 h-14 bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mx-auto mb-4 rounded-xl">
                  <item.icon className="h-7 w-7 text-white/70" />
                </div>
                <div className="text-lime-400 text-sm font-mono mb-2">{item.step}</div>
                <h3 className="font-semibold mb-2 text-white">{item.title}</h3>
                <p className="text-white/40 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/[0.06] py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/40">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-lime-400 flex items-center justify-center rounded">
                <Zap className="h-4 w-4 text-black" />
              </div>
              <span className="text-white font-medium">RepoLens</span>
            </div>
            <p>Built for developers who value understanding</p>
          </div>
        </footer>
      </main>
    </div>
  )
}

function FeatureCard({ 
  feature, 
  scrollYProgress, 
  start, 
  end 
}: { 
  feature: typeof features[0]
  scrollYProgress: any
  start: number
  end: number
}) {
  const opacity = useTransform(scrollYProgress, [start, end], [0, 1])
  const y = useTransform(scrollYProgress, [start, end], [150, 0])

  return (
    <motion.div
      style={{ opacity, y }}
      className="glass p-8 group h-full rounded-2xl border border-white/5 hover:border-white/10 transition-colors"
    >
      <div className="w-14 h-14 bg-lime-400/10 flex items-center justify-center mb-6 group-hover:bg-lime-400/20 transition-colors rounded-xl">
        <feature.icon className="h-7 w-7 text-lime-400" />
      </div>
      <h3 className="font-semibold text-xl mb-3 text-white">{feature.title}</h3>
      <p className="text-white/50 leading-relaxed">{feature.desc}</p>
    </motion.div>
  )
}