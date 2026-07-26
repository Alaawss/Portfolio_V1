import type { Metadata } from 'next';
import { Special_Gothic_Expanded_One, Cormorant_Unicase, Elms_Sans } from 'next/font/google';
import './globals.css';

const specialGothic = Special_Gothic_Expanded_One({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-special-gothic',
  display: 'swap',
});

const cormorant = Cormorant_Unicase({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-cormorant',
  display: 'swap',
});

const elms = Elms_Sans({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-elms',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Alaa ESSAHIH | Developer Portfolio',
  description: 'Personal developer portfolio of Alaa ESSAHIH — Software Developer',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${specialGothic.variable} ${cormorant.variable} ${elms.variable} antialiased`}
    >
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
