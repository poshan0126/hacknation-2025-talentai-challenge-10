"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Plus,
  X,
  Save,
  Eye,
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  Code,
  FileText,
  Target,
  Award,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface JobFormData {
  title: string;
  department: string;
  location: string;
  type: "full-time" | "part-time" | "contract" | "internship";
  workArrangement: "remote" | "onsite" | "hybrid";
  salaryMin: string;
  salaryMax: string;
  currency: "USD" | "EUR" | "GBP";
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  skills: string[];
  experienceLevel: "entry" | "mid" | "senior" | "lead";
  urgency: "low" | "medium" | "high";
  expiryDays: string;
  debuggingChallenge: {
    enabled: boolean;
    title: string;
    description: string;
    codeSnippet: string;
    expectedOutput: string;
    timeLimit: string;
    difficulty: "easy" | "medium" | "hard";
    tags: string[];
  };
}

export default function NewJobPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    department: "",
    location: "",
    type: "full-time",
    workArrangement: "remote",
    salaryMin: "",
    salaryMax: "",
    currency: "USD",
    description: "",
    requirements: [],
    responsibilities: [],
    benefits: [],
    skills: [],
    experienceLevel: "mid",
    urgency: "medium",
    expiryDays: "30",
    debuggingChallenge: {
      enabled: false,
      title: "",
      description: "",
      codeSnippet: "",
      expectedOutput: "",
      timeLimit: "30",
      difficulty: "medium",
      tags: [],
    },
  });

  const [tempInputs, setTempInputs] = useState({
    requirement: "",
    responsibility: "",
    benefit: "",
    skill: "",
    challengeTag: "",
  });

  const steps = [
    { id: 1, title: "Basic Details", icon: Briefcase },
    { id: 2, title: "Job Description", icon: FileText },
    { id: 3, title: "Requirements", icon: Target },
    { id:4, title: "Debugging Challenge", icon: Code },
    { id: 5, title: "Review & Publish", icon: CheckCircle2 },
  ];

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateChallengeData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      debuggingChallenge: {
        ...prev.debuggingChallenge,
        [field]: value,
      },
    }));
  };

  const addToArray = (arrayName: keyof typeof tempInputs, inputName: keyof typeof tempInputs) => {
    const value = tempInputs[inputName].trim();
    if (value && !formData[arrayName as keyof JobFormData]?.includes(value)) {
      updateFormData(arrayName, [...(formData[arrayName as keyof JobFormData] as string[]), value]);
      setTempInputs(prev => ({ ...prev, [inputName]: "" }));
    }
  };

  const removeFromArray = (arrayName: keyof JobFormData, index: number) => {
    const currentArray = formData[arrayName] as string[];
    updateFormData(arrayName, currentArray.filter((_, i) => i !== index));
  };

  const addChallengeTag = () => {
    const value = tempInputs.challengeTag.trim();
    if (value && !formData.debuggingChallenge.tags.includes(value)) {
      updateChallengeData("tags", [...formData.debuggingChallenge.tags, value]);
      setTempInputs(prev => ({ ...prev, challengeTag: "" }));
    }
  };

  const removeChallengeTag = (index: number) => {
    updateChallengeData("tags", formData.debuggingChallenge.tags.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    // Here you would typically submit to an API
    console.log("Job posting data:", formData);
    // Redirect to dashboard or job details
    router.push("/dashboard");
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateFormData("title", e.target.value)}
                  placeholder="e.g., Senior Full-Stack Developer"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="department">Department *</Label>
                <Select value={formData.department} onValueChange={(value) => updateFormData("department", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="hr">Human Resources</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => updateFormData("location", e.target.value)}
                  placeholder="e.g., San Francisco, CA"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="type">Employment Type *</Label>
                <Select value={formData.type} onValueChange={(value) => updateFormData("type", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="workArrangement">Work Arrangement</Label>
                <Select value={formData.workArrangement} onValueChange={(value) => updateFormData("workArrangement", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="onsite">On-site</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="experienceLevel">Experience Level</Label>
                <Select value={formData.experienceLevel} onValueChange={(value) => updateFormData("experienceLevel", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entry Level</SelectItem>
                    <SelectItem value="mid">Mid Level</SelectItem>
                    <SelectItem value="senior">Senior Level</SelectItem>
                    <SelectItem value="lead">Lead/Principal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Salary Section */}
            <div>
              <Label>Salary Range</Label>
              <div className="flex gap-2 mt-1">
                <Select value={formData.currency} onValueChange={(value) => updateFormData("currency", value)}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Min"
                  value={formData.salaryMin}
                  onChange={(e) => updateFormData("salaryMin", e.target.value)}
                />
                <span className="self-center text-gray-500">to</span>
                <Input
                  placeholder="Max"
                  value={formData.salaryMax}
                  onChange={(e) => updateFormData("salaryMax", e.target.value)}
                />
              </div>
            </div>

            {/* Job Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="urgency">Urgency Level</Label>
                <Select value={formData.urgency} onValueChange={(value) => updateFormData("urgency", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="expiryDays">Job Posting Duration (Days)</Label>
                <Input
                  id="expiryDays"
                  type="number"
                  value={formData.expiryDays}
                  onChange={(e) => updateFormData("expiryDays", e.target.value)}
                  placeholder="30"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="description">Job Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                placeholder="Provide a detailed description of the role, what the candidate will be doing, and what makes this opportunity exciting..."
                rows={6}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Key Skills *</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={tempInputs.skill}
                  onChange={(e) => setTempInputs(prev => ({ ...prev, skill: e.target.value }))}
                  placeholder="Add a required skill"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addToArray("skills", "skill"))}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addToArray("skills", "skill")}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <button onClick={() => removeFromArray("skills", index)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label>Requirements</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={tempInputs.requirement}
                  onChange={(e) => setTempInputs(prev => ({ ...prev, requirement: e.target.value }))}
                  placeholder="Add a job requirement"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addToArray("requirements", "requirement"))}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addToArray("requirements", "requirement")}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2 mt-2">
                {formData.requirements.map((req, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                    <span className="text-sm">{req}</span>
                    <button onClick={() => removeFromArray("requirements", index)}>
                      <X className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Responsibilities</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={tempInputs.responsibility}
                  onChange={(e) => setTempInputs(prev => ({ ...prev, responsibility: e.target.value }))}
                  placeholder="Add a responsibility"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addToArray("responsibilities", "responsibility"))}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addToArray("responsibilities", "responsibility")}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2 mt-2">
                {formData.responsibilities.map((resp, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                    <span className="text-sm">{resp}</span>
                    <button onClick={() => removeFromArray("responsibilities", index)}>
                      <X className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Benefits</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={tempInputs.benefit}
                  onChange={(e) => setTempInputs(prev => ({ ...prev, benefit: e.target.value }))}
                  placeholder="Add a benefit"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addToArray("benefits", "benefit"))}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addToArray("benefits", "benefit")}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.benefits.map((benefit, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {benefit}
                    <button onClick={() => removeFromArray("benefits", index)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Code className="h-5 w-5 text-blue-600" />
              <div>
                <h4 className="font-medium text-blue-900">Custom Debugging Challenge</h4>
                <p className="text-sm text-blue-700">Create a tailored coding challenge to assess candidate skills</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enableChallenge"
                checked={formData.debuggingChallenge.enabled}
                onChange={(e) => updateChallengeData("enabled", e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="enableChallenge" className="text-sm font-medium">
                Enable debugging challenge for this position
              </Label>
            </div>

            {formData.debuggingChallenge.enabled && (
              <div className="space-y-4 border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="challengeTitle">Challenge Title *</Label>
                    <Input
                      id="challengeTitle"
                      value={formData.debuggingChallenge.title}
                      onChange={(e) => updateChallengeData("title", e.target.value)}
                      placeholder="e.g., Fix the Memory Leak"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="difficulty">Difficulty Level</Label>
                    <Select
                      value={formData.debuggingChallenge.difficulty}
                      onValueChange={(value) => updateChallengeData("difficulty", value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="challengeDescription">Challenge Description *</Label>
                  <Textarea
                    id="challengeDescription"
                    value={formData.debuggingChallenge.description}
                    onChange={(e) => updateChallengeData("description", e.target.value)}
                    placeholder="Describe the problem that needs to be solved..."
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="codeSnippet">Code Snippet (with bugs) *</Label>
                  <Textarea
                    id="codeSnippet"
                    value={formData.debuggingChallenge.codeSnippet}
                    onChange={(e) => updateChallengeData("codeSnippet", e.target.value)}
                    placeholder="// Paste your buggy code here
function calculateSum(arr) {
  let sum = 0;
  for(let i = 0; i <= arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}"
                    rows={8}
                    className="mt-1 font-mono text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="expectedOutput">Expected Output/Solution *</Label>
                  <Textarea
                    id="expectedOutput"
                    value={formData.debuggingChallenge.expectedOutput}
                    onChange={(e) => updateChallengeData("expectedOutput", e.target.value)}
                    placeholder="Describe the expected behavior or provide the corrected code..."
                    rows={4}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    value={formData.debuggingChallenge.timeLimit}
                    onChange={(e) => updateChallengeData("timeLimit", e.target.value)}
                    placeholder="30"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Challenge Tags</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={tempInputs.challengeTag}
                      onChange={(e) => setTempInputs(prev => ({ ...prev, challengeTag: e.target.value }))}
                      placeholder="e.g., JavaScript, Arrays, Loops"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addChallengeTag())}
                    />
                    <Button type="button" variant="outline" onClick={addChallengeTag}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.debuggingChallenge.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button onClick={() => removeChallengeTag(index)}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Review Your Job Posting</h4>
              <p className="text-sm text-green-700">
                Please review all the information below before publishing your job posting.
              </p>
            </div>

            {/* Job Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-[#667eea]" />
                  Job Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Title:</span>
                    <p className="font-medium">{formData.title || "Not specified"}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Department:</span>
                    <p className="font-medium capitalize">{formData.department || "Not specified"}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Location:</span>
                    <p className="font-medium">{formData.location || "Not specified"}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Type:</span>
                    <p className="font-medium capitalize">{formData.type.replace("-", " ")}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Salary:</span>
                    <p className="font-medium">
                      {formData.salaryMin && formData.salaryMax
                        ? `${formData.currency} ${formData.salaryMin} - ${formData.salaryMax}`
                        : "Not specified"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Experience:</span>
                    <p className="font-medium capitalize">{formData.experienceLevel.replace("-", " ")} Level</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            {formData.skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-[#667eea]" />
                    Required Skills ({formData.skills.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Debugging Challenge */}
            {formData.debuggingChallenge.enabled && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5 text-[#667eea]" />
                    Debugging Challenge
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">Title:</span>
                    <p className="font-medium">{formData.debuggingChallenge.title}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Difficulty:</span>
                    <Badge className={cn(
                      "ml-2",
                      formData.debuggingChallenge.difficulty === "easy" && "bg-green-100 text-green-800",
                      formData.debuggingChallenge.difficulty === "medium" && "bg-yellow-100 text-yellow-800",
                      formData.debuggingChallenge.difficulty === "hard" && "bg-red-100 text-red-800"
                    )}>
                      {formData.debuggingChallenge.difficulty}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Time Limit:</span>
                    <p className="font-medium">{formData.debuggingChallenge.timeLimit} minutes</p>
                  </div>
                  {formData.debuggingChallenge.tags.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-600">Tags:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {formData.debuggingChallenge.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        );

      default:
        return null;
    }
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
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
              Post New Job
            </h1>
            <p className="text-gray-600">Create a comprehensive job posting with custom challenges</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                      isActive && "border-[#667eea] bg-[#667eea] text-white",
                      isCompleted && "border-green-500 bg-green-500 text-white",
                      !isActive && !isCompleted && "border-gray-300 bg-white text-gray-400"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "mt-2 text-xs font-medium",
                      isActive && "text-[#667eea]",
                      isCompleted && "text-green-600",
                      !isActive && !isCompleted && "text-gray-400"
                    )}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "mx-4 h-0.5 w-16 bg-gray-300",
                      isCompleted && "bg-green-500"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {React.createElement(steps[currentStep - 1].icon, { className: "h-5 w-5 text-[#667eea]" })}
            {steps[currentStep - 1].title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
          disabled={currentStep === 1}
          className="rounded-lg"
        >
          Previous
        </Button>

        <div className="flex gap-2">
          {currentStep === 5 ? (
            <>
              <Button
                variant="outline"
                onClick={() => console.log("Save as draft")}
                className="rounded-lg"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Draft
              </Button>
              <Button
                onClick={handleSubmit}
                className="rounded-lg bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white hover:opacity-90"
              >
                <Eye className="mr-2 h-4 w-4" />
                Publish Job
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setCurrentStep(prev => Math.min(5, prev + 1))}
              className="rounded-lg bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white hover:opacity-90"
            >
              Next Step
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}