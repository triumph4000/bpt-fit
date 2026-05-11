import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BPT Fit — Bridgepointe Research Engine",
  description: "Research prospects and generate personalized Bridgepointe recommendations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header style={{
          backgroundColor: '#003B5C',
          padding: '16px 0',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }}>
          <div className="bpt-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <a href="/" style={{ display: 'flex', alignItems: 'center' }}>
              <img
                src="/images/bpt_logo_white.png"
                alt="Bridgepointe Technologies"
                style={{ height: '48px', width: 'auto' }}
              />
            </a>
            <span style={{
              color: '#17C662',
              fontFamily: 'Mulish, sans-serif',
              fontWeight: 700,
              fontSize: '1.1rem',
              letterSpacing: '0.05em',
            }}>
              BPT Fit — Prospect Research Engine
            </span>
          </div>
        </header>
        <main style={{ minHeight: 'calc(100vh - 80px)' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
