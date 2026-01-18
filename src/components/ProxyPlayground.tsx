import React, { useState, useEffect, useCallback } from 'react';
import { Send, Loader2, Globe, Terminal, MousePointer2, Zap, Copy, ExternalLink, Check, Download, ChevronRight, ShieldCheck, Clock, Ghost, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CodeBlock } from '@/components/CodeBlock';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { ApiResponse, ProxyResponse, ProxyFormat } from '@shared/types';
type PlaygroundEndpoint = 'proxy' | ProxyFormat;
const LOADING_STEPS = [
  "Waking up edge node...",
  "Routing request to closest POP...",
  "Intercepting upstream headers...",
  "Parsing DOM structures...",
  "Applying extraction rules...",
  "Streaming response back..."
];
export function ProxyPlayground() {
  const [url, setUrl] = useState('https://en.wikipedia.org/wiki/Cloudflare');
  const [endpoint, setEndpoint] = useState<PlaygroundEndpoint>('proxy');
  const [selector, setSelector] = useState('');
  // Stealth States
  const [ua, setUa] = useState('auto');
  const [delay, setDelay] = useState<number>(0);
  const [referer, setReferer] = useState('');
  const [isStealthOpen, setIsStealthOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<ProxyResponse | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  useEffect(() => {
    let interval: number | undefined;
    if (loading) {
      interval = window.setInterval(() => {
        setLoadingStep(prev => (prev + 1) % LOADING_STEPS.length);
      }, 800);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading]);
  const getFullApiUrl = useCallback(() => {
    const origin = window.location.origin.replace(/\/$/, '');
    const params = new URLSearchParams();
    params.append('url', url);
    if (endpoint === 'class' && selector) params.append('class', selector);
    if (endpoint === 'id' && selector) params.append('id', selector);
    // Add stealth params if non-default
    if (ua !== 'auto') params.append('ua', ua);
    if (delay > 0) params.append('delay', delay.toString());
    if (referer) params.append('referer', referer);
    return `${origin}/api/${endpoint}?${params.toString()}`;
  }, [url, endpoint, selector, ua, delay, referer]);
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getFullApiUrl());
      setCopiedLink(true);
      toast.success('Direct API link copied');
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };
  const handleCopyCurl = async () => {
    const curl = `curl "${getFullApiUrl()}"`;
    try {
      await navigator.clipboard.writeText(curl);
      setCopiedCurl(true);
      toast.success('cURL command copied');
      setTimeout(() => setCopiedCurl(false), 2000);
    } catch (err) {
      toast.error('Failed to copy cURL');
    }
  };
  const handleCopyJson = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      setCopiedJson(true);
      toast.success('Response JSON copied');
      setTimeout(() => setCopiedJson(false), 2000);
    } catch (err) {
      toast.error('Failed to copy JSON');
    }
  };
  const handleTest = async () => {
    if (!url) {
      toast.error('Enter a target URL');
      return;
    }
    setLoading(true);
    setLoadingStep(0);
    setResult(null);
    const startTimestamp = performance.now();
    try {
      const apiUrl = getFullApiUrl();
      const res = await fetch(apiUrl);
      const contentType = res.headers.get('content-type') || '';
      const clientLatency = Math.round(performance.now() - startTimestamp);
      if (contentType.includes('application/json')) {
        const data = await res.json() as ApiResponse<ProxyResponse>;
        if (data.success && data.data) {
          setResult({
            ...data.data,
            status: { ...data.data.status, response_time_ms: clientLatency }
          });
        } else {
          toast.error(data.error || 'Request failed');
        }
      } else {
        const text = await res.text();
        setResult({
          url,
          format: 'default',
          contents: text,
          status: {
            url,
            content_type: contentType,
            http_code: res.status,
            response_time_ms: clientLatency
          }
        });
      }
    } catch (err) {
      toast.error('Connection failed. Check your target URL.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const getCodeSnippet = () => {
    const origin = window.location.origin.replace(/\/$/, '');
    let extraParams = '';
    if (ua !== 'auto') extraParams += `&ua=${ua}`;
    if (delay > 0) extraParams += `&delay=${delay}`;
    if (referer) extraParams += `&referer=${encodeURIComponent(referer)}`;
    return `/**\n * FluxGate Edge Proxy Implementation\n * High-performance ${endpoint} extraction\n */\nconst target = encodeURIComponent('${url}');\nconst fluxGateUrl = \`${origin}/api/${endpoint}?url=\${target}${(endpoint === 'class' || endpoint === 'id') ? `&${endpoint}=${selector}` : ''}${extraParams}\`;\n\nfetch(fluxGateUrl)\n  .then(res => ${endpoint === 'proxy' ? 'res.text()' : 'res.json()'})\n  .then(data => {\n    console.log('FluxGate Success:', data);\n  })\n  .catch(err => console.error('FluxGate Proxy Error:', err));`;
  };
  const getOutputCode = () => {
    if (!result) return '';
    if (endpoint === 'proxy') return result.contents || '';
    const { contents, ...display } = result;
    return JSON.stringify(display, null, 2);
  };
  return (
    <div className="w-full bg-slate-900/30 border border-white/10 rounded-xl overflow-hidden shadow-2xl transition-all duration-500">
      <div className="p-6 md:p-8 space-y-6 border-b border-white/5 bg-slate-900/40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-4 space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Target URL</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="bg-slate-950 border-white/10 h-12 pl-10 focus:ring-indigo-500/50"
              />
            </div>
          </div>
          <div className="lg:col-span-3 space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Endpoint Mode</label>
            <Select value={endpoint} onValueChange={(v) => setEndpoint(v as PlaygroundEndpoint)}>
              <SelectTrigger className="bg-slate-950 border-white/10 h-12 font-mono text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="proxy">Raw Streaming</SelectItem>
                <SelectItem value="json">Full Metadata</SelectItem>
                <SelectItem value="html">HTML Extraction</SelectItem>
                <SelectItem value="text">Clean Text</SelectItem>
                <SelectItem value="images">Image Assets</SelectItem>
                <SelectItem value="videos">Video Assets</SelectItem>
                <SelectItem value="links">Link Graph</SelectItem>
                <SelectItem value="class">Class Selector</SelectItem>
                <SelectItem value="id">ID Selector</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(endpoint === 'class' || endpoint === 'id') && (
            <div className="lg:col-span-2 space-y-2 animate-in fade-in slide-in-from-left-2 duration-300">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">
                {endpoint === 'class' ? 'CSS Class' : 'Element ID'}
              </label>
              <div className="relative">
                <MousePointer2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <Input value={selector} onChange={(e) => setSelector(e.target.value)} placeholder={endpoint === 'class' ? "article-content" : "main"} className="bg-slate-950 border-white/10 h-12 pl-9" />
              </div>
            </div>
          )}
          <div className={cn("space-y-2 flex gap-2 items-end", (endpoint === 'class' || endpoint === 'id') ? "lg:col-span-3" : "lg:col-span-5")}>
            <Button onClick={handleTest} disabled={loading} className="flex-1 bg-indigo-600 hover:bg-indigo-700 h-12 font-bold shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2 fill-current" />}
              {loading ? 'Fetching...' : 'Proxy Request'}
            </Button>
            <div className="flex gap-1.5">
              <Button variant="outline" size="icon" className="h-12 w-12 border-white/10 bg-slate-950 hover:bg-white/5" onClick={handleCopyLink} title="Copy direct link">
                {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Button variant="outline" size="icon" className="h-12 w-12 border-white/10 bg-slate-950 hover:bg-white/5" onClick={handleCopyCurl} title="Copy as cURL">
                {copiedCurl ? <Check className="w-4 h-4 text-emerald-500" /> : <Terminal className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
        {/* Stealth Controls */}
        <Collapsible open={isStealthOpen} onOpenChange={setIsStealthOpen} className="bg-slate-950/40 border border-white/5 rounded-lg overflow-hidden transition-all">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
                Stealth & Anti-Detection
                {(ua !== 'auto' || delay > 0 || referer) && (
                  <span className="ml-2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </div>
              <ChevronDown className={cn("w-4 h-4 transition-transform", isStealthOpen && "rotate-180")} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 border-t border-white/5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Ghost className="w-3 h-3" /> User-Agent Profile
                </label>
                <Select value={ua} onValueChange={setUa}>
                  <SelectTrigger className="bg-slate-950 border-white/10 h-10 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto-Rotate (Random)</SelectItem>
                    <SelectItem value="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36">Chrome Desktop</SelectItem>
                    <SelectItem value="Mozilla/5.0 (iPhone; CPU iPhone OS 17_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Mobile/15E148 Safari/604.1">Safari Mobile</SelectItem>
                    <SelectItem value="Mozilla/5.0 (Macintosh; Intel Mac OS X 14_3_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Safari/605.1.15">Safari Desktop</SelectItem>
                    <SelectItem value="Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0">Firefox Desktop</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Clock className="w-3 h-3" /> Network Delay (ms)
                </label>
                <Input 
                  type="number" 
                  value={delay} 
                  onChange={(e) => setDelay(Number(e.target.value))} 
                  min={0} 
                  max={10000} 
                  className="bg-slate-950 border-white/10 h-10 text-xs" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <ExternalLink className="w-3 h-3" /> Custom Referer
                </label>
                <Input 
                  value={referer} 
                  onChange={(e) => setReferer(e.target.value)} 
                  placeholder="https://google.com" 
                  className="bg-slate-950 border-white/10 h-10 text-xs" 
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
      <div className="p-6 bg-slate-950/50">
        <Tabs defaultValue="output" className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-slate-900/80 border border-white/5 p-1">
              <TabsTrigger value="output" className="px-6 py-2 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">Response</TabsTrigger>
              <TabsTrigger value="code" className="px-6 py-2 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">Snippet</TabsTrigger>
            </TabsList>
            {result && (
              <Button variant="ghost" size="sm" onClick={handleCopyJson} className="text-slate-500 hover:text-indigo-400 gap-2">
                {copiedJson ? <Check className="w-3 h-3" /> : <Download className="w-3 h-3" />}
                <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Copy JSON</span>
              </Button>
            )}
          </div>
          <TabsContent value="output" className="min-h-[400px] outline-none">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-slate-500">
                <div className="relative mb-6">
                  <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
                  <div className="absolute inset-0 bg-indigo-500/20 blur-xl animate-pulse" />
                </div>
                <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest animate-pulse">
                  <ChevronRight className="w-3 h-3 text-indigo-400" />
                  {LOADING_STEPS[loadingStep]}
                </div>
              </div>
            ) : result ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex flex-wrap gap-2">
                  <Badge label="Endpoint" val={`/api/${endpoint}`} />
                  <Badge label="Status" val={result.status.http_code} variant={result.status.http_code >= 400 ? 'error' : 'success'} />
                  <Badge
                    label="Latency"
                    val={`${result.status.response_time_ms}ms`}
                    variant={result.status.response_time_ms < 200 ? 'success' : result.status.response_time_ms < 600 ? 'default' : 'error'}
                  />
                  {result.status.stealth_active && <Badge label="Stealth" val="Active" variant="success" />}
                </div>
                <CodeBlock language={endpoint === 'proxy' ? 'html' : 'json'} code={getOutputCode()} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-slate-600 border-2 border-dashed border-white/5 rounded-xl">
                <Terminal className="w-12 h-12 opacity-10 mb-4" />
                <p className="text-sm font-medium opacity-40">Ready to proxy. Paste a target URL and hit Request.</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="code" className="outline-none">
            <div className="space-y-4">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-widest px-1">Implementation Guide</p>
              <CodeBlock language="javascript" code={getCodeSnippet()} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
function Badge({ label, val, variant = 'default' }: { label: string, val: string | number, variant?: 'default' | 'success' | 'error' }) {
  const styles = {
    default: "bg-white/5 border-white/10 text-indigo-400",
    success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    error: "bg-red-500/10 border-red-500/20 text-red-400"
  };
  return (
    <div className={cn("px-4 py-2 border rounded-md flex items-center gap-3 transition-colors", styles[variant])}>
      <span className="text-[9px] font-medium opacity-60 uppercase tracking-widest shrink-0">{label}</span>
      <span className="text-xs font-mono font-bold truncate max-w-[150px]">{val}</span>
    </div>
  );
}