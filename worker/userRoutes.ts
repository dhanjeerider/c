import { Hono } from "hono";
import { Env } from './core-utils';
import type { MinimalProxyResponse } from '@shared/types';
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0"
];
function getRandomIPv4() {
  return Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.');
}
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/proxy', async (c) => {
    const targetUrlStr = c.req.query('url');
    const format = c.req.query('format') || 'json';
    const delay = parseInt(c.req.query('delay') || '0');
    const customUa = c.req.query('ua');
    if (!targetUrlStr) {
      return c.json({ success: false, error: 'URL parameter is required' }, 400);
    }
    if (delay > 0) {
      await sleep(Math.min(delay, 5000));
    }
    try {
      const decodedUrl = decodeURIComponent(targetUrlStr).trim();
      const finalUrl = decodedUrl.startsWith('http') ? decodedUrl : `https://${decodedUrl}`;
      const url = new URL(finalUrl);
      const ua = customUa || USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
      const response = await fetch(url.toString(), {
        headers: {
          "User-Agent": ua,
          "X-Forwarded-For": getRandomIPv4(),
          "Accept": "*/*"
        },
        redirect: 'follow'
      });
      const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "X-Proxied-By": "FluxGate-Production"
      };
      // Handle RAW mode (Streaming/Passthrough)
      if (format === 'raw') {
        const headers = new Headers(response.headers);
        Object.entries(corsHeaders).forEach(([k, v]) => headers.set(k, v));
        // Comprehensive Security Header Strip for Browser Display
        headers.delete('content-security-policy');
        headers.delete('content-security-policy-report-only');
        headers.delete('x-frame-options');
        headers.delete('x-content-type-options');
        headers.delete('strict-transport-security');
        headers.delete('report-to');
        return new Response(response.body, { 
          status: response.status, 
          headers 
        });
      }
      // Handle JSON Extraction Mode
      const body = await response.text();
      const titleMatch = body.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      const imageMatches = [...body.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)];
      const linkMatches = [...body.matchAll(/<a[^>]+href=["']([^"']+)["']/gi)];
      const result: MinimalProxyResponse = {
        url: url.toString(),
        title: titleMatch ? titleMatch[1].trim() : '',
        contents: body,
        images: Array.from(new Set(imageMatches.map(m => m[1]))).slice(0, 25),
        links: Array.from(new Set(linkMatches.map(m => m[1]))).slice(0, 25),
        meta: {
          status: response.status.toString(),
          content_type: response.headers.get('content-type') || 'text/plain',
          proxied_at: new Date().toISOString()
        }
      };
      return c.json({ success: true, data: result }, { headers: corsHeaders });
    } catch (e) {
      console.error(`[PROXY ERROR] ${e}`);
      return c.json({ success: false, error: 'Proxy request failed', detail: String(e) }, 500);
    }
  });
}