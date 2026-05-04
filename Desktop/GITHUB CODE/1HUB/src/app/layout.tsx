import type { Metadata } from "next";
import { Inter, Cormorant_Garamond, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "1Hub | The Synergy Network",
  description: "A global ecosystem where professional excellence is verified through execution, not just presentation.",
  keywords: ["1Hub", "Synergy Network", "Professional Verification", "Case Study Heritage", "Mastery Levels"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorant.variable} ${mono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-[#0A0A0A] text-[#fafafa] selection:bg-[#475569]/30 selection:text-white font-sans">
        {children}
      </body>
    </html>
  );
}
