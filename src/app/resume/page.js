"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { toast } from "sonner";
import { Toaster } from "../components/ui/sonner";

export default function ResumePage() {
  const [code, setCode] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const router = useRouter();

  const handleLookup = async () => {
    if (!code.trim()) {
      toast.error("Please enter your code");
      return;
    }

    setIsLookingUp(true);
    try {
      const response = await fetch("/api/profile/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 404) {
          toast.error("Code not found. Please check and try again.");
        } else {
          throw new Error(data.error || "Failed to lookup profile");
        }
        setIsLookingUp(false);
        return;
      }

      const profile = await response.json();
      toast.success(`Welcome back, ${profile.name}!`);
      router.push(`/practice/${profile.learnerId}`);
    } catch (error) {
      console.error("Error looking up profile:", error);
      toast.error("Failed to lookup profile. Please try again.");
      setIsLookingUp(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center p-8">
      <Toaster />
      <Card className="p-8 bg-white shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-black mb-2 text-center">
          Resume Your Practice
        </h1>
        <p className="text-slate-600 mb-6 text-center">
          Enter your code to continue where you left off
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Your Code
            </label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="4721"
              className="w-full text-center text-2xl font-mono"
              maxLength={4}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isLookingUp && code.trim()) {
                  handleLookup();
                }
              }}
            />
          </div>
          
          <Button
            onClick={handleLookup}
            disabled={isLookingUp || !code.trim()}
            className="w-full bg-black hover:bg-gray-800 text-white"
            size="lg"
          >
            {isLookingUp ? "Looking up..." : "Continue"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

