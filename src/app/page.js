"use client";

import { useRouter } from "next/navigation";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center p-8">
      <Card className="p-8 bg-white shadow-lg max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-black mb-2">
          French Audio Trainer
        </h1>
        <p className="text-slate-600 mb-8">
          Learn French vocabulary with audio! Create your practice profile to get started.
        </p>
        
        <div className="space-y-4">
          <Button
            onClick={() => router.push("/start")}
            className="w-full bg-black hover:bg-gray-800 text-white"
            size="lg"
          >
            Start New Profile
          </Button>
          
          <Button
            onClick={() => router.push("/resume")}
            className="w-full border-gray-300 text-black hover:bg-gray-50"
            variant="outline"
            size="lg"
          >
            Resume Practice
          </Button>
        </div>
      </Card>
    </div>
  );
}
