import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { ResearchResult } from '@/lib/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const BRIDGEPOINTE_CONTEXT = `
You are a research assistant for Bridgepointe Technologies (BPT), a supplier-agnostic IT advisory firm.

ABOUT BRIDGEPOINTE:
- Independent technology advisor — never vendor-aligned
- Does NOT resell technology — refers clients to suppliers and earns a monthly referral commission from the supplier
- Services are at no cost to the client
- 20+ years experience, 14,000+ clients, 400+ staff, $100M+ investment from Charlesbank Capital Partners

BRIDGEPOINTE'S 8 PRACTICE AREAS:
1. Network Transformation — Internet, WAN, SD-WAN, SASE/SSE, dark fiber, LTE, cloud networking
2. Data Center and Cloud — Cloud migration, infrastructure, hybrid cloud, data center strategy
3. Security — Virtual CISO, MDR/XDR, SIEM, IAM, managed firewall, compliance auditing, staff augmentation
4. Managed IT and Applications — O365/Google Workspace, Desktop as a Service, Help Desk, network/device management, backup
5. Communication and Collaboration — Unified communications, telephony, mobility
6. Customer Experience (CX) — Contact center as a service, AI-enabled CX, IVR/self-service, workforce management, omnichannel
7. Business Process Outsourcing (BPO) — Outsourced business processes
8. Artificial Intelligence — AI platform rollout, agentic workflows, AI governance/compliance, no-code analytics, AWS Bedrock/SageMaker, private model hosting, shadow AI scanning

LIFECYCLE MANAGEMENT SERVICES (cross-practice):
- Technology Expense Management — proprietary TechView platform, up to 30% tech spend savings
- Mobility Management — end-to-end device lifecycle, 60,000+ support tickets/year
- Strategic Sourcing — average 20% procurement savings, RFP management
- Transition Management — migration project management

THE 3 REASONS CUSTOMERS ENGAGE BRIDGEPOINTE:
1. New project — cloud, UC, contact center, telephony/mobility, WAN/SDWAN, managed IT/security
2. New to a company — needs inventory audit, cost analysis, competitive market review
3. Immediate problem — something is broken or urgent

AI PRACTICE CANNOT DELIVER (do not recommend these):
No frontier model R&D, no PhD-level custom data science, limited Azure/GCP depth, no on-prem/air-gapped at scale, no adversarial AI testing, no legal advice.

POSITIONING RULES:
- Never describe Bridgepointe as a reseller or vendor
- Never align Bridgepointe with a specific technology vendor
- Bullet points must be specific to the company — never generic
`;

async function searchWeb(query: string): Promise<string> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return '';

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: 'advanced',
        max_results: 8,
        include_answer: true,
      }),
    });
    const data = await response.json();
    const results = data.results || [];
    const answer = data.answer || '';
    const snippets = results.map((r: { title: string; content: string; url: string }) =>
      `Source: ${r.title}\nURL: ${r.url}\nContent: ${r.content}`
    ).join('\n\n---\n\n');
    return answer ? `Summary: ${answer}\n\nSources:\n${snippets}` : snippets;
  } catch {
    return '';
  }
}

export async function POST(request: NextRequest) {
  try {
    const { domain } = await request.json();

    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not configured' }, { status: 500 });
    }

    // Run web searches in parallel
    const [companySearch, newsSearch, jobsSearch, competitorSearch] = await Promise.all([
      searchWeb(`${domain} company overview headquarters founded employees revenue executives CIO CFO "VP of IT" "VP Infrastructure" "VP Cybersecurity" "Director of IT" "Director of Security" CEO LinkedIn NAICS SIC industry`),
      searchWeb(`${domain} news announcements acquisitions new hires expansions products security breach initiatives 2024 2025`),
      searchWeb(`${domain} job postings IT cloud security infrastructure hiring technology stack tools`),
      searchWeb(`${domain} top competitors similar companies industry`),
    ]);

    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const prompt = `${BRIDGEPOINTE_CONTEXT}

Today's date: ${today}

You are researching the company at domain: ${domain}

WEB RESEARCH GATHERED:

=== COMPANY OVERVIEW ===
${companySearch || 'Limited data available.'}

