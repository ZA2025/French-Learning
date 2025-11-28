"use client";

import { useState, useEffect } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Toaster } from "../components/ui/sonner";
import { toast } from "sonner";

export default function AdminPage() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedKey, setSelectedKey] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [storedSecret, setStoredSecret] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const response = await fetch(`/api/admin/keys?secret=${encodeURIComponent(password)}`);
      if (response.ok) {
        setIsAuthenticated(true);
        setStoredSecret(password); // Store the secret for future requests
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
    // Try to authenticate automatically in development
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
        // Not authenticated - show login form
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

  const groupedKeys = {
    codes: keys.filter((k) => k.key.startsWith("code:")),
    profiles: keys.filter((k) => k.key.startsWith("profile:")),
    progress: keys.filter((k) => k.key.startsWith("progress:")),
    other: keys.filter(
      (k) =>
        !k.key.startsWith("code:") &&
        !k.key.startsWith("profile:") &&
        !k.key.startsWith("progress:")
    ),
  };

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
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-black mb-2">KV Database Admin</h1>
          <p className="text-slate-600 mb-4">
            Total keys: {keys.length}
          </p>
          <Button onClick={fetchKeys} className="bg-black text-white">
            Refresh
          </Button>
        </div>

        {/* Codes */}
        {groupedKeys.codes.length > 0 && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Codes ({groupedKeys.codes.length})</h2>
            <div className="space-y-2">
              {groupedKeys.codes.map((item) => (
                <div
                  key={item.key}
                  className="p-3 border rounded cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedKey(selectedKey === item.key ? null : item.key)}
                >
                  <div className="font-mono text-sm font-bold">{item.key}</div>
                  {selectedKey === item.key && (
                    <div className="mt-2 text-slate-600">
                      Value: <span className="font-mono">{String(item.value)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Profiles */}
        {groupedKeys.profiles.length > 0 && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Profiles ({groupedKeys.profiles.length})</h2>
            <div className="space-y-2">
              {groupedKeys.profiles.map((item) => (
                <div
                  key={item.key}
                  className="p-3 border rounded cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedKey(selectedKey === item.key ? null : item.key)}
                >
                  <div className="font-mono text-sm font-bold">{item.key}</div>
                  {selectedKey === item.key && (
                    <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(item.value, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Progress */}
        {groupedKeys.progress.length > 0 && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Progress ({groupedKeys.progress.length})</h2>
            <div className="space-y-2">
              {groupedKeys.progress.map((item) => (
                <div
                  key={item.key}
                  className="p-3 border rounded cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedKey(selectedKey === item.key ? null : item.key)}
                >
                  <div className="font-mono text-sm font-bold">{item.key}</div>
                  {selectedKey === item.key && (
                    <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-96">
                      {JSON.stringify(item.value, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Other Keys */}
        {groupedKeys.other.length > 0 && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Other Keys ({groupedKeys.other.length})</h2>
            <div className="space-y-2">
              {groupedKeys.other.map((item) => (
                <div
                  key={item.key}
                  className="p-3 border rounded cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedKey(selectedKey === item.key ? null : item.key)}
                >
                  <div className="font-mono text-sm font-bold">{item.key}</div>
                  {selectedKey === item.key && (
                    <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(item.value, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {keys.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-slate-600">No keys found in the database.</p>
          </Card>
        )}
      </div>
    </div>
  );
}

