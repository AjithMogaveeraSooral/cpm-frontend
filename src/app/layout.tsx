import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import './globals.css';
import brandMark from '../../public/brand/cypress-mark.png';

export const metadata: Metadata = {
  title: 'Cypress Property Management',
  description: 'Transparent property management, tenant coordination, rent tracking and maintenance services in Bengaluru.',
  icons: { icon: brandMark.src, apple: brandMark.src },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
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
