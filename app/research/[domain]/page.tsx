'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ResearchResult } from '@/lib/types';

function getCacheKey(domain: string) {
  return `bpt-result-${domain}`;
}

function loadFromCache(domain: string): ResearchResult | null {
  try {
    const cached = localStorage.getItem(getCacheKey(domain));
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

function saveToCache(domain: string, data: ResearchResult) {
  try {
    localStorage.setItem(getCacheKey(domain), JSON.stringify(data));
  } catch {
    // localStorage full — clear oldest results and try again
    const keys = Object.keys(localStorage).filter(k => k.startsWith('bpt-result-'));
    if (keys.length > 0) {
      localStorage.removeItem(keys[0]);
      try { localStorage.setItem(getCacheKey(domain), JSON.stringify(data)); } catch { /* give up */ }
    }
  }
}

export default function ResearchPage() {
  const params = useParams();
  const router = useRouter();
  const domain = decodeURIComponent(params.domain as string);

  const [result, setResult] = useState<ResearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [fromCache, setFromCache] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchResearch() {
      // Check cache first — load instantly, no spinner
      const cached = loadFromCache(domain);
      if (cached) {
        setResult(cached);
        setFromCache(true);
        return;
      }

      // No cache — run fresh search
      try {
        setLoading(true);
        const response = await fetch('/api/research', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain }),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'Research failed');
        }

        const data: ResearchResult = await response.json();
        setResult(data);
        setFromCache(false);

        // Save full result to cache
        saveToCache(domain, data);

        // Save to search history
        const saved = localStorage.getItem('bpt-search-history');
        const history = saved ? JSON.parse(saved) : [];
        const newEntry = {
          domain,
          companyName: data.basicInfo?.companyName || domain,
          searchedAt: new Date().toISOString(),
        };
        const filtered = history.filter((h: { domain: string }) => h.domain !== domain);
        localStorage.setItem('bpt-search-history', JSON.stringify([newEntry, ...filtered].slice(0, 25)));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }

    fetchResearch();
  }, [domain]);

  function handleRefresh() {
    localStorage.removeItem(getCacheKey(domain));
    setFromCache(false);
    setResult(null);
    setLoading(true);
    setError('');
    // Re-trigger the effect by reloading
    window.location.reload();
  }

  function buildEmailText(): string {
    if (!result) return '';
    const bullets = result.recommendations
      .map((r) => `• ${r.bulletPointForEmail}`)
      .join('\n');
    return `At the risk of sounding presumptuous, based on what we know about your business, several areas stood out where Bridgepointe may be able to provide meaningful value, including:\n\n${bullets}`;
  }

  function handleCopy() {
    navigator.clipboard.writeText(buildEmailText()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <div style={{
        minHeight: 'calc(100vh - 80px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '56px',
            height: '56px',
            border: '5px solid #EEEEEE',
            borderTop: '5px solid #17C662',
            borderRadius: '50%',
            animation: 'spin 0.9s linear infinite',
            margin: '0 auto 24px',
          }} />
          <h2 style={{ fontSize: '1.5rem', color: '#003B5C', fontWeight: 700 }}>
            Researching {domain}...
          </h2>
          <p style={{ fontSize: '1rem', color: '#003B5C', marginTop: '10px' }}>
            Gathering public intelligence and generating recommendations.
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div className="bpt-card" style={{ maxWidth: '560px', width: '100%', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#003B5C', marginBottom: '12px' }}>Research Failed</h2>
          <p style={{ fontSize: '1rem', color: '#003B5C', marginBottom: '24px' }}>{error}</p>
          <button className="btn-primary" onClick={() => router.push('/')}>Try Another Company</button>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const { basicInfo, recentIntelligence, competitors, recommendations, confidenceLevel, researchDate } = result;
  const confidenceColor = confidenceLevel === 'High' ? '#17C662' : '#003B5C';

  return (
    <div ref={printRef} style={{ padding: '40px 20px', background: '#ffffff' }}>
      <div className="bpt-container">

        {/* Top Actions Bar */}
        <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
          <button onClick={() => router.push('/')} className="btn-primary">
            ← Back to Home
          </button>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {fromCache && (
              <button onClick={handleRefresh} className="btn-green">
                Run Fresh Search
              </button>
            )}
            <button className="btn-primary" onClick={handlePrint}>Export to PDF</button>
          </div>
        </div>

        {/* Cached notice */}
        {fromCache && (
          <div style={{ background: '#EEEEEE', borderRadius: '16px', padding: '12px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ color: '#003B5C', fontSize: '1rem' }}>
              Showing saved results from {researchDate}. Click <strong>Run Fresh Search</strong> to pull new data.
            </span>
          </div>
        )}

        {/* Company Name + Meta */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 700, color: '#003B5C', marginBottom: '8px' }}>
            {basicInfo.companyName}
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#003B5C', marginBottom: '0' }}>
            {basicInfo.description}
          </p>
        </div>

        {/* ── Section 1: Basic Company Info ── */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#003B5C', marginBottom: '20px' }}>
            Company Overview
          </h2>
          <div className="bpt-card">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
              <InfoField label="Headquarters" value={basicInfo.headquarters} />
              <InfoField label="Year Founded" value={basicInfo.yearFounded} />
              <InfoField label="Estimated Revenue" value={basicInfo.estimatedRevenue} />
              <InfoField label="Estimated Employees" value={basicInfo.estimatedEmployees} />
              <InfoField label="Ownership" value={basicInfo.ownershipStatus} />
              <InfoField label="Industries" value={basicInfo.industries?.join(', ')} />
              <InfoField label="NAICS Code" value={basicInfo.naicsCode} />
              <InfoField label="SIC Code" value={basicInfo.sicCode} />
              {basicInfo.linkedinUrl && (
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#17C662', marginBottom: '4px' }}>LinkedIn</div>
                  <a href={basicInfo.linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#003B5C', fontSize: '1rem', wordBreak: 'break-all' }}>
                    {basicInfo.linkedinUrl}
                  </a>
                </div>
              )}
            </div>

            {basicInfo.executives && basicInfo.executives.length > 0 && (
              <div style={{ marginTop: '28px', paddingTop: '24px', borderTop: '2px solid #EEEEEE' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#003B5C', marginBottom: '16px' }}>
                  Key Executives
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                  {basicInfo.executives.map((exec, i) => (
                    <div key={i}>
                      <div style={{ fontWeight: 700, color: '#003B5C', fontSize: '1rem' }}>{exec.name}</div>
                      <div style={{ color: '#17C662', fontSize: '1rem', fontWeight: 600 }}>{exec.title}</div>
                      {exec.linkedinUrl && exec.linkedinUrl !== 'Not publicly available' && (
                        <a href={exec.linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#003B5C', fontSize: '1rem' }}>
                          LinkedIn →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── Section 2: Recent Intelligence ── */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#003B5C', marginBottom: '20px' }}>
            Recent Intelligence
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {recentIntelligence.map((item, i) => (
              <div key={i} className="bpt-card">
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#17C662', marginBottom: '6px' }}>
                    {item.category}
                    {item.date && <span style={{ color: '#003B5C', fontWeight: 400, marginLeft: '12px' }}>{item.date}</span>}
                  </div>
                  <div style={{ fontWeight: 700, color: '#003B5C', fontSize: '1.1rem', marginBottom: '8px' }}>
                    {item.headline}
                  </div>
                  <div style={{ color: '#003B5C', fontSize: '1rem', lineHeight: 1.6 }}>
                    {item.summary}
                  </div>
                  {item.sourceUrl && (
                    <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#17C662', fontSize: '1rem', marginTop: '8px', display: 'inline-block', fontWeight: 600 }}>
                      View source →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 3: Competitors ── */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#003B5C', marginBottom: '20px' }}>
            Top Competitors
          </h2>
          <div className="bpt-card">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              {competitors.map((c, i) => (
                <div key={i} style={{ borderLeft: '3px solid #17C662', paddingLeft: '14px' }}>
                  <div style={{ fontWeight: 700, color: '#003B5C', fontSize: '1rem' }}>{c.name}</div>
                  <a href={c.website.startsWith('http') ? c.website : `https://${c.website}`} target="_blank" rel="noopener noreferrer" style={{ color: '#17C662', fontSize: '1rem' }}>
                    {c.website}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Section 4: Recommendations ── */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#003B5C', marginBottom: '20px' }}>
            Bridgepointe Recommendations
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {recommendations.map((rec, i) => (
              <div key={i} className="bpt-card">
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '14px' }}>
                  <div style={{
                    width: '36px', height: '36px', background: '#17C662', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#ffffff', fontWeight: 700, fontSize: '1rem', flexShrink: 0,
                  }}>
                    {i + 1}
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#003B5C', margin: 0 }}>
                    Opportunity {i + 1}
                  </h3>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontWeight: 700, color: '#17C662', fontSize: '1rem', marginBottom: '6px' }}>Company Initiative</div>
                  <p style={{ color: '#003B5C', fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>{rec.companyInitiative}</p>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontWeight: 700, color: '#17C662', fontSize: '1rem', marginBottom: '6px' }}>Bridgepointe Solution</div>
                  <p style={{ color: '#003B5C', fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>{rec.bridgepointeSolution}</p>
                </div>
                <div style={{ background: '#EEEEEE', borderRadius: '16px', padding: '16px 20px' }}>
                  <div style={{ fontWeight: 700, color: '#003B5C', fontSize: '1rem', marginBottom: '8px' }}>Bullet Point for Email</div>
                  <p style={{ color: '#003B5C', fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>• {rec.bulletPointForEmail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 5: Email Output Block ── */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#003B5C', marginBottom: '20px' }}>
            Email-Ready Output
          </h2>
          <div className="bpt-card">
            <div style={{
              background: '#EEEEEE', borderRadius: '16px', padding: '24px', marginBottom: '20px',
              whiteSpace: 'pre-wrap', lineHeight: 1.8, color: '#003B5C', fontSize: '1rem',
            }}>
              {buildEmailText()}
            </div>
            <button className="btn-green no-print" onClick={handleCopy} style={{ fontSize: '1rem' }}>
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
          </div>
        </section>

        {/* ── Metadata ── */}
        <div style={{ borderTop: '2px solid #EEEEEE', paddingTop: '24px', marginBottom: '40px', display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontWeight: 700, color: '#003B5C', fontSize: '1rem' }}>Confidence Level: </span>
            <span style={{ fontWeight: 700, color: confidenceColor, fontSize: '1rem' }}>{confidenceLevel}</span>
          </div>
          <div>
            <span style={{ fontWeight: 700, color: '#003B5C', fontSize: '1rem' }}>Research as of: </span>
            <span style={{ color: '#003B5C', fontSize: '1rem' }}>{researchDate}</span>
          </div>
        </div>

        {/* Bottom Back to Home */}
        <div className="no-print" style={{ borderTop: '2px solid #EEEEEE', paddingTop: '32px', marginBottom: '40px' }}>
          <button onClick={() => router.push('/')} className="btn-primary">
            ← Back to Home
          </button>
        </div>

      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value?: string }) {
  if (!value || value === 'Not publicly available') return (
    <div>
      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#17C662', marginBottom: '4px' }}>{label}</div>
      <div style={{ color: '#003B5C', fontSize: '1rem', opacity: 0.6 }}>Not available</div>
    </div>
  );
  return (
    <div>
      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#17C662', marginBottom: '4px' }}>{label}</div>
      <div style={{ color: '#003B5C', fontSize: '1rem' }}>{value}</div>
    </div>
  );
}
