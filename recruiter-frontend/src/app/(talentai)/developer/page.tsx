"use client";

import { useMemo, useState } from "react";
import {
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  User,
  Zap,
  Star,
  TrendingUp,
} from "lucide-react";

// External modular components (keep your originals)
import ProfileForm from "../_components/developer/ProfileForm";
import ChallengeCard from "../_components/developer/ChallengeCard";
import TopRecruiters from "../_components/developer/TopRecruiters";
import SkillsGraph from "../_components/developer/SkillGraphs";
import { PageShell, PortalHeader, MetricCard, StatusBadge, ValidationStatus, MetricPanel, TabId } from "../_components/developer/uis";
import { SectionCard } from "../_components/developer/SectionCard";
import { KPI } from "../_components/developer/kpi";
import { Tabs } from "../_components/developer/Tabs";
import { usePathname, useSearchParams } from "next/navigation";


export default function DeveloperPortal() {
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [showProfileForm, setShowProfileForm] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") ?? undefined;

  // Mock developer data (kept here for the demo)
  const developer = useMemo(
    () => ({
      full_name: "Alex Chen",
      email: "alex@example.com",
      bio: "Full‑stack developer passionate about AI and blockchain",
      location: "San Francisco, CA",
      experience_level: "senior",
      dev_score: 847,
      validation_status: "partially_validated" as ValidationStatus,
      skills: [
        { name: "React", level: 95, validated: true },
        { name: "Node.js", level: 88, validated: true },
        { name: "Python", level: 82, validated: false },
        { name: "TypeScript", level: 90, validated: true },
        { name: "GraphQL", level: 75, validated: false },
      ],
      portfolio_links: ["https://github.com/alexchen", "https://alexchen.dev"],
      availability: "open_to_offers",
    }),
    []
  );

  const recommendedChallenges = useMemo(
    () => [
      {
        id: "1",
        title: "React Performance Optimization",
        description: "Optimize a slow React application using modern techniques",
        difficulty: "intermediate",
        skills_tested: ["React", "JavaScript", "Performance"],
        time_limit: 90,
        challenge_type: "coding",
        max_score: 100,
      },
      {
        id: "2",
        title: "Microservices Design Challenge",
        description: "Design a scalable microservices architecture",
        difficulty: "advanced",
        skills_tested: ["System Design", "Architecture", "Scalability"],
        time_limit: 120,
        challenge_type: "system_design",
        max_score: 150,
      },
    ],
    []
  );

  return (
    <PageShell>
      <PortalHeader
        developer={developer}
        onEdit={() => setShowProfileForm(true)}
        role={role}
      />
      <Tabs
        active={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: "profile", label: "Profile", icon: User },
          { id: "challenges", label: "Challenges", icon: Zap },
          { id: "analytics", label: "Analytics", icon: TrendingUp },
        ]}
        role={role}
      />
      {activeTab === "profile" && (
        <div className="space-y-4 md:space-y-6">
          {/* 1️⃣ Profile Summary */}
          <SectionCard
            titleIcon={User}
            title="Profile Summary"
          >
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg">
                <User className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-balance text-xl font-bold text-slate-900">
                {developer.full_name}
              </h3>
              <p className="mt-1 text-sm font-medium text-slate-600">
                {developer.location}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <MetricCard
                title="Dev Score"
                value={developer.dev_score}
                trend="+12 this week"
                gradient="from-emerald-50 to-green-50"
                valueClass="text-emerald-600"
              />

              <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-violet-50 to-purple-50 p-4 shadow-sm transition-colors hover:bg-violet-50/80 hover:shadow-md">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Experience Level
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-violet-600" />
                  <span className="capitalize font-bold text-violet-700">
                    {developer.experience_level}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <StatusBadge status={developer.validation_status} />
            </div>
          </SectionCard>

          {/* 2️⃣ Skills Metrics */}
          <SectionCard
            titleIcon={TrendingUp}
            title="Skills Overview"
          >
            <SkillsGraph skills={developer.skills} />
          </SectionCard>

          {/* 3️⃣ Top Recruiters */}
          {role === "developer" && <TopRecruiters />}
        </div>
      )}

      {activeTab === "challenges" && role === "developer" && (
        <SectionCard gradient="from-purple-600 to-pink-600" titleIcon={Zap} title="Recommended Challenges">
          <div className="grid gap-4 md:grid-cols-2">
            {recommendedChallenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        </SectionCard>
      )}

      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Completion Rate */}
          <MetricPanel gradient="from-blue-500 to-cyan-600" title="Completion Rate">
            <KPI
              value="78%"
              caption="Challenge completion rate"
              delta={{ label: "+6.2% vs last week", tone: "up" }}
              spark={[62, 64, 66, 70, 69, 73, 78]}
            >
              <Progress value={78} className="h-2 mt-3" />
            </KPI>
          </MetricPanel>

          {/* Average Score */}
          <MetricPanel gradient="from-emerald-500 to-green-600" title="Average Score">
            <KPI
              value="89.2"
              caption="Average across last 5 challenges"
              delta={{ label: "+1.8", tone: "up" }}
              spark={[84, 86, 87, 88, 89, 90, 89.2]}
            />
          </MetricPanel>

          {/* Global Rank */}
          <MetricPanel gradient="from-violet-500 to-purple-600" title="Global Rank">
            <KPI
              value="#247"
              caption="Out of 12,847 developers"
              delta={{ label: "↑ 31 places", tone: "up" }}
              spark={[410, 380, 352, 310, 295, 268, 247]}
              invert   // lower is better
            />
          </MetricPanel>
        </div>
      )}


      {/* Profile Form Modal */}
      {showProfileForm && (
        <ProfileForm
          developer={developer}
          onClose={() => setShowProfileForm(false)}
          onSave={(data) => {
            // Replace with actual save
            console.log("Saving profile:", data);
            setShowProfileForm(false);
          }}
        />
      )}
    </PageShell>
  );
}
