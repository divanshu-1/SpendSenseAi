import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Inter, Lexend } from 'next/font/google'
import { SessionProvider } from 'next-auth/react'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans'
})

const lexend = Lexend({
  subsets: ['latin'],
  variable: '--font-lexend'
})


export const metadata: Metadata = {
  title: 'SpendSense AI',
  description: 'Smarter Spending, Better Saving.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${lexend.variable} font-sans antialiased min-h-screen bg-background`}>
        <SessionProvider>
          <div className="relative flex min-h-dvh flex-col bg-background">
            <main className="flex-1">{children}</main>
          </div>
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
