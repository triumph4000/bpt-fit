# BPT Fit — Project Instructions

## What This App Does

BPT Fit is an internal recommendation engine for Bridgepointe employees and strategists. A user enters a prospect or customer's website URL. The app researches the company using public data sources, then generates a ready-to-send email block with personalized recommendations on how Bridgepointe can help.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Deployment:** Vercel
- **Repository:** https://github.com/triumph4000/bpt-fit.git
- **Language:** TypeScript

## Branding & Design System

### Logo
- Source file: `/Users/brianleonard/Documents/GitHub/bpt-fit/images/bpt_logo.png`
- Copy to: `/public/images/bpt_logo.png` in the Next.js project
- Position: top-left of header

### Colors

**Brand colors — the ONLY two colors used for text and interactive elements:**
- **Blue:** `rgb(0, 59, 92)` / `#003B5C` — primary text, headings, nav
- **Green:** `rgb(23, 198, 98)` / `#17C662` — accent, CTAs, highlights

**No font or text should be lighter than these two colors.**
**No other text colors are permitted** — no gray text, no muted text, no placeholder-colored text.

Background colors (non-text):
- White: `#FFFFFF` — page background
- Light gray: `#EEEEEE` — section backgrounds, dividers only

### Typography

- **Font family:** Mulish (load from Google Fonts)
- **Minimum font size: 16px — no exceptions**
- Font weights: 400 (regular), 600 (semibold), 700 (bold)
- H1: `2.4rem–2.8rem`, bold, blue
- H2: `2rem`, bold, blue
- H3: `1.5rem`, semibold, blue
- Body: `1rem` (16px), regular, blue
- All text is either blue (`#003B5C`) or green (`#17C662`) — nothing else

### UI Rules — Strictly Enforced

- **No badge, pill, chip, or label elements** — no oval or rounded tag-style text boxes
- **No decorative label elements above headings or section titles** — headings stand alone
- **No muted, faded, or gray text** — all text must be full blue or full green
- Keep the design clean and direct — no decorative UI flourishes

### Spacing & Layout
- Max content width: `1250px`, centered
- Standard padding: `20px`
- Two-column card layouts at desktop, stack on mobile

### Breakpoints
- Mobile: `480px`, `767px`
- Tablet: `768px–1024px`
- Desktop: `1200px+`

### Component Styles
- **Card border radius:** `25px`
- **Button style:** background `#003B5C`, text `#FFFFFF`, border-radius `25px`
- **Primary CTA button:** background `#17C662`, text `#FFFFFF`, border-radius `25px`
- **Box shadow (cards):** `6px 6px 9px rgba(0,0,0,0.2)`

### Implementation Notes
- Use Tailwind CSS with custom config defining `bpt-blue: #003B5C` and `bpt-green: #17C662`
- Load Mulish from Google Fonts
- Enforce 16px minimum via Tailwind base styles

---

## Full App Flow

### Step 1 — Input
User enters a company website URL on the home page.

---

### Step 2 — Basic Company Info

Return the following for the company:

- Company Name
- Headquarters (city / state / country)
- Company LinkedIn URL
- Year Founded
- Estimated Annual Revenue
- Estimated # of Employees
- Ownership Status (Public / Private / PE-backed / VC-backed)
- Industry(s)
- NAICS #
- SIC #
- 1-sentence description of what the company does
- Key Executives — Name, title, and LinkedIn URL for: CEO, CTO, CIO, CFO (where available)

---

### Step 3 — Recent News & Intelligence (Last 12 Months)

Surface all timely, relevant public information about the company that could create an opening for Bridgepointe. Include but do not limit to:

- Acquisitions or mergers
- New executive hires
- New office locations or expansions
- New lines of business
- New products or services launched
- Security breaches or incidents
- New corporate initiatives
- Strategic announcements
- Active job postings — especially in IT, security, cloud, or infrastructure roles (signals in-progress projects or internal gaps)
- Known technology stack / vendors they currently use (from job postings, press releases, case studies)

---

### Step 4 — Top 7 Competitors

List the company's top 7 competitors. For each, provide:
- Company name
- Website URL

---

### Step 5 — Top 6 Bridgepointe Recommendations

Analyze the company intelligence gathered above and compare it against Bridgepointe's 8 practice areas. Identify the top 6 opportunities where Bridgepointe could provide meaningful value.

For each recommendation, provide 3 sections:

**1. Company Initiative Explained**
Describe the specific company situation, project, challenge, or announcement that creates the opportunity.

**2. Bridgepointe Solution/Service**
Name the specific Bridgepointe practice or capability that applies.

