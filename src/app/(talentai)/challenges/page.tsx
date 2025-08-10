"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Plus,
  Search,
  Eye,
  CheckCircle,
} from "lucide-react";
import ChallengeCard from "../_components/developer/ChallengeCard";
import { cn } from "@/lib/utils";

export default function Challenges() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [difficulty, setDifficulty] = React.useState<
    "all" | "beginner" | "intermediate" | "advanced" | "expert"
  >("all");

  // Mock challenges
  const challenges = [
    {
      id: "1",
      title: "React Performance Optimization",
      description:
        "Optimize a slow React application using memoization, code splitting, and lazy loading.",
      difficulty: "intermediate",
      skills_tested: ["React", "JavaScript", "Performance"],
      time_limit: 90,
      challenge_type: "coding",
      max_score: 100,
      is_public: true,
      creator: "AI",
    },
    {
      id: "2",
      title: "Microservices Design Challenge",
      description:
        "Design a scalable microservices architecture for an e-commerce platform.",
      difficulty: "advanced",
      skills_tested: ["System Design", "Architecture", "Scalability"],
      time_limit: 120,
      challenge_type: "system_design",
      max_score: 150,
      is_public: true,
      creator: "AI",
    },
    {
      id: "3",
      title: "Algorithm Optimization",
      description:
        "Solve algorithmic problems with optimal time and space complexity.",
      difficulty: "expert",
      skills_tested: ["Algorithms", "Data Structures", "Math"],
      time_limit: 60,
      challenge_type: "algorithm",
      max_score: 200,
      is_public: true,
      creator: "AI",
    },
  ];

  // Mock submissions
  const mySubmissions = [
    {
      id: "s1",
      challenge_id: "1",
      challenge_title: "React Performance Optimization",
      status: "graded",
      score: 87,
      max_score: 100,
      submitted_at: "2024-01-15",
      ai_feedback:
        "Excellent use of React.memo and useCallback. Consider refining bundle splitting strategy.",
    },
    {
      id: "s2",
      challenge_id: "2",
      challenge_title: "Microservices Design Challenge",
      status: "submitted",
      score: null,
      max_score: 150,
      submitted_at: "2024-01-16",
      ai_feedback: null,
    },
  ];

  const filtered = challenges.filter((c) => {
    const matchesSearch =
      !searchTerm ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.skills_tested.some((s) =>
        s.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesDiff = difficulty === "all" || c.difficulty === difficulty;
    return matchesSearch && matchesDiff;
  });

  return (
    <div className="min-h-screen bg-[radial-gradient(60%_60%_at_50%_-10%,#eef2ff_0%,#f8fafc_35%,#ffffff_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Challenge Center
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Validate your skills and level up your public ranking.
              </p>
            </div>
            <Button className="gap-2 bg-indigo-600 text-white hover:bg-indigo-700">
              <Plus className="h-4 w-4" />
              Create Challenge
            </Button>
          </div>
        </div>

        <Tabs defaultValue="available" className="space-y-6">
          <TabsList className="flex w-full justify-start gap-1 rounded-xl border border-slate-200 bg-white/80 p-1 backdrop-blur">
            <TabsTrigger
              value="available"
              className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm"
            >
              Available
            </TabsTrigger>
            <TabsTrigger
              value="submissions"
              className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm"
            >
              My Submissions
            </TabsTrigger>
          </TabsList>

          {/* AVAILABLE */}
          <TabsContent value="available" className="space-y-6">
            {/* Search + Difficulty */}
            <Card className="border-slate-200/70 bg-white/80 shadow-sm backdrop-blur">
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search challenges…"
                      className="pl-9"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(["all", "beginner", "intermediate", "advanced", "expert"] as const).map(
                      (d) => (
                        <Button
                          key={d}
                          type="button"
                          onClick={() => setDifficulty(d)}
                          variant={difficulty === d ? "default" : "outline"}
                          className={cn(
                            "h-9 rounded-lg",
                            difficulty === d
                              ? "bg-indigo-600 text-white hover:bg-indigo-700"
                              : "border-slate-200"
                          )}
                        >
                          {d[0].toUpperCase() + d.slice(1)}
                        </Button>
                      )
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Grid */}
            {filtered.length === 0 ? (
              <Card className="border-slate-200/70 bg-white/80 p-10 text-center text-slate-500">
                No challenges match your filters.
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((challenge) => (
                  <ChallengeCard key={challenge.id} challenge={challenge} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* SUBMISSIONS */}
          <TabsContent value="submissions">
            <Card className="border-slate-200/70 bg-white/80 shadow-sm backdrop-blur">
              <CardHeader className="border-b border-slate-200/70 bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-white">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Brain className="h-4 w-4" />
                  My Challenge Submissions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 sm:p-6">
                <div className="space-y-4">
                  {mySubmissions.map((s) => (
                    <div
                      key={s.id}
                      className="rounded-xl border border-slate-200 bg-slate-50/70 p-5"
                    >
                      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-base font-semibold text-slate-900">
                            {s.challenge_title}
                          </h3>
                          <p className="text-xs text-slate-500">
                            Submitted on {new Date(s.submitted_at).toLocaleDateString()}
                          </p>
                        </div>
                        <StatusBadge status={s.status as "submitted" | "graded" | "draft"} score={s.score} max={s.max_score} />
                      </div>

                      {s.ai_feedback && (
                        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50/70 p-4">
                          <div className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-900">
                            <Brain className="h-4 w-4 text-blue-600" />
                            AI Feedback
                          </div>
                          <p className="text-sm text-slate-700">{s.ai_feedback}</p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" className="gap-2">
                          <Eye className="h-4 w-4" />
                          View Details
                        </Button>
                        {s.status === "graded" && (
                          <Button className="gap-2 bg-indigo-600 text-white hover:bg-indigo-700">
                            <CheckCircle className="h-4 w-4" />
                            View Certificate
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  {mySubmissions.length === 0 && (
                    <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
                      You haven’t submitted any challenges yet.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/* ───────────── helpers ───────────── */

function StatusBadge({
  status,
  score,
  max,
}: {
  status: "submitted" | "graded" | "draft";
  score: number | null;
  max: number;
}) {
  if (status === "graded") {
    const pct = Math.round(((score || 0) / max) * 100);
    const cls =
      pct >= 80
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : pct >= 60
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-rose-200 bg-rose-50 text-rose-700";
    return (
      <Badge className={cn("rounded-md px-2.5 py-1 text-xs font-medium", cls)}>
        Scored {score}/{max} ({pct}%)
      </Badge>
    );
  }
  const map = {
    submitted: "border-blue-200 bg-blue-50 text-blue-700",
    draft: "border-slate-200 bg-slate-50 text-slate-700",
  } as const;
  return (
    <Badge
      className={cn(
        "rounded-md px-2.5 py-1 text-xs font-medium",
        map[status] ?? "border-slate-200 bg-slate-50 text-slate-700"
      )}
    >
      {status[0].toUpperCase() + status.slice(1)}
    </Badge>
  );
}
