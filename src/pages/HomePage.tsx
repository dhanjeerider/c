import React, { useState } from 'react';
import { Copy, Check, Globe, Zap, Shield, Server, Terminal, Github, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
export function HomePage() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [stealth, setStealth] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };
  const handleProxy = async (mode: 'raw' | 'json') => {
    if (!url) return;
    setLoading(true);
    const targetBase = `${window.location.origin}/api/proxy?url=${encodeURIComponent(url)}`;
    const finalUrl = stealth ? `${targetBase}&delay=500` : targetBase;
    if (mode === 'raw') {
      window.open(`${finalUrl}&format=raw`, '_blank');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${finalUrl}&format=json`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ success: false, error: 'Failed to fetch proxy data', detail: String(err) });
    } finally {
      setLoading(false);
    }
  };
  const integrationSnippet = `// Production-ready FluxGate Integration
fetch('${window.location.origin}/api/proxy?url=${encodeURIComponent(url || 'https://api.github.com')}')
  .then(res => res.json())
  .then(response => {
    if (response.success) {
      console.log('Title:', response.data.title);
      console.log('Body:', response.data.contents);
    }
  });`;
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-12 lg:py-16 space-y-12 font-sans text-slate-900 dark:text-slate-100">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Shield className="text-white h-6 w-6" />
              </div>
              <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-blue-500">FluxGate</h1>
            </div>
            <p className="text-slate-500 text-lg font-medium">Ultra-fast CORS bridge at the edge.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
              EDGE ACTIVE
            </div>
            <div className="flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
              <Zap className="w-3 h-3 mr-1.5" />
              GLOBAL MESH
            </div>
          </div>
        </header>
        {/* Interactive Playground */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Target Endpoint</label>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono">ENCODE_REQUIRED</span>
                </div>
                <input
                  type="text"
                  placeholder="https://api.example.com/data"
                  className="w-full p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-base shadow-sm focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 font-mono"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <button
                  onClick={() => handleProxy('json')}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 active:scale-95 disabled:opacity-50 transition-all shadow-lg shadow-indigo-600/20"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Terminal className="w-5 h-5" />}
                  JSON API
                </button>
                <button
                  onClick={() => handleProxy('raw')}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-6 py-4 border-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 disabled:opacity-50 transition-all"
                >
                  <Globe className="w-5 h-5" />
                  RAW HTML
                </button>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={stealth}
                    onChange={(e) => setStealth(e.target.checked)}
                    className="h-5 w-5 rounded-lg border-2 border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
                  />
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-500 transition-colors">Stealth Mode</span>
                    <p className="text-xs text-slate-400">Rotate User-Agents and add network jitter</p>
                  </div>
                </label>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-500" /> Implementation
              </h3>
              <div className="relative group">
                <pre className="text-xs font-mono p-4 bg-slate-950 text-slate-300 rounded-xl overflow-x-auto leading-relaxed border border-slate-800">
                  <code>{integrationSnippet}</code>
                </pre>
                <button
                  onClick={() => copyToClipboard(integrationSnippet, 'snippet')}
                  className="absolute top-3 right-3 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                >
                  {copied === 'snippet' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-col bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden min-h-[500px]">
            <div className="px-5 py-4 bg-slate-800/50 flex items-center justify-between border-b border-slate-800/50">
              <div className="flex items-center gap-4">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-slate-700" />
                  <div className="w-3 h-3 rounded-full bg-slate-700" />
                  <div className="w-3 h-3 rounded-full bg-slate-700" />
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Debugger Output</span>
              </div>
              {result && (
                <button
                  onClick={() => copyToClipboard(JSON.stringify(result, null, 2), 'result')}
                  className="p-1.5 hover:bg-slate-700 rounded text-slate-400 transition-colors"
                >
                  {copied === 'result' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              )}
            </div>
            <div className="flex-1 p-6 overflow-auto custom-scrollbar font-mono text-sm">
              {result ? (
                <div className="space-y-1">
                  {Object.entries(result).map(([key, val]) => (
                    <div key={key} className="animate-in fade-in slide-in-from-left-1">
                      <span className="text-indigo-400">"{key}"</span>: {typeof val === 'object' ? (
                        <pre className="mt-1 ml-4 text-slate-300">{JSON.stringify(val, null, 2)}</pre>
                      ) : (
                        <span className={cn(typeof val === 'string' ? "text-amber-200" : "text-emerald-400")}>
                          {JSON.stringify(val)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                    <ExternalLink className="w-6 h-6 opacity-20" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest max-w-[200px]">
                    Waiting for incoming request...
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
        {/* Documentation / Capabilities */}
        <section className="pt-12 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h4 className="font-bold flex items-center gap-2 text-indigo-500">
              <Shield className="w-5 h-5" /> Security First
            </h4>
            <p className="text-sm text-slate-500 leading-relaxed">
              We automatically strip <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">CSP</code>, 
              <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">X-Frame-Options</code>, and 
              HSTS headers to ensure resources can be embedded anywhere.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold flex items-center gap-2 text-blue-500">
              <Zap className="w-5 h-5" /> Multi-Format
            </h4>
            <p className="text-sm text-slate-500 leading-relaxed">
              Switch between <span className="font-bold">JSON Extraction</span> for programmatic use or <span className="font-bold">Raw Passthrough</span> for assets and full page renders.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold flex items-center gap-2 text-emerald-500">
              <Server className="w-5 h-5" /> IPv4 Spoofing
            </h4>
            <p className="text-sm text-slate-500 leading-relaxed">
              Every request includes rotated <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">X-Forwarded-For</code> headers to mimic distributed traffic patterns.
            </p>
          </div>
        </section>
        {/* Footer */}
        <footer className="pt-12 border-t border-slate-200 dark:border-slate-800 text-center space-y-4">
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            FluxGate is an open-source high-performance bridge built on Cloudflare Workers. 
            Ideal for bypasses, scraping, and cross-origin resource sharing.
          </p>
          <div className="flex items-center justify-center gap-6 text-slate-300 dark:text-slate-700">
            <Github className="w-5 h-5 hover:text-indigo-500 transition-colors cursor-pointer" />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase">Built for Performance • 2025</span>
          </div>
        </footer>
      </div>
    </div>
  );
}