**3. Bullet Point for Email**
- Maximum 40 words
- Professional tone
- Must reference the specific company initiative or detail — not generic
- Written so the prospect can tell Bridgepointe did their research
- Active voice, plain language

Example (fictitious company ACMECO):
> Leveraging our CX Team to assist with ACMECO's new global contact center and "care team" modernization initiatives, including multilingual omnichannel CX platforms spanning voice, chat, SMS, and AI-enabled customer interactions across international operations.

---

### Step 6 — Email Output Block

Display all 6 bullet points together in a single copyable block with this exact opening sentence:

> At the risk of sounding presumptuous, based on what we know about your business, several areas stood out where Bridgepointe may be able to provide meaningful value, including:

Followed by all 6 bullet points as a bulleted list. The entire block should be selectable and copyable with one click.

---

### Step 7 — Metadata

Display at the bottom of the results:
- **Confidence Level:** High / Medium / Low — based on how much public data was available
- **Research as of:** today's date

---

### Step 8 — Save & History

- **Export to PDF** — allow user to download the full research output as a PDF
- **Search History** — maintain a list of recently researched companies the user can click to reload

---

## Bridgepointe's 8 Practice Areas

Use these to match prospect situations to recommendations:

1. **Network Transformation** — Internet, WAN, SD-WAN, SASE/SSE, dark fiber, LTE, cloud networking
2. **Data Center and Cloud** — Cloud migration, infrastructure, hybrid cloud, data center strategy
3. **Security** — Virtual CISO, MDR/XDR, SIEM, IAM, managed firewall, compliance auditing, staff augmentation
4. **Managed IT and Applications** — O365/Google Workspace, Desktop as a Service, Help Desk, network/device management, backup
5. **Communication and Collaboration** — Unified communications, telephony, mobility
6. **Customer Experience (CX)** — Contact center as a service, AI-enabled CX, IVR/self-service, workforce management, omnichannel
7. **Business Process Outsourcing (BPO)** — Outsourced business processes
8. **Artificial Intelligence** — AI platform rollout, agentic workflows, AI governance/compliance, no-code analytics, AWS Bedrock/SageMaker, private model hosting, shadow AI scanning

### AI Practice Boundaries (Do NOT oversell)
The AI practice cannot deliver: frontier model R&D, PhD-level custom data science, deep Azure/GCP engineering, on-prem/air-gapped deployments, adversarial AI testing, legal advice, or change management consulting.

### Lifecycle Management Services (cross-practice)
- **Technology Expense Management** — proprietary TechView platform, up to 30% tech spend savings
- **Mobility Management** — end-to-end device lifecycle, 60,000+ support tickets/year
- **Strategic Sourcing** — average 20% procurement savings, RFP management
- **Transition Management** — migration project management

### The 3 Reasons Customers Engage Bridgepointe
Use as matching framework when analyzing news:
1. **New project** — cloud, UC, contact center, telephony/mobility, WAN/SDWAN, managed IT/security
2. **New to a company** — needs inventory audit, cost analysis, competitive market review
3. **Immediate problem** — something is broken or urgent

---

## Positioning Rules (Critical — apply everywhere)

- Bridgepointe is an **independent technology advisor** — never vendor-aligned
- Bridgepointe does **not resell** technology — they refer clients to suppliers and earn a monthly commission from the supplier
- Services are at **no cost to the client**
- Never imply Bridgepointe sells, resells, or is aligned with any specific vendor
- Do not fabricate company data — only surface information from public sources
- Bullet points must feel researched and specific, never generic

---

## Data Sources

Use public APIs and web research to gather company intelligence:

- **Company data:** Tavily web search, LinkedIn public profiles, Crunchbase, SEC EDGAR (public companies)
- **News:** Tavily search filtered to last 12 months
- **Job postings:** LinkedIn Jobs, Indeed, or company careers pages
- **Tech stack:** BuiltWith, Wappalyzer, job posting language
- **Competitors:** Crunchbase, SimilarWeb, or AI-derived from industry context

---

## Environment Variables (configure in Vercel)

```
ANTHROPIC_API_KEY=     # Claude AI for analysis and recommendation generation
TAVILY_API_KEY=        # Web search for real-time company research
```

---

## Development Notes

- Use `npm run dev` to run locally
- All API calls using secret keys must go through Next.js API routes — never expose keys client-side
- Prefer server components for data fetching
- Keep UI clean and fast — internal productivity tool, not a consumer product
- Search history uses localStorage for V1
- PDF export uses browser print / window.print() for V1
