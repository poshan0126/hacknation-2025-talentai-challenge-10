"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Plus,
  Download,
  User,
  Bot,
  Target,
} from "lucide-react";
import ProjectCard, { Project } from "../_components/recruiter/ProjectCard";
import AutomationPanel from "../_components/recruiter/AutomationPanel";
import CandidateTable, { Candidate } from "../_components/recruiter/CandidateTable";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

/* Optional: tiny pill Tabs inside this file for convenience */
function PillTabs({
  tabs,
  active,
  onChange,
  className,
}: {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label="Recruiter dashboard sections"
      className={cn(
        "mb-6 flex w-full flex-wrap gap-2 rounded-xl border border-slate-200 bg-white/70 p-1 backdrop-blur",
        className
      )}
    >
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={active === t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
            active === t.id
              ? "bg-white text-indigo-700 shadow-sm"
              : "text-slate-600 hover:bg-white/60"
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export default function RecruiterDashboard() {
  const [activeTab, setActiveTab] = useState<"projects" | "candidates" | "automation" | "analytics">("projects");
  const [automationEnabled, setAutomationEnabled] = useState(false);

  // Mock recruiter projects
  const projects = [
    {
      id: "1",
      project_name: "Senior Full-Stack Developer",
      status: "challenging",
      target_candidates: ["1", "2", "3"],
      automation_enabled: true,
      required_skills: ["React", "Node.js", "TypeScript"],
      final_ranking: [
        { developer_id: "1", fit_score: 94, rank: 1 },
        { developer_id: "2", fit_score: 87, rank: 2 },
      ],
    },
    {
      id: "2",
      project_name: "DevOps Engineer — Cloud Native",
      status: "idle",
      target_candidates: [],
      automation_enabled: false,
      required_skills: ["Kubernetes", "AWS", "Docker", "Terraform"],
      final_ranking: [],
    },
  ];

  // Mock candidates from global ranking
  const candidates = [
    {
      id: "1",
      full_name: "Sarah Johnson",
      dev_score: 967,
      fit_score: 94,
      skills: ["React", "Node.js", "TypeScript", "GraphQL"],
      validation_status: "fully_validated",
      availability: "available",
    },
    {
      id: "2",
      full_name: "Marcus Chen",
      dev_score: 943,
      fit_score: 91,
      skills: ["Python", "Django", "PostgreSQL", "AWS"],
      validation_status: "fully_validated",
      availability: "open_to_offers",
    },
  ];

  const searchParams = useSearchParams();
  const role = searchParams.get("role") ?? undefined;

  return (
    <div className="min-h-screen bg-[radial-gradient(60%_60%_at_50%_-10%,#eef2ff_0%,#f8fafc_35%,#ffffff_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:mb-8 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Recruiter Command Center
            </h1>
            <p className="mt-1 text-sm text-slate-600">AI-powered talent acquisition</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setAutomationEnabled((v) => !v)}
              className={cn(
                "gap-2 text-white",
                automationEnabled ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700"
              )}
            >
              <Bot className="h-4 w-4" />
              {automationEnabled ? "Disable AI" : "Enable AI"}
            </Button>
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <PillTabs
          tabs={[
            { id: "projects", label: "Projects" },
            { id: "automation", label: "Automation" },
            { id: "analytics", label: "Analytics" },
          ]}
          active={activeTab}
          onChange={(id) => setActiveTab(id as typeof activeTab)}
        />

        {/* KPI Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-slate-200/70 bg-white/80 backdrop-blur">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-600">
                    Active Projects
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">{projects.length}</p>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
                  <User className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/70 bg-white/80 backdrop-blur">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-600">
                    Candidates Evaluated
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">247</p>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/70 bg-white/80 backdrop-blur">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-600">
                    AI Automation
                  </p>
                  <p className={cn("mt-1 text-sm font-semibold", automationEnabled ? "text-emerald-700" : "text-slate-600")}>
                    {automationEnabled ? "Active" : "Inactive"}
                  </p>
                </div>
                <div
                  className={cn(
                    "grid h-12 w-12 place-items-center rounded-lg text-white",
                    automationEnabled
                      ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                      : "bg-slate-400"
                  )}
                >
                  <Bot className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/70 bg-white/80 backdrop-blur">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-600">
                    Success Rate
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">94%</p>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 text-white">
                  <Target className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Content */}
        {activeTab === "projects" && (
          <div className="grid gap-6 lg:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={ project as Project} role={role} />
            ))}
          </div>
        )}

        {activeTab === "candidates" && <CandidateTable candidates={candidates as Candidate[]} />}

        {activeTab === "automation" && (
          <AutomationPanel
            automationEnabled={automationEnabled}
            onToggle={() => setAutomationEnabled((v) => !v)}
          />
        )}

        {activeTab === "analytics" && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-slate-200/70 bg-white/80 backdrop-blur">
              <CardHeader className="border-b border-slate-200/70 bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-white">
                <CardTitle className="text-base font-semibold">Hiring Velocity</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="mb-1 text-3xl font-semibold text-slate-900">12.5</div>
                  <p className="text-sm text-slate-600">Avg days to hire</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200/70 bg-white/80 backdrop-blur">
              <CardHeader className="border-b border-slate-200/70 bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-white">
                <CardTitle className="text-base font-semibold">Quality Score</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="mb-1 text-3xl font-semibold text-slate-900">92%</div>
                  <p className="text-sm text-slate-600">Candidate satisfaction</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200/70 bg-white/80 backdrop-blur">
              <CardHeader className="border-b border-slate-200/70 bg-gradient-to-r from-pink-500 to-rose-600 py-3 text-white">
                <CardTitle className="text-base font-semibold">Cost Efficiency</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="mb-1 text-3xl font-semibold text-slate-900">-47%</div>
                  <p className="text-sm text-slate-600">Reduction in costs</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
