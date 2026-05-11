'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface HistoryItem {
  domain: string;
  companyName: string;
  searchedAt: string;
}

export default function Home() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('bpt-search-history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  function extractDomain(input: string): string {
    try {
      const withProtocol = input.startsWith('http') ? input : `https://${input}`;
      const parsed = new URL(withProtocol);
      return parsed.hostname.replace(/^www\./, '');
    } catch {
      return input.replace(/^www\./, '').replace(/^https?:\/\//, '');
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) {
      setError('Please enter a company website URL.');
      return;
    }
    const domain = extractDomain(trimmed);
    if (!domain) {
      setError('Please enter a valid website URL.');
      return;
    }
    setError('');
    router.push(`/research/${encodeURIComponent(domain)}`);
  }

  function clearHistory() {
    localStorage.removeItem('bpt-search-history');
    setHistory([]);
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 80px)',
      display: 'flex',
      background: '#ffffff',
    }}>

      {/* Left — Search Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 48px',
      }}>
        <div style={{ width: '100%', maxWidth: '560px' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 700,
          color: '#003B5C',
          marginBottom: '10px',
          lineHeight: 1.2,
        }}>
          Prospect Research Engine
        </h1>
        <p style={{
          fontSize: '1rem',
          color: '#003B5C',
          marginBottom: '32px',
          lineHeight: 1.6,
        }}>
          Enter a company website to generate personalized Bridgepointe recommendations.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g. acmecorp.com"
              style={{
                flex: 1,
                minWidth: '260px',
                padding: '14px 20px',
                fontSize: '1rem',
                fontFamily: 'Mulish, sans-serif',
                color: '#003B5C',
                border: '2px solid #003B5C',
                borderRadius: '25px',
                outline: 'none',
                background: '#ffffff',
              }}
            />
            <button type="submit" className="btn-green" style={{ minWidth: '160px' }}>
              Research Company
            </button>
          </div>
          {error && (
            <p style={{ color: '#003B5C', marginTop: '10px', fontSize: '1rem', fontWeight: 600 }}>
              {error}
            </p>
          )}
        </form>
        </div>
      </div>

      {/* Right — Previous Searches Sidebar */}
      <div style={{
        width: '360px',
        flexShrink: 0,
        background: '#003B5C',
        padding: '40px 28px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 'calc(100vh - 80px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
            Previous Searches
          </h2>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              style={{
                background: 'none',
                border: 'none',
                color: '#17C662',
                fontSize: '1rem',
                fontFamily: 'Mulish, sans-serif',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Clear all
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <p style={{ color: '#ffffff', fontSize: '1rem', opacity: 0.7 }}>
            Your recent company searches will appear here.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
            {history.slice(0, 25).map((item, i) => (
              <a
                key={i}
                href={`/research/${encodeURIComponent(item.domain)}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  textDecoration: 'none',
                  borderLeft: '3px solid #17C662',
                  transition: 'background 0.15s',
                }}
              >
                <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '1rem', marginBottom: '4px' }}>
                  {item.companyName || item.domain}
                </span>
                <span style={{ color: '#17C662', fontSize: '1rem' }}>
                  {new Date(item.searchedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </a>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
