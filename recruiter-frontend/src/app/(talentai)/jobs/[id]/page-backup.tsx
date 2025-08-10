// Backup of the original working page
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
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  
  // Simple test - just show the basic page structure
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
    status: "active",
    urgency: "high",
    description: "We are looking for an experienced Full-Stack Developer to join our engineering team.",
    requirements: [
      "5+ years of experience in full-stack development",
      "Strong proficiency in JavaScript/TypeScript",
    ],
    responsibilities: [
      "Design and develop scalable web applications",
      "Collaborate with cross-functional teams",
    ],
    benefits: [
      "Competitive salary and equity",
      "Health, dental, and vision insurance",
    ],
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
          </div>
        </div>
      </div>

      {/* Test message */}
      <Card className="mb-6 border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle2 className="h-5 w-5" />
            <p className="font-medium">Page is loading successfully! API integration will be added next.</p>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder candidates */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Candidates Loading Test</h2>
        
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="p-12 text-center">
            <Sparkles className="h-12 w-12 text-[#667eea] mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Ready to integrate with recommendation API!</p>
            <Button className="rounded-lg bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white hover:opacity-90">
              <Sparkles className="h-4 w-4 mr-2" />
              Test Button
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}