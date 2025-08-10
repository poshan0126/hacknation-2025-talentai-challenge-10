"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Target,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  Award,
  AlertCircle,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  FileText,
  Download,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter" | "year">("month");

  return (
    <div className="px-8 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
            Analytics & Insights
          </h1>
          <p className="mt-1 text-gray-600">
            Comprehensive hiring metrics and performance analysis
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Time Range Selector */}
          <div className="flex rounded-lg border border-gray-200 bg-white p-1">
            {(["week", "month", "quarter", "year"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-all",
                  timeRange === range
                    ? "bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                {range}
              </button>
            ))}
          </div>
          
          <Button variant="outline" className="rounded-lg border-gray-300 hover:bg-gray-50">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          
          <Button variant="outline" className="rounded-lg border-gray-300 hover:bg-gray-50">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Positions Filled</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
                <p className="text-xs text-green-600 mt-1">+12% from last {timeRange}</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/10 p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Time to Hire</p>
                <p className="text-2xl font-bold text-gray-900">18 days</p>
                <p className="text-xs text-amber-600 mt-1">-2 days from last {timeRange}</p>
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
                <p className="text-sm font-medium text-gray-600">Cost per Hire</p>
                <p className="text-2xl font-bold text-gray-900">$3,420</p>
                <p className="text-xs text-red-600 mt-1">+5% from last {timeRange}</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-[#667eea]/10 to-[#764ba2]/10 p-3">
                <DollarSign className="h-6 w-6 text-[#667eea]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Offer Accept Rate</p>
                <p className="text-2xl font-bold text-gray-900">87%</p>
                <p className="text-xs text-green-600 mt-1">+3% from last {timeRange}</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 p-3">
                <Award className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        {/* Hiring Metrics */}
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-[#667eea]/5 to-[#764ba2]/5">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <TrendingUp className="h-4 w-4 text-[#667eea]" />
              Hiring Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Quality of Hire Score</span>
                  <span className="font-semibold text-[#667eea]">92/100</span>
                </div>
                <div className="h-2 rounded-full bg-gray-200">
                  <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-[#667eea] to-[#764ba2]" />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">First Year Retention</span>
                  <span className="font-semibold text-green-600">94%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-200">
                  <div className="h-full w-[94%] rounded-full bg-gradient-to-r from-green-500 to-green-600" />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Candidate Satisfaction</span>
                  <span className="font-semibold text-emerald-600">4.6/5.0</span>
                </div>
                <div className="h-2 rounded-full bg-gray-200">
                  <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600" />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Hiring Manager Satisfaction</span>
                  <span className="font-semibold text-blue-600">88%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-200">
                  <div className="h-full w-[88%] rounded-full bg-gradient-to-r from-blue-500 to-blue-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pipeline Health */}
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-emerald-500/5 to-emerald-600/5">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Target className="h-4 w-4 text-emerald-600" />
              Recruitment Pipeline Health
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Applications Received</span>
                  <span className="text-sm font-medium text-gray-900">342</span>
                </div>
                <div className="h-2 rounded-full bg-gray-200">
                  <div className="h-full w-[100%] rounded-full bg-gradient-to-r from-[#667eea] to-[#764ba2]" />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Phone Screening</span>
                  <span className="text-sm font-medium text-gray-900">124</span>
                </div>
                <div className="h-2 rounded-full bg-gray-200">
                  <div className="h-full w-[36%] rounded-full bg-gradient-to-r from-blue-500 to-blue-600" />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Technical Assessment</span>
                  <span className="text-sm font-medium text-gray-900">68</span>
                </div>
                <div className="h-2 rounded-full bg-gray-200">
                  <div className="h-full w-[20%] rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600" />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Final Interview</span>
                  <span className="text-sm font-medium text-gray-900">32</span>
                </div>
                <div className="h-2 rounded-full bg-gray-200">
                  <div className="h-full w-[9%] rounded-full bg-gradient-to-r from-amber-500 to-amber-600" />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Offers Extended</span>
                  <span className="text-sm font-medium text-gray-900">24</span>
                </div>
                <div className="h-2 rounded-full bg-gray-200">
                  <div className="h-full w-[7%] rounded-full bg-gradient-to-r from-green-500 to-green-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Analytics */}
      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <PieChart className="h-4 w-4 text-[#667eea]" />
              Hiring by Department
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#667eea]" />
                  <span className="text-sm text-gray-600">Engineering</span>
                </div>
                <span className="text-sm font-semibold">42%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-emerald-500" />
                  <span className="text-sm text-gray-600">Sales</span>
                </div>
                <span className="text-sm font-semibold">28%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-amber-500" />
                  <span className="text-sm text-gray-600">Marketing</span>
                </div>
                <span className="text-sm font-semibold">18%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  <span className="text-sm text-gray-600">Operations</span>
                </div>
                <span className="text-sm font-semibold">12%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Activity className="h-4 w-4 text-emerald-600" />
              Source Effectiveness
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">LinkedIn</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-20 rounded-full bg-gray-200">
                    <div className="h-full w-[75%] rounded-full bg-gradient-to-r from-[#667eea] to-[#764ba2]" />
                  </div>
                  <span className="text-xs font-medium">34%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Employee Referrals</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-20 rounded-full bg-gray-200">
                    <div className="h-full w-[60%] rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600" />
                  </div>
                  <span className="text-xs font-medium">28%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Job Boards</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-20 rounded-full bg-gray-200">
                    <div className="h-full w-[45%] rounded-full bg-gradient-to-r from-amber-500 to-amber-600" />
                  </div>
                  <span className="text-xs font-medium">22%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Company Website</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-20 rounded-full bg-gray-200">
                    <div className="h-full w-[35%] rounded-full bg-gradient-to-r from-blue-500 to-blue-600" />
                  </div>
                  <span className="text-xs font-medium">16%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              Areas of Concern
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-sm font-medium text-amber-900">High Drop-off Rate</p>
                <p className="text-xs text-amber-700 mt-1">Technical assessment stage: 45% drop</p>
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm font-medium text-red-900">Time to Fill Critical Roles</p>
                <p className="text-xs text-red-700 mt-1">Senior positions: avg 42 days</p>
              </div>
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                <p className="text-sm font-medium text-orange-900">Diversity Metrics</p>
                <p className="text-xs text-orange-700 mt-1">Below target by 15%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trends and Forecasts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <BarChart3 className="h-4 w-4 text-[#667eea]" />
              Monthly Hiring Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((month, index) => {
                const value = [12, 18, 15, 22, 28, 24][index];
                const maxValue = 30;
                const percentage = (value / maxValue) * 100;
                
                return (
                  <div key={month} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-10">{month}</span>
                    <div className="flex-1 h-6 rounded-lg bg-gray-200 relative">
                      <div 
                        className="h-full rounded-lg bg-gradient-to-r from-[#667eea] to-[#764ba2] flex items-center justify-end pr-2"
                        style={{ width: `${percentage}%` }}
                      >
                        <span className="text-xs text-white font-semibold">{value}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Calendar className="h-4 w-4 text-emerald-600" />
              Upcoming Milestones
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Q2 Hiring Goals</p>
                  <p className="text-xs text-gray-600">On track: 24/30 positions filled</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-amber-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Campus Recruitment Drive</p>
                  <p className="text-xs text-gray-600">Starting in 2 weeks</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Diversity Initiative Review</p>
                  <p className="text-xs text-gray-600">Due in 3 weeks</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-[#667eea]" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Annual Compensation Benchmarking</p>
                  <p className="text-xs text-gray-600">Scheduled for next month</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}