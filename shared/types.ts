export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface DemoItem {
  id: string;
  name: string;
  value: number;
}
export interface StealthOptions {
  ua?: string;
  delay?: number;
}
export type ProxyFormat = 'json' | 'raw';
export interface MinimalProxyResponse {
  url: string;
  title: string;
  contents: string;
  images: string[];
  links: string[];
  meta: {
    status: string;
    content_type: string;
    proxied_at: string;
  };
}