import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Providers } from '@/components/providers';
import './globals.css';
import brandMark from '../../public/brand/cypress-mark.png';

const sans = localFont({
  src: './fonts/manrope-latin.woff2',
  variable: '--font-sans',
  display: 'swap',
  weight: '200 800',
  fallback: ['Inter', 'system-ui', 'sans-serif'],
});

const display = localFont({
  src: [
    { path: './fonts/fraunces-latin.woff2', style: 'normal', weight: '300 700' },
    { path: './fonts/fraunces-italic-latin.woff2', style: 'italic', weight: '300 700' },
  ],
  variable: '--font-display',
  display: 'swap',
  fallback: ['Georgia', 'serif'],
});

export const metadata: Metadata = {
  title: 'Cypress Property Management',
  description: 'Transparent property management, tenant coordination, rent tracking and maintenance services in Bengaluru.',
  icons: { icon: brandMark.src, apple: brandMark.src },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${display.variable}`}>
      <head>
        {/* Apply the saved theme before hydration to avoid a color flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('cpm-theme');if(['ocean','royal','sunset','teal','rose','indigo','gold','berry','slate'].includes(t))document.documentElement.setAttribute('data-theme',t);else document.documentElement.removeAttribute('data-theme')}catch(e){}`,
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
