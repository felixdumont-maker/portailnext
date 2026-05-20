import type { NextConfig } from 'next';

const SECURITY_HEADERS = [
  { key: 'X-Frame-Options',           value: 'DENY' },
  { key: 'X-Content-Type-Options',    value: 'nosniff' },
  { key: 'X-DNS-Prefetch-Control',    value: 'on' },
  { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
]

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.10.10'],
  experimental: {
    // Augmenter la limite pour les uploads d'assets (images, zips) via le proxy Flask
    middlewareClientMaxBodySize: 52428800, // 50MB
  },
  images: {
    // Images optimisées par défaut (WebP, lazy loading automatique)
    // Si des images viennent de domaines externes (Flask/Drive), ajouter dans remotePatterns
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'drive.google.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  async headers() {
    return [{ source: '/(.*)', headers: SECURITY_HEADERS }]
  },
  async redirects() {
    return [
      {
        source: '/projet/:id/identite',
        destination: '/projet/:id/identite-visuelle',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:18000/api/:path*',
      },
      {
        source: '/r/:code',
        destination: 'http://127.0.0.1:18000/r/:code',
      },
      // Flask sub-routes still needed (zip download, etc.)
      {
        source: '/projet/:id/identite/:path*',
        destination: 'http://127.0.0.1:18000/projet/:id/identite/:path*',
      },
      // Outils — URLs courtes
      {
        source: '/outils/social',
        destination: '/tools/royal-design-system/ui_kits/social/cocktail.html',
      },
      {
        source: '/outils/pdf',
        destination: '/tools/royal-design-system/ui_kits/pdf_generator/index.html',
      },
    ];
  },
};

export default nextConfig;
