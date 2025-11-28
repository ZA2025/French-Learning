"use client";

import { useState, useEffect } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Toaster } from "../components/ui/sonner";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";

export default function AdminPage() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [storedSecret, setStoredSecret] = useState("");
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    key: null,
    name: null,
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const response = await fetch(`/api/admin/keys?secret=${encodeURIComponent(password)}`);
      if (response.ok) {
        setIsAuthenticated(true);
        setStoredSecret(password);
        const data = await response.json();
        setKeys(data.keys || []);
        toast.success("Authenticated successfully");
      } else {
        toast.error("Invalid password");
      }
    } catch (err) {
      toast.error("Authentication failed");
    } finally {
      setAuthLoading(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      fetchKeys();
    }
  }, []);

  const fetchKeys = async (secret = null) => {
    setLoading(true);
    setError(null);
    try {
      const url = secret || storedSecret 
        ? `/api/admin/keys?secret=${encodeURIComponent(secret || storedSecret)}`
        : "/api/admin/keys";
      
      const response = await fetch(url);
      if (response.status === 401) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
      if (!response.ok) {
        throw new Error("Failed to fetch keys");
      }
      const data = await response.json();
      setKeys(data.keys || []);
      setIsAuthenticated(true);
    } catch (err) {
      if (err.message.includes("401") || err.message.includes("Unauthorized")) {
        setIsAuthenticated(false);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.key) return;

    try {
      const headers = {
        "Content-Type": "application/json",
      };
      
      // Only add Authorization header if we have a stored secret (production mode)
      if (storedSecret) {
        headers.Authorization = `Bearer ${storedSecret}`;
      }

      const response = await fetch("/api/admin/delete", {
        method: "POST",
        headers,
        body: JSON.stringify({ key: deleteDialog.key }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete");
      }

      toast.success("Deleted successfully");
      setDeleteDialog({ open: false, key: null, name: null });
      fetchKeys(); // Refresh the list
    } catch (err) {
      toast.error(err.message || "Failed to delete");
      console.error(err);
    }
  };

  // Organize keys into profiles with their related data
  const organizeData = () => {
    const profilesMap = new Map();
    const codesMap = new Map();
    const progressMap = new Map();

    // First pass: collect all data
    keys.forEach((item) => {
      if (item.key.startsWith("profile:")) {
        const learnerId = item.key.replace("profile:", "");
        profilesMap.set(learnerId, item.value);
      } else if (item.key.startsWith("code:")) {
        const code = item.key.replace("code:", "");
        codesMap.set(code, item.value);
      } else if (item.key.startsWith("progress:")) {
        const learnerId = item.key.replace("progress:", "");
        progressMap.set(learnerId, item.value);
      }
    });

    // Build combined profiles table
    const profilesData = [];
    profilesMap.forEach((profile, learnerId) => {
      const code = profile.code;
      const progress = progressMap.get(learnerId);
      const modulesCount = progress?.modules?.length || 0;
      const entriesCount =
        progress?.modules?.reduce(
          (sum, m) =>
            sum + m.lessons.reduce((s, l) => s + (l.entries?.length || 0), 0),
          0
        ) || 0;

      profilesData.push({
        learnerId,
        name: profile.name || "No name",
        code: profile.code,
        createdAt: profile.createdAt,
        modulesCount,
        entriesCount,
        progress,
      });
    });

    return profilesData;
  };

  const profilesData = organizeData();

  // Show login form if not authenticated
  if (!isAuthenticated && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 p-8">
        <div className="max-w-md mx-auto mt-20">
          <Card className="p-8">
            <h1 className="text-2xl font-bold mb-4">Admin Access</h1>
            <p className="text-slate-600 mb-6">
              This page is protected. Please enter the admin password.
            </p>
            <form onSubmit={handleLogin}>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="mb-4"
                required
              />
              <Button
                type="submit"
                disabled={authLoading}
                className="w-full bg-black text-white"
              >
                {authLoading ? "Authenticating..." : "Login"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <Card className="p-8 text-center">
            <p>Loading keys...</p>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <Card className="p-8">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <Button onClick={fetchKeys}>Retry</Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 p-8">
      <Toaster />
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">KV Database Admin</h1>
            <p className="text-slate-600">
              Total profiles: {profilesData.length}
            </p>
          </div>
          <Button onClick={fetchKeys} className="bg-black text-white">
            Refresh
          </Button>
        </div>

        {/* Profiles Table */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Learner Profiles</h2>
          {profilesData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">Name</th>
                    <th className="text-left p-3 font-semibold">Code</th>
                    <th className="text-left p-3 font-semibold">Learner ID</th>
                    <th className="text-left p-3 font-semibold">Modules</th>
                    <th className="text-left p-3 font-semibold">Entries</th>
                    <th className="text-left p-3 font-semibold">Created</th>
                    <th className="text-left p-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {profilesData.map((profile) => (
                    <tr key={profile.learnerId} className="border-b hover:bg-gray-50">
                      <td className="p-3">{profile.name}</td>
                      <td className="p-3 font-mono text-sm">{profile.code}</td>
                      <td className="p-3 font-mono text-xs text-slate-500">
                        {profile.learnerId.substring(0, 20)}...
                      </td>
                      <td className="p-3">{profile.modulesCount}</td>
                      <td className="p-3">{profile.entriesCount}</td>
                      <td className="p-3 text-sm text-slate-600">
                        {profile.createdAt
                          ? new Date(profile.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="p-3">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            setDeleteDialog({
                              open: true,
                              key: `profile:${profile.learnerId}`,
                              name: profile.name,
                            });
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">
              No profiles found.
            </p>
          )}
        </Card>

        {/* All Keys Table */}
        
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog({ ...deleteDialog, open })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the key: <strong>{deleteDialog.key}</strong>
              {deleteDialog.name && (
                <>
                  <br />
                  Profile: <strong>{deleteDialog.name}</strong>
                </>
              )}
              <br />
              <span className="text-red-600 font-semibold">
                This action cannot be undone. Related data (code, progress) will also be deleted.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
