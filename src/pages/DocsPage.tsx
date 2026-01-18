import React from 'react';
import { CodeBlock } from '@/components/CodeBlock';
import { Zap, ArrowLeft, Layout, MousePointer2, Settings2, ShieldCheck, ChevronRight, ExternalLink, Ghost, Clock, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
export function DocsPage() {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const demoTarget = 'https://en.wikipedia.org/wiki/Cloudflare';
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans">
      <ThemeToggle />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12 space-y-20">
          <header className="space-y-6">
            <Link to="/">
              <Button variant="ghost" className="text-slate-400 hover:text-white -ml-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Zap className="w-8 h-8 text-indigo-500" />
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">API Documentation</h1>
              </div>
              <p className="text-xl text-slate-400 max-w-3xl leading-relaxed">
                FluxGate v2.1 provides high-performance, path-based routing. Each endpoint is optimized for specific data structures and edge speed.
              </p>
            </div>
          </header>
          <section id="stealth" className="space-y-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-500" /> Advanced Stealth Parameters
            </h2>
            <p className="text-slate-400 max-w-3xl">
              All endpoints support these optional query parameters to help bypass bot detection and simulate organic traffic patterns.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StealthCard 
                icon={<Ghost />} 
                title="ua (User-Agent)" 
                desc="Override or rotate the request browser identity. Defaults to a rotating set of 20+ modern profiles." 
              />
              <StealthCard 
                icon={<Clock />} 
                title="delay (Latency)" 
                desc="Introduce a server-side wait (0-10,000ms) with ±200ms jitter to simulate human browsing speed." 
              />
              <StealthCard 
                icon={<ExternalLink />} 
                title="referer" 
                desc="Spoof the source origin of the request to satisfy strict upstream referer-check policies." 
              />
            </div>
            <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-8 space-y-4">
              <div className="flex items-center gap-2 text-indigo-400 font-bold">
                <Shield className="w-5 h-5" />
                <span>Best Practice: Detection Evasion</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                For scraping sensitive targets, always use <code className="text-indigo-300">delay=500</code> and rotate your <code className="text-indigo-300">ua</code> strings. 
                FluxGate automatically spoofs your IP address using random X-Forwarded-For headers on every request to prevent rate-limiting at the origin.
              </p>
            </div>
          </section>
          <section id="endpoints" className="space-y-10">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <ChevronRight className="w-5 h-5 text-indigo-500" /> Core API Endpoints
            </h2>
            <div className="grid gap-12">
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h3 className="text-lg font-bold text-indigo-400">/api/proxy — Transparent Passthrough</h3>
                  <a href={`${origin}/api/proxy?url=${demoTarget}`} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="secondary" className="gap-2 text-xs">
                      <ExternalLink className="w-3.5 h-3.5" /> Try Live Demo
                    </Button>
                  </a>
                </div>
                <p className="text-slate-400">Directly pipes the upstream response with permissive CORS headers.</p>
                <CodeBlock
                  language="javascript"
                  code={`const url = new URL('${origin}/api/proxy');\nurl.searchParams.append('url', 'https://api.example.com/data');\nurl.searchParams.append('delay', '250');\n\nfetch(url.toString())\n  .then(res => res.blob());`}
                />
              </div>
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h3 className="text-lg font-bold text-indigo-400">/api/json — Metadata & Enrichment</h3>
                  <a href={`${origin}/api/json?url=${demoTarget}`} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="secondary" className="gap-2 text-xs">
                      <ExternalLink className="w-3.5 h-3.5" /> Try Live Demo
                    </Button>
                  </a>
                </div>
                <p className="text-slate-400">Returns parsed metadata including page title and asset arrays.</p>
                <CodeBlock
                  language="bash"
                  code={`curl "${origin}/api/json?url=https://wikipedia.org&ua=Mozilla/5.0&delay=100"`}
                />
              </div>
            </div>
          </section>
          <section id="reference" className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-indigo-500" /> Full Routing Reference
            </h2>
            <div className="overflow-x-auto border border-white/10 rounded-xl bg-slate-900/20">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-white/5 text-slate-300 font-bold uppercase text-[10px] tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Endpoint Path</th>
                    <th className="px-6 py-4">Required Params</th>
                    <th className="px-6 py-4">Optional Params</th>
                    <th className="px-6 py-4">Format</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-400">
                  <ReferenceRow path="/api/proxy" required="url" optional="ua, delay, referer" format="Raw Stream" />
                  <ReferenceRow path="/api/json" required="url" optional="ua, delay, referer" format="JSON Object" />
                  <ReferenceRow path="/api/text" required="url" optional="ua, delay, referer" format="JSON (Text)" />
                  <ReferenceRow path="/api/class" required="url, class" optional="ua, delay, referer" format="JSON (Array)" />
                  <ReferenceRow path="/api/id" required="url, id" optional="ua, delay, referer" format="JSON (Object)" />
                </tbody>
              </table>
            </div>
          </section>
          <footer className="pt-12 border-t border-white/5 text-center text-slate-600 text-xs tracking-widest uppercase">
            FluxGate Engine &bull; Edge-First Architecture &bull; v2.1
          </footer>
        </div>
      </div>
    </div>
  );
}
function StealthCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-6 bg-slate-900/40 border border-white/5 rounded-xl space-y-3">
      <div className="text-indigo-400">{icon}</div>
      <h3 className="font-bold text-slate-200">{title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}
function ReferenceRow({ path, required, optional, format }: { path: string, required: string, optional: string, format: string }) {
  return (
    <tr>
      <td className="px-6 py-4 font-mono text-indigo-400 font-bold">{path}</td>
      <td className="px-6 py-4 text-slate-300 font-mono text-xs">{required}</td>
      <td className="px-6 py-4 text-slate-500 italic text-xs">{optional}</td>
      <td className="px-6 py-4">{format}</td>
    </tr>
  );
}