=== RECENT NEWS & ANNOUNCEMENTS (last 12 months) ===
${newsSearch || 'Limited data available.'}

=== JOB POSTINGS & TECH STACK ===
${jobsSearch || 'Limited data available.'}

=== COMPETITORS ===
${competitorSearch || 'Limited data available.'}

Based on this research, produce a comprehensive company intelligence report. Return ONLY valid JSON matching this exact structure:

{
  "basicInfo": {
    "companyName": "Full legal company name",
    "headquarters": "City, State, Country",
    "linkedinUrl": "https://linkedin.com/company/...",
    "yearFounded": "YYYY",
    "estimatedRevenue": "$X million / $X billion (annual)",
    "estimatedEmployees": "X,XXX",
    "ownershipStatus": "Public | Private | PE-backed | VC-backed",
    "industries": ["Industry 1", "Industry 2"],
    "naicsCode": "XXXXX",
    "sicCode": "XXXX",
    "description": "One clear sentence describing what the company does.",
    "executives": [
      { "name": "Full Name", "title": "CIO", "linkedinUrl": "https://linkedin.com/in/..." },
      { "name": "Full Name", "title": "CFO", "linkedinUrl": "https://linkedin.com/in/..." },
      { "name": "Full Name", "title": "VP IT/Infrastructure", "linkedinUrl": "https://linkedin.com/in/..." },
      { "name": "Full Name", "title": "VP/Director Cybersecurity", "linkedinUrl": "https://linkedin.com/in/..." },
      { "name": "Full Name", "title": "CEO", "linkedinUrl": "https://linkedin.com/in/..." }
    ]
  },
  "recentIntelligence": [
    {
      "headline": "Brief headline",
      "summary": "2-3 sentence summary of this development and why it matters",
      "category": "Acquisition | New Hire | Expansion | New Product | Security Breach | Initiative | Job Postings | Technology Stack | Strategic Announcement",
      "date": "Month YYYY or approximate",
      "sourceUrl": "https://..."
    }
  ],
  "competitors": [
    { "name": "Competitor Name", "website": "https://competitor.com" }
  ],
  "recommendations": [
    {
      "companyInitiative": "Describe the specific company situation, initiative, or challenge that creates this opportunity. Be specific to this company.",
      "bridgepointeSolution": "Name the specific Bridgepointe practice area or service that applies.",
      "bulletPointForEmail": "Maximum 40 words. Reference the specific company initiative. Professional tone. Written so the prospect knows Bridgepointe did their research. Active voice."
    }
  ],
  "confidenceLevel": "High | Medium | Low"
}

REQUIREMENTS:
- executives: Find these specific roles in priority order: CIO, CFO, VP of IT/Infrastructure, VP or Director of Cybersecurity, CEO. Use the closest matching actual title found. Only include executives you found — omit roles not found rather than guessing.
- recentIntelligence: Return 6-10 items from the last 12 months. Include job posting signals and tech stack findings.
- competitors: Return exactly 7 competitors with name and website.
- recommendations: Return exactly 6 recommendations matched to Bridgepointe's practice areas. Each bullet point must be specific to THIS company — reference their actual initiatives, announcements, or situation. Maximum 40 words per bullet. Do not fabricate information not found in research.
- confidenceLevel: High = abundant public data found, Medium = some data found, Low = very little public data.
- If specific data is unavailable, use "Not publicly available" rather than guessing.
- Do not include LinkedIn URLs you are not confident about — omit rather than guess.
- Return ONLY the JSON object, no markdown, no explanation.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    let parsed;
    try {
      const text = content.text.trim();
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      parsed = JSON.parse(text.slice(jsonStart, jsonEnd));
    } catch {
      throw new Error('Failed to parse Claude response as JSON');
    }

    const result: ResearchResult = {
      domain,
      basicInfo: parsed.basicInfo,
      recentIntelligence: parsed.recentIntelligence || [],
      competitors: (parsed.competitors || []).slice(0, 7),
      recommendations: (parsed.recommendations || []).slice(0, 6),
      confidenceLevel: parsed.confidenceLevel || 'Medium',
      researchDate: today,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Research API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Research failed' },
      { status: 500 }
    );
  }
}
