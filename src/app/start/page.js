"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { toast } from "sonner";
import { Toaster } from "../components/ui/sonner";

export default function StartPage() {
  const [nickname, setNickname] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createdProfile, setCreatedProfile] = useState(null);
  const router = useRouter();

  const handleCreateProfile = async () => {
    setIsCreating(true);
    try {
      const response = await fetch("/api/profile/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: nickname.trim() || "" }),
      });

      if (!response.ok) {
        throw new Error("Failed to create profile");
      }

      const profile = await response.json();
      setCreatedProfile(profile);
      toast.success("Profile created!");
    } catch (error) {
      console.error("Error creating profile:", error);
      toast.error("Failed to create profile. Please try again.");
      setIsCreating(false);
    }
  };

  const handleContinue = () => {
    if (createdProfile) {
      router.push(`/practice/${createdProfile.learnerId}`);
    }
  };

  if (createdProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center p-8">
        <Toaster />
        <Card className="p-8 bg-white shadow-lg max-w-md w-full text-center">
          <div className="mb-6">
            <div className="text-6xl font-bold text-black mb-4">
              {createdProfile.code}
            </div>
            <h2 className="text-2xl font-bold text-black mb-2">
              Your Code is {createdProfile.code}
            </h2>
            <p className="text-slate-600 mb-4">
              Write this code in your notebook.
            </p>
            <p className="text-slate-600 mb-6">
              Next time, go to <strong>/resume</strong> and enter this code.
            </p>
          </div>
          
          <Button
            onClick={handleContinue}
            className="w-full bg-black hover:bg-gray-800 text-white"
            size="lg"
          >
            Start Practicing
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center p-8">
      <Toaster />
      <Card className="p-8 bg-white shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-black mb-2 text-center">
          Create Your Practice Profile
        </h1>
        <p className="text-slate-600 mb-6 text-center">
          (Optional) Enter a nickname to personalize your experience
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nickname (Optional)
            </label>
            <Input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Max"
              className="w-full"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isCreating) {
                  handleCreateProfile();
                }
              }}
            />
          </div>
          
          <Button
            onClick={handleCreateProfile}
            disabled={isCreating}
            className="w-full bg-black hover:bg-gray-800 text-white"
            size="lg"
          >
            {isCreating ? "Creating..." : "Create My Practice"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

