import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/navigation";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "FinDev Tracker - Command Center Tài Chính",
  description:
    "Hệ thống quản lý tài chính cá nhân với gamification - Theo dõi thu chi, nợ, và đầu tư",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${ibmPlexSans.variable} font-sans antialiased`}>
        <div className="flex min-h-screen">
          <Navigation />
          <main className="flex-1 pb-20 lg:pb-0 lg:pl-64">
            <div className="mx-auto max-w-6xl px-4 py-6 lg:px-8 lg:py-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
