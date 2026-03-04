import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/hooks/use-auth';
import { VisitorRoleSwitcher } from '@/components/visitor-role-switcher';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'LiveShop | Live Stream Shopping Marketplace',
  description: 'Experience the future of shopping with live video feeds, real-time interaction, and instant purchases.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased bg-zinc-50 text-zinc-900 pb-24" suppressHydrationWarning>
        <AuthProvider>
          {children}
          <VisitorRoleSwitcher />
        </AuthProvider>
      </body>
    </html>
  );
}
