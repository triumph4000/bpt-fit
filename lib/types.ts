export interface Executive {
  name: string;
  title: string;
  linkedinUrl?: string;
}

export interface CompanyBasicInfo {
  companyName: string;
  headquarters: string;
  linkedinUrl?: string;
  yearFounded?: string;
  estimatedRevenue?: string;
  estimatedEmployees?: string;
  ownershipStatus?: string;
  industries?: string[];
  naicsCode?: string;
  sicCode?: string;
  description: string;
  executives?: Executive[];
}

export interface NewsItem {
  headline: string;
  summary: string;
  category: string;
  date?: string;
  sourceUrl?: string;
}

export interface Competitor {
  name: string;
  website: string;
}

export interface Recommendation {
  companyInitiative: string;
  bridgepointeSolution: string;
  bulletPointForEmail: string;
}

export interface ResearchResult {
  domain: string;
  basicInfo: CompanyBasicInfo;
  recentIntelligence: NewsItem[];
  competitors: Competitor[];
  recommendations: Recommendation[];
  confidenceLevel: 'High' | 'Medium' | 'Low';
  researchDate: string;
}
