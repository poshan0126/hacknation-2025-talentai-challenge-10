import axios from 'axios';

// Recommendation backend base URL
const RECOMMENDATION_BASE_URL = 'http://localhost:8002';

// Create a dedicated axios instance for the recommendation service
const recommendationAPI = axios.create({
  baseURL: `${RECOMMENDATION_BASE_URL}/api/recommendations`,
  timeout: 30000, // 30 seconds timeout for recommendation searches
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types for recommendation API
export interface JobDescription {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  preferred_skills: string[];
  location?: string;
}

export interface CandidateMatch {
  candidate_id?: string;
  name?: string;
  title?: string;
  match_score: number;
  skills_match: string[];
  summary?: string;
  experience_years?: number;
  location?: string;
}

export interface RecommendationRequest {
  job: JobDescription;
  top_n: number;
  include_summary: boolean;
}

export interface RecommendationResponse {
  job_id: string;
  candidates: CandidateMatch[];
  total_candidates_searched: number;
  search_metadata: {
    model_used?: string;
    data_source?: string;
    api_candidates_count?: number;
  };
}

// API client class
export class RecommendationAPIClient {
  /**
   * Search for candidates matching a job description
   */
  static async searchCandidates(request: RecommendationRequest): Promise<RecommendationResponse> {
    console.log('🔍 Searching candidates with request:', request);
    const response = await recommendationAPI.post('/search', request);
    console.log('✅ Received candidates response:', response.data);
    return response.data;
  }

  /**
   * Get health status of the recommendation service
   */
  static async getHealth(): Promise<any> {
    const response = await recommendationAPI.get('/health');
    return response.data;
  }
}

// Utility to convert UI candidate format
export const convertCandidateToUIFormat = (candidate: CandidateMatch): any => {
  return {
    id: candidate.candidate_id || candidate.name || `CAND-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
    score: Math.round(candidate.match_score * 100), // Convert 0-1 to 0-100
    skills: candidate.skills_match,
    experience: candidate.experience_years,
    status: 'recommended',
    appliedDate: new Date().toISOString(),
    assessmentScore: candidate.match_score ? Math.round(candidate.match_score * 95) : undefined,
    name: candidate.name,
    title: candidate.title,
    summary: candidate.summary,
    location: candidate.location,
  };
};

export default RecommendationAPIClient;