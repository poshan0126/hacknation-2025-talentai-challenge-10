"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Plus,
  Download,
  Briefcase,
  Clock,
  CheckCircle,
} from "lucide-react";
import JobCard, { Job } from "../_components/recruiter/JobCard";
import { cn } from "@/lib/utils";

export default function RecruiterDashboard() {
  const [jobTab, setJobTab] = useState<"active" | "expired">("active");

  // Mock jobs data
  const activeJobs: Job[] = [
    {
      id: "1",
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
    },
    {
      id: "2",
      title: "DevOps Engineer",
      department: "Infrastructure",
      location: "Remote",
      type: "full-time",
      salary: "$100k - $150k",
      postedDate: "2024-01-10",
      expiryDate: "2024-02-20",
      applicants: 32,
      status: "active",
      urgency: "medium",
    },
    {
      id: "3",
      title: "Product Manager",
      department: "Product",
      location: "New York, NY",
      type: "full-time",
      salary: "$130k - $170k",
      postedDate: "2024-01-12",
      expiryDate: "2024-02-25",
      applicants: 28,
      status: "active",
      urgency: "low",
    },
    {
      id: "4",
      title: "UI/UX Designer",
      department: "Design",
      location: "Austin, TX",
      type: "contract",
      salary: "$85k - $120k",
      postedDate: "2024-01-08",
      expiryDate: "2024-02-08",
      applicants: 21,
      status: "active",
      urgency: "high",
    },
  ];

  const expiredJobs: Job[] = [
    {
      id: "5",
      title: "Data Scientist",
      department: "Analytics",
      location: "Boston, MA",
      type: "full-time",
      salary: "$110k - $160k",
      postedDate: "2023-12-01",
      expiryDate: "2024-01-01",
      applicants: 65,
      status: "expired",
      urgency: "medium",
    },
    {
      id: "6",
      title: "Marketing Intern",
      department: "Marketing",
      location: "Chicago, IL",
      type: "internship",
      salary: "$20/hour",
      postedDate: "2023-11-15",
      expiryDate: "2023-12-15",
      applicants: 43,
      status: "expired",
      urgency: "low",
    },
  ];

  const displayJobs = jobTab === "active" ? activeJobs : expiredJobs;

  return (
    <div className="px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
          Recruiter Command Center
        </h1>
        <p className="mt-1 text-gray-600">
          Manage your hiring pipeline with AI-powered insights
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{activeJobs.length}</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-[#667eea]/10 to-[#764ba2]/10 p-3">
                <Briefcase className="h-6 w-6 text-[#667eea]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeJobs.reduce((sum, job) => sum + job.applicants, 0)}
                </p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 p-3">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Interviews Scheduled</p>
                <p className="text-2xl font-bold text-gray-900">18</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/10 p-3">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Positions Filled</p>
                <p className="text-2xl font-bold text-gray-900">7</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/10 p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Jobs Section */}
      <div className="mb-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">Job Postings</h2>
            
            {/* Tab Buttons */}
            <div className="flex rounded-lg border border-gray-200 bg-white p-1">
              <button
                onClick={() => setJobTab("active")}
                className={cn(
                  "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                  jobTab === "active"
                    ? "bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                Active Jobs ({activeJobs.length})
              </button>
              <button
                onClick={() => setJobTab("expired")}
                className={cn(
                  "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                  jobTab === "expired"
                    ? "bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                Expired Jobs ({expiredJobs.length})
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => window.location.href = '/jobs/new'}
              className="rounded-lg bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white hover:opacity-90 transition-opacity"
            >
              <Plus className="mr-2 h-4 w-4" />
              Post New Job
            </Button>
            <Button variant="outline" className="rounded-lg border-gray-300 hover:bg-gray-50">
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Jobs Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          {displayJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </div>

    </div>
  );
}