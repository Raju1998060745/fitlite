"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [stats, setStats] = useState({ workouts: 0, goal: 5, mobility: 0, volume: 0, volumeLabel: "Volume" });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    } else if (user) {
      checkActiveSession();
      // Fetch stats
      const token = localStorage.getItem('token');
      console.log("Fetching stats with token:", token ? "Token exists" : "No token");

      api.get('/stats/weekly', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).then(res => {
        console.log("Stats fetched:", res.data);
        setStats({
          workouts: res.data.workouts_completed,
          goal: res.data.workouts_goal,
          mobility: res.data.mobility_minutes,
          volume: res.data.volume_value,
          volumeLabel: res.data.volume_label
        });
      }).catch(e => console.error("Stats error", e));
    }
  }, [user, isLoading, router]);


  const checkActiveSession = async () => {
    try {
      const res = await api.get('/workouts/current/active');
      if (res.data) {
        setActiveSessionId(res.data.id);
      }
    } catch (e) {
      console.error("Error checking active session");
    }
  }

  if (isLoading || !user) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  const startSession = async (type: "morning" | "night") => {
    try {
      const response = await api.post('/workouts/start', { session_type: type });
      const sessionId = response.data.id;
      router.push(`/workout?id=${sessionId}`);
    } catch (error) {
      console.error("Failed to start session", error);
      alert("Failed to start session");
    }
  };

  const resumeSession = () => {
    if (activeSessionId) router.push(`/workout?id=${activeSessionId}`);
  };


  return (
    <main className="min-h-screen p-8 bg-[var(--color-background)] font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between pb-6 border-b border-[var(--color-border)]">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--color-primary)]">FitLog Lite</h1>
            <p className="text-[var(--color-secondary)] mt-1">Welcome back, {user.email}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={logout}>Logout</Button>
            <Button variant="primary" onClick={() => router.push('/checkin')}>Log Check-in</Button>
          </div>
        </header>

        {/* Quick Actions */}
        <section className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Morning Session</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[var(--color-secondary)] mb-4">
                Mobility + Light Core. Get existing for the day.
              </p>
              {activeSessionId ? (
                <Button className="w-full bg-green-600 hover:bg-green-700" onClick={resumeSession}>Resume Active Session</Button>
              ) : (
                <Button className="w-full" variant="primary" onClick={() => startSession("morning")}>Start Session</Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Night Session</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[var(--color-secondary)] mb-4">
                Strength + Cardio Circuit. Push your limits.
              </p>
              <Button className="w-full" variant="secondary" onClick={() => router.push('/plan')}>View Plan</Button>
            </CardContent>
          </Card>
        </section>

        {/* Stats Preview */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[var(--color-primary)]">Weekly Progress</h2>
            <Button variant="ghost" onClick={() => router.push('/stats')}>View Full Statistics &rarr;</Button>
          </div>
          <Card>
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold">{stats.workouts}/{stats.goal}</div>
                <p className="text-sm text-[var(--color-secondary)]">Workouts Completed</p>
              </div>
              <Button variant="outline" onClick={() => router.push('/stats')}>View Details</Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
