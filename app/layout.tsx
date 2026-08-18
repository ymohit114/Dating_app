import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import { AppLayoutWrapper } from '@/components/layout/AppLayoutWrapper';
import { DevToolsGuard } from '@/components/security/DevToolsGuard';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#09090b',
};

export const metadata: Metadata = {
  title: 'Elance — Intentional Dating & Meaningful Connections',
  description: 'Find real chemistry, verified profiles, and authentic relationships on Elance.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Elance Dating',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased font-sans bg-zinc-950 text-white min-h-screen selection:bg-rose-600 selection:text-white">
        <DevToolsGuard />
        <AuthProvider>
          <AppLayoutWrapper>{children}</AppLayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
