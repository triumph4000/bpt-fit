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
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      background: '#ffffff',
    }}>
      <div style={{ maxWidth: '680px', width: '100%' }}>

        {/* Headline */}
        <h1 style={{
          fontSize: '2.4rem',
          fontWeight: 700,
          color: '#003B5C',
          marginBottom: '12px',
          lineHeight: 1.2,
        }}>
          Prospect Research Engine
        </h1>
        <p style={{
          fontSize: '1.1rem',
          color: '#003B5C',
          marginBottom: '40px',
          lineHeight: 1.6,
        }}>
          Enter a company website to research their business, surface recent intelligence, and generate personalized Bridgepointe recommendations — ready to paste into an email.
        </p>

        {/* Search Form */}
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

        {/* Search History */}
        {history.length > 0 && (
          <div style={{ marginTop: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#003B5C', margin: 0 }}>
                Recent Searches
              </h2>
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
                Clear history
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {history.map((item, i) => (
                <a
                  key={i}
                  href={`/research/${encodeURIComponent(item.domain)}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 20px',
                    background: '#EEEEEE',
                    borderRadius: '25px',
                    textDecoration: 'none',
                    transition: 'background 0.15s',
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 700, color: '#003B5C', fontSize: '1rem' }}>
                      {item.companyName || item.domain}
                    </span>
                    <span style={{ color: '#17C662', fontSize: '1rem', marginLeft: '10px' }}>
                      {item.domain}
                    </span>
                  </div>
                  <span style={{ color: '#003B5C', fontSize: '1rem' }}>
                    {new Date(item.searchedAt).toLocaleDateString()}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
