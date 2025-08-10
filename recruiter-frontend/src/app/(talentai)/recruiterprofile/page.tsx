"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  MapPin,
  Star,
  Trophy,
  CheckCircle,
  Users,
  Clock,
  Mail,
  Phone,
  LinkedinIcon,
  Globe,
  Building2,
  BriefcaseIcon,
  Calendar,
  Settings,
  Shield,
  Bell,
  Edit3,
  Save,
  Award,
  Target,
  Camera,
  Plus,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function RecruiterProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState<"profile" | "preferences" | "security">("profile");
  
  const [formData, setFormData] = useState({
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@talentai.com",
    phone: "+1 (555) 123-4567",
    title: "Senior HR Manager",
    company: "TalentAI Corp",
    location: "San Francisco, CA",
    bio: "Experienced HR professional with 8+ years in talent acquisition and management. Passionate about connecting great people with amazing opportunities and building diverse, inclusive teams.",
    specializations: ["Technical Recruiting", "Executive Search", "Diversity & Inclusion", "Team Building"],
    linkedin: "linkedin.com/in/sarah-johnson",
    website: "sarahjohnsonhr.com",
    timezone: "Pacific Time (PT)",
    workHours: "9:00 AM - 6:00 PM",
  });

  const [tempSpecialization, setTempSpecialization] = useState("");

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSpecialization = () => {
    if (tempSpecialization.trim() && !formData.specializations.includes(tempSpecialization.trim())) {
      setFormData(prev => ({
        ...prev,
        specializations: [...prev.specializations, tempSpecialization.trim()]
      }));
      setTempSpecialization("");
    }
  };

  const removeSpecialization = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    // Here you would save to API
    console.log("Saving profile data:", formData);
    setIsEditing(false);
  };

  const stats = [
    { label: "Active Jobs", value: "12", icon: BriefcaseIcon, color: "text-blue-600" },
    { label: "Total Hires", value: "247", icon: Users, color: "text-green-600" },
    { label: "Success Rate", value: "94%", icon: Target, color: "text-purple-600" },
    { label: "Avg Response", value: "2.3h", icon: Clock, color: "text-orange-600" },
  ];

  const achievements = [
    { title: "Top Recruiter 2024", description: "Highest hiring success rate", icon: Trophy, color: "text-yellow-600" },
    { title: "Fast Responder", description: "Average response under 4 hours", icon: Clock, color: "text-blue-600" },
    { title: "Quality Hires", description: "95% candidate retention rate", icon: Award, color: "text-green-600" },
  ];

  return (
    <div className="px-8 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
            My Profile
          </h1>
          <p className="mt-1 text-gray-600">Manage your recruiter profile and preferences</p>
        </div>
        
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="rounded-lg"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="rounded-lg bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white hover:opacity-90"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              className="rounded-lg bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white hover:opacity-90"
            >
              <Edit3 className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1">
          <Card className="border-gray-200 bg-white shadow-sm">
            <CardContent className="p-6">
              {/* Profile Picture */}
              <div className="mb-6 text-center">
                <div className="relative mx-auto mb-4 h-24 w-24">
                  <div className="h-24 w-24 rounded-xl bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-white">
                    <User className="h-12 w-12" />
                  </div>
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 rounded-full bg-white p-1.5 shadow-sm border border-gray-200 hover:bg-gray-50">
                      <Camera className="h-3.5 w-3.5 text-gray-600" />
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {formData.firstName} {formData.lastName}
                  </h3>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-sm text-gray-600">{formData.title}</p>
                <p className="text-sm font-medium text-[#667eea]">{formData.company}</p>
              </div>

              {/* Quick Stats */}
              <div className="mb-6 space-y-3">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-white p-2">
                          <Icon className={cn("h-4 w-4", stat.color)} />
                        </div>
                        <span className="text-sm text-gray-600">{stat.label}</span>
                      </div>
                      <span className="font-semibold text-gray-900">{stat.value}</span>
                    </div>
                  );
                })}
              </div>

              {/* Achievements */}
              <div>
                <h4 className="mb-3 text-sm font-semibold text-gray-900">Recent Achievements</h4>
                <div className="space-y-3">
                  {achievements.map((achievement, index) => {
                    const Icon = achievement.icon;
                    return (
                      <div key={index} className="flex items-start gap-3 rounded-lg border border-gray-200 p-3">
                        <Icon className={cn("h-5 w-5 mt-0.5", achievement.color)} />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{achievement.title}</p>
                          <p className="text-xs text-gray-600">{achievement.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Profile Details */}
        <div className="lg:col-span-2">
          <Card className="border-gray-200 bg-white shadow-sm">
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <User className="h-4 w-4 text-[#667eea]" />
                  Profile Information
                </CardTitle>
                <div className="flex rounded-lg border border-gray-200 bg-white p-1">
                  <button
                    onClick={() => setActiveSection("profile")}
                    className={cn(
                      "px-3 py-1 rounded-md text-sm font-medium transition-all",
                      activeSection === "profile"
                        ? "bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white"
                        : "text-gray-600 hover:text-gray-900"
                    )}
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => setActiveSection("preferences")}
                    className={cn(
                      "px-3 py-1 rounded-md text-sm font-medium transition-all",
                      activeSection === "preferences"
                        ? "bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white"
                        : "text-gray-600 hover:text-gray-900"
                    )}
                  >
                    Preferences
                  </button>
                  <button
                    onClick={() => setActiveSection("security")}
                    className={cn(
                      "px-3 py-1 rounded-md text-sm font-medium transition-all",
                      activeSection === "security"
                        ? "bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white"
                        : "text-gray-600 hover:text-gray-900"
                    )}
                  >
                    Security
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {activeSection === "profile" && (
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="mb-4 text-sm font-semibold text-gray-900">Personal Information</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => updateField("firstName", e.target.value)}
                          disabled={!isEditing}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => updateField("lastName", e.target.value)}
                          disabled={!isEditing}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => updateField("email", e.target.value)}
                          disabled={!isEditing}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => updateField("phone", e.target.value)}
                          disabled={!isEditing}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div>
                    <h3 className="mb-4 text-sm font-semibold text-gray-900">Professional Information</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="title">Job Title</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => updateField("title", e.target.value)}
                          disabled={!isEditing}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          value={formData.company}
                          onChange={(e) => updateField("company", e.target.value)}
                          disabled={!isEditing}
                          className="mt-1"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => updateField("location", e.target.value)}
                          disabled={!isEditing}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <Label htmlFor="bio">Professional Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => updateField("bio", e.target.value)}
                      disabled={!isEditing}
                      rows={4}
                      className="mt-1"
                    />
                  </div>

                  {/* Specializations */}
                  <div>
                    <Label>Areas of Specialization</Label>
                    {isEditing && (
                      <div className="flex gap-2 mt-1 mb-3">
                        <Input
                          value={tempSpecialization}
                          onChange={(e) => setTempSpecialization(e.target.value)}
                          placeholder="Add specialization"
                          onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSpecialization())}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addSpecialization}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {formData.specializations.map((spec, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {spec}
                          {isEditing && (
                            <button onClick={() => removeSpecialization(index)}>
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Social Links */}
                  <div>
                    <h3 className="mb-4 text-sm font-semibold text-gray-900">Social Links</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="linkedin">LinkedIn Profile</Label>
                        <Input
                          id="linkedin"
                          value={formData.linkedin}
                          onChange={(e) => updateField("linkedin", e.target.value)}
                          disabled={!isEditing}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="website">Personal Website</Label>
                        <Input
                          id="website"
                          value={formData.website}
                          onChange={(e) => updateField("website", e.target.value)}
                          disabled={!isEditing}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "preferences" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-4 text-sm font-semibold text-gray-900">Work Preferences</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select value={formData.timezone} onValueChange={(value) => updateField("timezone", value)} disabled={!isEditing}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pacific Time (PT)">Pacific Time (PT)</SelectItem>
                            <SelectItem value="Mountain Time (MT)">Mountain Time (MT)</SelectItem>
                            <SelectItem value="Central Time (CT)">Central Time (CT)</SelectItem>
                            <SelectItem value="Eastern Time (ET)">Eastern Time (ET)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="workHours">Working Hours</Label>
                        <Input
                          id="workHours"
                          value={formData.workHours}
                          onChange={(e) => updateField("workHours", e.target.value)}
                          disabled={!isEditing}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-4 text-sm font-semibold text-gray-900">Notification Preferences</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                          <Bell className="h-5 w-5 text-[#667eea]" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                            <p className="text-xs text-gray-600">Receive updates about applications and messages</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-gray-300 text-[#667eea] focus:ring-[#667eea]"
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                          <Users className="h-5 w-5 text-[#667eea]" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Candidate Updates</p>
                            <p className="text-xs text-gray-600">Get notified when candidates apply or respond</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-gray-300 text-[#667eea] focus:ring-[#667eea]"
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "security" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-4 text-sm font-semibold text-gray-900">Account Security</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                          <Shield className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                            <p className="text-xs text-gray-600">Enhanced security for your account</p>
                          </div>
                        </div>
                        <Badge className="bg-green-50 text-green-700 border-green-200">Enabled</Badge>
                      </div>
                      
                      <div className="rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-gray-900">Password</h4>
                          <Button variant="outline" size="sm" className="rounded-lg">
                            Change Password
                          </Button>
                        </div>
                        <p className="text-xs text-gray-600">Last changed 3 months ago</p>
                      </div>

                      <div className="rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-gray-900">Login Sessions</h4>
                          <Button variant="outline" size="sm" className="rounded-lg">
                            View All Sessions
                          </Button>
                        </div>
                        <p className="text-xs text-gray-600">Currently signed in from 2 devices</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}