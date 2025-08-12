"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Calendar,
  Users,
  Clock,
  Building2,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Star,
  UserCheck,
  UserX,
  Award,
  BriefcaseIcon,
  FileText,
  Mail,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  RecommendationAPIClient, 
  convertCandidateToUIFormat,
  type JobDescription as APIJobDescription,
  type RecommendationRequest 
} from "@/services/recommendation-api";

interface Candidate {
  id: string;
  score: number;
  skills: string[];
  experience: number;
  status: "recommended" | "shortlisted" | "rejected" | "hired";
  appliedDate: string;
  assessmentScore?: number;
}

interface JobDetails {
  id: string;
  title: string;
  department: string;
  location: string;
  type: "full-time" | "part-time" | "contract" | "internship";
  salary: string;
  postedDate: string;
  expiryDate: string;
  applicants: number;
  status: "active" | "expired" | "draft" | "closed";
  urgency: "high" | "medium" | "low";
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
}

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [isDescriptionMinimized, setIsDescriptionMinimized] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"all" | "recommended" | "shortlisted" | "rejected">("all");
  const [expiredFilter, setExpiredFilter] = useState<"all" | "hired" | "shortlisted">("all");
  
  // API integration states (temporarily disabled)
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);
  const [hasSearchedCandidates, setHasSearchedCandidates] = useState(false);

  // Mock job details
  const job: JobDetails = {
    id: params.id as string,
    title: "Senior Full-Stack Developer",
    department: "Engineering",
    location: "San Francisco, CA",
    type: "full-time",
    salary: "$120k - $180k",
    postedDate: "2024-01-15",
    expiryDate: "2024-02-15",
    applicants: 47,
    status: params.id === "5" || params.id === "6" ? "expired" : "active",
    urgency: "high",
    description: "We are looking for an experienced Full-Stack Developer to join our engineering team. You will be responsible for developing and maintaining web applications using modern technologies. The ideal candidate has strong experience with React, Node.js, and cloud services.",
    requirements: [
      "5+ years of experience in full-stack development",
      "Strong proficiency in JavaScript/TypeScript",
      "Experience with React, Node.js, and modern web frameworks",
      "Knowledge of cloud services (AWS/GCP/Azure)",
      "Experience with database design and optimization",
      "Strong problem-solving and communication skills",
    ],
    responsibilities: [
      "Design and develop scalable web applications",
      "Collaborate with cross-functional teams",
      "Write clean, maintainable code",
      "Participate in code reviews and technical discussions",
      "Mentor junior developers",
      "Contribute to architectural decisions",
    ],
    benefits: [
      "Competitive salary and equity",
      "Health, dental, and vision insurance",
      "Flexible work arrangements",
      "Professional development budget",
      "Generous PTO policy",
    ],
  };

  // Function to fetch candidates from recommendation API
  const fetchRecommendedCandidates = async () => {
    if (job.status === "expired") return; // Don't fetch for expired jobs
    
    setIsLoadingCandidates(true);
    setRecommendationError(null);
    
    try {
      // Convert job details to API format
      const apiJob: APIJobDescription = {
        id: job.id,
        title: job.title,
        company: job.department, // Using department as company
        description: job.description,
        requirements: job.requirements,
        preferred_skills: job.benefits, // Map benefits to preferred skills
        location: job.location,
      };

      // Create recommendation request
      const request: RecommendationRequest = {
        job: apiJob,
        top_n: 10,
        include_summary: true,
      };

      console.log('🔍 Fetching real candidates from database for job:', apiJob.title);
      
      // Call recommendation API
      const response = await RecommendationAPIClient.searchCandidates(request);
      
      console.log('✅ API Response:', response);
      
      // Convert API candidates to UI format
      const uiCandidates = response.candidates.map(convertCandidateToUIFormat);
      
      setCandidates(uiCandidates);
      setHasSearchedCandidates(true);
      
      console.log(`🎯 Successfully fetched ${uiCandidates.length} real candidates from database`);
      
    } catch (error) {
      console.error('❌ Error fetching candidates:', error);
      setRecommendationError(
        error instanceof Error 
          ? `Failed to fetch candidates: ${error.message}` 
          : 'Failed to fetch candidates from recommendation service'
      );
    } finally {
      setIsLoadingCandidates(false);
    }
  };

  // Mock candidates data (fallback for expired jobs or API failure)
  const loadMockCandidates = () => {
    if (job.status === "expired") {
      // For expired jobs, show shortlisted and hired candidates
      setCandidates([
        {
          id: "CAND-7823",
          score: 95,
          skills: ["React", "Node.js", "AWS", "TypeScript"],
          experience: 6,
          status: "hired",
          appliedDate: "2024-01-16",
          assessmentScore: 92,
        },
        {
          id: "CAND-4521",
          score: 88,
          skills: ["React", "Python", "Docker", "PostgreSQL"],
          experience: 5,
          status: "shortlisted",
          appliedDate: "2024-01-17",
          assessmentScore: 85,
        },
        {
          id: "CAND-9234",
          score: 85,
          skills: ["Vue.js", "Node.js", "MongoDB", "AWS"],
          experience: 4,
          status: "shortlisted",
          appliedDate: "2024-01-18",
          assessmentScore: 83,
        },
        {
          id: "CAND-1122",
          score: 82,
          skills: ["Angular", "Node.js", "AWS", "MySQL"],
          experience: 5,
          status: "shortlisted",
          appliedDate: "2024-01-19",
          assessmentScore: 80,
        },
        {
          id: "CAND-3344",
          score: 79,
          skills: ["React", "Java", "Spring Boot", "PostgreSQL"],
          experience: 4,
          status: "shortlisted",
          appliedDate: "2024-01-20",
          assessmentScore: 78,
        },
      ]);
    } else {
      // For active jobs, show recommended candidates
      setCandidates([
        {
          id: "CAND-1234",
          score: 92,
          skills: ["React", "Node.js", "AWS", "TypeScript"],
          experience: 6,
          status: "recommended",
          appliedDate: "2024-01-16",
          assessmentScore: 89,
        },
        {
          id: "CAND-5678",
          score: 88,
          skills: ["React", "Python", "Docker", "PostgreSQL"],
          experience: 5,
          status: "recommended",
          appliedDate: "2024-01-17",
          assessmentScore: 85,
        },
        {
          id: "CAND-9012",
          score: 85,
          skills: ["Vue.js", "Node.js", "MongoDB", "AWS"],
          experience: 4,
          status: "shortlisted",
          appliedDate: "2024-01-18",
          assessmentScore: 83,
        },
        {
          id: "CAND-3456",
          score: 82,
          skills: ["Angular", "Java", "Spring Boot", "MySQL"],
          experience: 7,
          status: "recommended",
          appliedDate: "2024-01-19",
          assessmentScore: 80,
        },
        {
          id: "CAND-7890",
          score: 78,
          skills: ["React", "Ruby on Rails", "Redis", "PostgreSQL"],
          experience: 3,
          status: "rejected",
          appliedDate: "2024-01-20",
          assessmentScore: 75,
        },
      ]);
    }
  };

  // useEffect to trigger candidate loading - FETCH REAL CANDIDATES FROM DATABASE
  useEffect(() => {
    console.log('📋 Job Details Page Loading - Job Status:', job.status);
    
    if (job.status === "expired") {
      console.log('📊 Loading mock data for expired job');
      loadMockCandidates();
    } else {
      console.log('🔥 FETCHING REAL CANDIDATES FROM DATABASE API!');
      fetchRecommendedCandidates();
    }
  }, [job.status]);

  const handleShortlist = (candidateId: string) => {
    setCandidates(prev =>
      prev.map(c =>
        c.id === candidateId
          ? { ...c, status: c.status === "shortlisted" ? "recommended" : "shortlisted" }
          : c
      )
    );
  };

  const handleReject = (candidateId: string) => {
    setCandidates(prev =>
      prev.map(c =>
        c.id === candidateId
          ? { ...c, status: "rejected" }
          : c
      )
    );
  };

  const handleBulkShortlist = () => {
    setCandidates(prev =>
      prev.map(c =>
        selectedCandidates.has(c.id)
          ? { ...c, status: "shortlisted" }
          : c
      )
    );
    setSelectedCandidates(new Set());
  };

  const toggleCandidateSelection = (candidateId: string) => {
    const newSelection = new Set(selectedCandidates);
    if (newSelection.has(candidateId)) {
      newSelection.delete(candidateId);
    } else {
      newSelection.add(candidateId);
    }
    setSelectedCandidates(newSelection);
  };

  const filteredCandidates = candidates.filter(c => {
    if (job.status === "expired") {
      if (expiredFilter === "all") return true;
      return c.status === expiredFilter;
    } else {
      if (filter === "all") return true;
      return c.status === filter;
    }
  });

  const getStatusIcon = (status: Candidate["status"]) => {
    switch (status) {
      case "hired":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "shortlisted":
        return <Star className="h-4 w-4 text-amber-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Sparkles className="h-4 w-4 text-[#667eea]" />;
    }
  };

  const getStatusBadge = (status: Candidate["status"]) => {
    const styles = {
      hired: "border-green-200 bg-green-50 text-green-700",
      shortlisted: "border-amber-200 bg-amber-50 text-amber-700",
      rejected: "border-red-200 bg-red-50 text-red-700",
      recommended: "border-[#667eea]/20 bg-[#667eea]/10 text-[#667eea]",
    };

    return (
      <Badge className={cn("rounded-md px-2 py-0.5 text-xs capitalize", styles[status])}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="px-8 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-lg hover:bg-gray-100"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />
                {job.department}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {job.location}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {job.applicants} applicants
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className={cn(
            "rounded-md px-3 py-1.5",
            job.status === "active" 
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-gray-200 bg-gray-50 text-gray-600"
          )}>
            {job.status === "active" ? "Active" : "Expired"}
          </Badge>
          {job.status === "active" && (
            <Button className="rounded-lg bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white hover:opacity-90">
              Edit Job
            </Button>
          )}
        </div>
      </div>

      {/* Job Description Card */}
      <Card className="mb-6 border-gray-200 bg-white shadow-sm">
        <CardHeader 
          className="cursor-pointer border-b border-gray-200 bg-gradient-to-r from-[#667eea]/5 to-[#764ba2]/5"
          onClick={() => setIsDescriptionMinimized(!isDescriptionMinimized)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <FileText className="h-4 w-4 text-[#667eea]" />
              Job Description
            </CardTitle>
            {isDescriptionMinimized ? (
              <ChevronDown className="h-5 w-5 text-gray-600" />
            ) : (
              <ChevronUp className="h-5 w-5 text-gray-600" />
            )}
          </div>
        </CardHeader>
        
        {!isDescriptionMinimized && (
          <CardContent className="p-6 space-y-6">
            {/* Overview */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Overview</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{job.description}</p>
            </div>

            {/* Key Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-xs text-gray-500 mb-1">Type</p>
                <p className="text-sm font-semibold text-gray-900 capitalize">{job.type.replace("-", " ")}</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-xs text-gray-500 mb-1">Salary Range</p>
                <p className="text-sm font-semibold text-gray-900">{job.salary}</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-xs text-gray-500 mb-1">Posted Date</p>
                <p className="text-sm font-semibold text-gray-900">{new Date(job.postedDate).toLocaleDateString()}</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-xs text-gray-500 mb-1">Expiry Date</p>
                <p className="text-sm font-semibold text-gray-900">{new Date(job.expiryDate).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Requirements */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Requirements</h3>
              <ul className="space-y-1">
                {job.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Responsibilities */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Responsibilities</h3>
              <ul className="space-y-1">
                {job.responsibilities.map((resp, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                    <BriefcaseIcon className="h-4 w-4 text-[#667eea] mt-0.5 flex-shrink-0" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Benefits */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Benefits</h3>
              <div className="flex flex-wrap gap-2">
                {job.benefits.map((benefit, index) => (
                  <Badge key={index} variant="secondary" className="rounded-lg px-3 py-1">
                    {benefit}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Candidates Section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {job.status === "expired" ? "Final Candidates" : "Recommended Candidates"}
            </h2>
            
            {/* Loading indicator */}
            {isLoadingCandidates && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Fetching candidates from AI...</span>
              </div>
            )}
            
            {/* Refresh button for active jobs */}
            {job.status === "active" && !isLoadingCandidates && hasSearchedCandidates && (
              <Button
                variant="outline"
                size="sm"
                onClick={fetchRecommendedCandidates}
                className="rounded-lg"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
            )}
            
            {job.status === "active" ? (
              <div className="flex rounded-lg border border-gray-200 bg-white p-1">
                {(["all", "recommended", "shortlisted", "rejected"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "px-3 py-1 rounded-md text-sm font-medium capitalize transition-all",
                      filter === f
                        ? "bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white"
                        : "text-gray-600 hover:text-gray-900"
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex rounded-lg border border-gray-200 bg-white p-1">
                <button
                  onClick={() => setExpiredFilter("all")}
                  className={cn(
                    "px-3 py-1 rounded-md text-sm font-medium transition-all",
                    expiredFilter === "all"
                      ? "bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  All ({candidates.length})
                </button>
                <button
                  onClick={() => setExpiredFilter("hired")}
                  className={cn(
                    "px-3 py-1 rounded-md text-sm font-medium transition-all",
                    expiredFilter === "hired"
                      ? "bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  Hired ({candidates.filter(c => c.status === "hired").length})
                </button>
                <button
                  onClick={() => setExpiredFilter("shortlisted")}
                  className={cn(
                    "px-3 py-1 rounded-md text-sm font-medium transition-all",
                    expiredFilter === "shortlisted"
                      ? "bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  Shortlisted ({candidates.filter(c => c.status === "shortlisted").length})
                </button>
              </div>
            )}
          </div>
          
          {job.status === "active" && selectedCandidates.size > 0 && (
            <Button 
              onClick={handleBulkShortlist}
              className="rounded-lg bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white hover:opacity-90"
            >
              Shortlist Selected ({selectedCandidates.size})
            </Button>
          )}
        </div>

        {/* Error message */}
        {recommendationError && (
          <Card className="border-red-200 bg-red-50 mb-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                <div>
                  <p className="font-medium">Recommendation Service Error</p>
                  <p className="text-sm text-red-600">{recommendationError}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchRecommendedCandidates}
                    className="mt-2 border-red-200 text-red-600 hover:bg-red-100"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading skeleton */}
        {isLoadingCandidates && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="border-gray-200 bg-white shadow-sm">
                <CardContent className="p-5">
                  <div className="animate-pulse">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="mb-4">
                      <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                      <div className="h-2 bg-gray-200 rounded w-full"></div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="h-3 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-28"></div>
                    </div>
                    <div className="flex gap-1 mb-4">
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                      <div className="h-6 bg-gray-200 rounded w-14"></div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-8 bg-gray-200 rounded flex-1"></div>
                      <div className="h-8 bg-gray-200 rounded flex-1"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Candidates Grid */}
        {!isLoadingCandidates && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCandidates.map((candidate) => (
            <Card 
              key={candidate.id} 
              className={cn(
                "border-gray-200 bg-white shadow-sm hover:shadow-md transition-all",
                selectedCandidates.has(candidate.id) && "ring-2 ring-[#667eea]"
              )}
            >
              <CardContent className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {job.status === "active" && candidate.status !== "hired" && (
                      <input
                        type="checkbox"
                        checked={selectedCandidates.has(candidate.id)}
                        onChange={() => toggleCandidateSelection(candidate.id)}
                        className="rounded border-gray-300 text-[#667eea] focus:ring-[#667eea]"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{candidate.id}</p>
                      <p className="text-xs text-gray-500">Applied {new Date(candidate.appliedDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(candidate.status)}
                    {getStatusBadge(candidate.status)}
                  </div>
                </div>

                {/* Match Score */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Match Score</span>
                    <span className="text-lg font-bold bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
                      {candidate.score}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-[#667eea] to-[#764ba2]"
                      style={{ width: `${candidate.score}%` }}
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Award className="h-3.5 w-3.5" />
                    <span>{candidate.experience} years experience</span>
                  </div>
                  {candidate.assessmentScore && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="h-3.5 w-3.5" />
                      <span>Assessment: {candidate.assessmentScore}%</span>
                    </div>
                  )}
                </div>

                {/* Skills */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Top Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {candidate.skills.slice(0, 3).map((skill, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="rounded-md px-2 py-0.5 text-xs"
                      >
                        {skill}
                      </Badge>
                    ))}
                    {candidate.skills.length > 3 && (
                      <Badge 
                        variant="secondary" 
                        className="rounded-md px-2 py-0.5 text-xs"
                      >
                        +{candidate.skills.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {job.status === "active" && candidate.status !== "hired" && (
                  <div className="flex gap-2">
                    {candidate.status !== "shortlisted" && (
                      <Button
                        size="sm"
                        onClick={() => handleShortlist(candidate.id)}
                        className="flex-1 rounded-lg bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white hover:opacity-90"
                      >
                        <UserCheck className="h-3.5 w-3.5 mr-1" />
                        Shortlist
                      </Button>
                    )}
                    {candidate.status === "shortlisted" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleShortlist(candidate.id)}
                        className="flex-1 rounded-lg"
                      >
                        Remove from Shortlist
                      </Button>
                    )}
                    {candidate.status !== "rejected" && candidate.status !== "shortlisted" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(candidate.id)}
                        className="flex-1 rounded-lg border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <UserX className="h-3.5 w-3.5 mr-1" />
                        Reject
                      </Button>
                    )}
                  </div>
                )}
                
                {candidate.status === "hired" && (
                  <div className="text-center">
                    <Badge className="w-full justify-center rounded-lg border-green-200 bg-green-50 text-green-700 py-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      Hired Candidate
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoadingCandidates && filteredCandidates.length === 0 && !recommendationError && (
          <Card className="border-gray-200 bg-gray-50">
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {hasSearchedCandidates 
                  ? "No candidates found for the selected filter." 
                  : "Click refresh to search for candidates."}
              </p>
              {!hasSearchedCandidates && job.status === "active" && (
                <Button 
                  onClick={fetchRecommendedCandidates}
                  className="mt-4 rounded-lg bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white hover:opacity-90"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Find Candidates
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}