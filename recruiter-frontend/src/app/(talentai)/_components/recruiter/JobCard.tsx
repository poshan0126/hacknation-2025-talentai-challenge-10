"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Calendar,
  Users,
  Clock,
  Building2,
  DollarSign,
  MoreVertical,
  Edit,
  Archive,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

export interface Job {
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
  description?: string;
}

export default function JobCard({ job }: { job: Job }) {
  const router = useRouter();
  const daysLeft = React.useMemo(() => {
    const expiry = new Date(job.expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, [job.expiryDate]);

  const urgencyColors = {
    high: "border-red-200 bg-red-50 text-red-700",
    medium: "border-amber-200 bg-amber-50 text-amber-700",
    low: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };

  const typeColors = {
    "full-time": "border-blue-200 bg-blue-50 text-blue-700",
    "part-time": "border-purple-200 bg-purple-50 text-purple-700",
    "contract": "border-orange-200 bg-orange-50 text-orange-700",
    "internship": "border-pink-200 bg-pink-50 text-pink-700",
  };

  return (
    <Card className={cn(
      "border-gray-200 bg-white shadow-sm hover:shadow-md transition-all",
      job.status === "expired" && "opacity-75"
    )}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {job.title}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />
                {job.department}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {job.location}
              </span>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Edit Job
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge className={cn("rounded-md px-2 py-0.5 text-xs", typeColors[job.type])}>
            {job.type.replace("-", " ")}
          </Badge>
          <Badge className={cn("rounded-md px-2 py-0.5 text-xs", urgencyColors[job.urgency])}>
            {job.urgency} priority
          </Badge>
          {job.status === "active" && daysLeft <= 7 && (
            <Badge className="rounded-md px-2 py-0.5 text-xs border-red-200 bg-red-50 text-red-700">
              Expires in {daysLeft} days
            </Badge>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 p-3">
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
              <Users className="h-3.5 w-3.5" />
              Applicants
            </div>
            <div className="text-xl font-semibold text-gray-900">{job.applicants}</div>
          </div>
          
          <div className="rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 p-3">
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
              <DollarSign className="h-3.5 w-3.5" />
              Salary
            </div>
            <div className="text-base font-semibold text-gray-900">{job.salary}</div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Posted {new Date(job.postedDate).toLocaleDateString()}
            </span>
            {job.status === "expired" && (
              <span className="flex items-center gap-1 text-red-600">
                <Clock className="h-3.5 w-3.5" />
                Expired
              </span>
            )}
          </div>
          
          <Button 
            size="sm" 
            onClick={() => router.push(`/jobs/${job.id}`)}
            className={cn(
              "rounded-lg",
              job.status === "active" 
                ? "bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white hover:opacity-90"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            )}
          >
            {job.status === "active" ? "View Applications" : "View Details"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}